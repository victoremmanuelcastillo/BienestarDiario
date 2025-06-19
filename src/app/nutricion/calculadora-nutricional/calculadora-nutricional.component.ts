import { Component, OnInit, Pipe, PipeTransform, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NutritionixService } from '../../services/nutritionix.service';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CalculadoraNutricionalEmergenciaComponent } from './emergencia.component';

Chart.register(...registerables);

@Pipe({
  name: 'filterByMealType',
  standalone: true
})
export class FilterByMealTypePipe implements PipeTransform {
  transform(entries: FoodEntry[], mealType: string): FoodEntry[] {
    if (!entries) return [];
    return entries.filter(entry => entry.mealType === mealType);
  }
}

interface FoodEntry {
  id: string;
  date: Date;
  food_name: string;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface DailyNutrition {
  date: string; // YYYY-MM-DD
  entries: FoodEntry[];
  totals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
}

@Component({
  selector: 'app-calculadora-nutricional',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    FilterByMealTypePipe,
    CalculadoraNutricionalEmergenciaComponent
  ],
  templateUrl: './calculadora-nutricional.component.html',
  styleUrls: ['./calculadora-nutricional.component.css']
})
export class CalculadoraNutricionalComponent implements OnInit, AfterViewInit {
  nutritionForm: FormGroup;
  nutritionInfo: any = null;
  isLoadingNutrition = false;
  
  selectedDate: Date = new Date();
  dailyEntries: FoodEntry[] = [];
  dailyTotals = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0
  };
  
  nutritionHistory: DailyNutrition[] = [];
  selectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'breakfast';
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  calorieGoal = 2000; // Valor predeterminado
  proteinGoal = 50; // en gramos
  fatGoal = 70; // en gramos
  carbsGoal = 260; // en gramos
  fiberGoal = 25; // en gramos
  
  calorieChart: Chart | null = null;
  macroChart: Chart | null = null;
  
  // Nuevo estado para controlar la visibilidad del componente de emergencia
  showEmergencyCalculator = false;
  apiError = false;
  
  constructor(
    private fb: FormBuilder,
    private nutritionixService: NutritionixService
  ) {
    this.nutritionForm = this.fb.group({
      ingredient: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadUserGoals();
    this.loadNutritionHistory();
    this.selectDate(new Date());
  }
  
  ngAfterViewInit(): void {
    // Renderizar gráficas después de que la vista se haya inicializado
    setTimeout(() => {
      this.renderCharts();
    }, 500);
  }
  
  // Método para seleccionar el tipo de comida
  selectMealType(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): void {
    this.selectedMealType = mealType;
    console.log('Tipo de comida seleccionado:', mealType);
  }
  
  // Método para obtener la etiqueta del tipo de comida seleccionada
  getMealTypeLabel(): string {
    return this.getMealTypeTranslation(this.selectedMealType);
  }
  
  // Método para traducir el tipo de comida
  getMealTypeTranslation(mealType: string): string {
    switch(mealType) {
      case 'breakfast': return 'Desayuno';
      case 'lunch': return 'Almuerzo';
      case 'dinner': return 'Cena';
      case 'snack': return 'Snacks';
      default: return mealType;
    }
  }
  
  // Método para calcular el total de un nutriente para un tipo de comida
  calculateMealTypeTotal(mealType: string, nutrient: string): number {
    if (!this.dailyEntries || this.dailyEntries.length === 0) return 0;
    
    const filteredEntries = this.dailyEntries.filter(entry => entry.mealType === mealType);
    
    return filteredEntries.reduce((sum, entry) => {
      switch(nutrient) {
        case 'calories': return sum + (entry.calories || 0);
        case 'protein': return sum + (entry.protein || 0);
        case 'carbs': return sum + (entry.carbs || 0);
        case 'fat': return sum + (entry.fat || 0);
        case 'fiber': return sum + (entry.fiber || 0);
        default: return sum;
      }
    }, 0);
  }
  
  loadUserGoals() {
    const savedGoals = localStorage.getItem('nutritionGoals');
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);
      this.calorieGoal = goals.calories || 2000;
      this.proteinGoal = goals.protein || 50;
      this.fatGoal = goals.fat || 70;
      this.carbsGoal = goals.carbs || 260;
      this.fiberGoal = goals.fiber || 25;
    }
  }
  
  saveUserGoals() {
    const goals = {
      calories: this.calorieGoal,
      protein: this.proteinGoal,
      fat: this.fatGoal,
      carbs: this.carbsGoal,
      fiber: this.fiberGoal
    };
    localStorage.setItem('nutritionGoals', JSON.stringify(goals));
  }
  
  loadNutritionHistory() {
    const saved = localStorage.getItem('nutritionHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.nutritionHistory = parsed.map((day: any) => ({
          ...day,
          entries: day.entries.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date)
          }))
        }));
      } catch (error) {
        console.error('Error parsing nutrition history:', error);
        this.nutritionHistory = [];
      }
    }
  }
  
  saveNutritionHistory() {
    localStorage.setItem('nutritionHistory', JSON.stringify(this.nutritionHistory));
  }
  
  selectDate(date: Date) {
    this.selectedDate = new Date(date);
    this.selectedDate.setHours(0, 0, 0, 0);
    
    const dateString = this.formatDate(this.selectedDate);
    
    // Buscar entradas para esta fecha
    const dayData = this.nutritionHistory.find(day => day.date === dateString);
    
    if (dayData) {
      this.dailyEntries = dayData.entries;
      this.dailyTotals = dayData.totals;
    } else {
      this.dailyEntries = [];
      this.dailyTotals = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0
      };
    }
    
    // Renderizar gráficas después de cargar los datos
    setTimeout(() => {
      this.renderCharts();
    }, 100);
  }
  
  formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  getNutritionInfo(): void {
    const { ingredient } = this.nutritionForm.value;
    
    if (!ingredient) return;
    
    this.isLoadingNutrition = true;
    this.nutritionInfo = null;
    this.apiError = false;
    
    this.nutritionixService.getNutritionInfo(ingredient).subscribe({
      next: (data) => {
        console.log('Nutrition data received:', data);
        this.nutritionInfo = data;
        this.isLoadingNutrition = false;
        this.showEmergencyCalculator = false;
      },
      error: (error) => {
        console.error('Error fetching nutrition info:', error);
        this.isLoadingNutrition = false;
        this.apiError = true;
        // En lugar de mostrar una alerta, activamos el componente de emergencia
        this.showEmergencyCalculator = true;
      }
    });
  }
  
  // Método para manejar la adición de alimentos desde el componente de emergencia
  handleAddFoodFromEmergency(entry: FoodEntry): void {
    // Asegurarse de que la entrada tenga la fecha correcta
    entry.date = new Date(this.selectedDate);
    entry.mealType = this.selectedMealType;
    
    console.log('Adding food from emergency component:', entry);
    
    this.dailyEntries.push(entry);
    
    // Actualizar totales
    this.updateDailyTotals();
    
    // Guardar en historial
    this.saveDailyData();
    
    // Actualizar gráficas
    this.renderCharts();
    
    // Ocultar el componente de emergencia
    this.showEmergencyCalculator = false;
    this.apiError = false;
  }
  
  // Método para mostrar manualmente la calculadora de emergencia
  toggleEmergencyCalculator(): void {
    this.showEmergencyCalculator = !this.showEmergencyCalculator;
  }
  
  addFoodEntry() {
    if (!this.nutritionInfo || !this.nutritionInfo.foods || this.nutritionInfo.foods.length === 0) {
      return;
    }
    
    const food = this.nutritionInfo.foods[0];
    
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      date: new Date(this.selectedDate),
      food_name: food.food_name,
      serving_qty: food.serving_qty,
      serving_unit: food.serving_unit,
      serving_weight_grams: food.serving_weight_grams,
      calories: food.nf_calories,
      protein: food.nf_protein,
      fat: food.nf_total_fat,
      carbs: food.nf_total_carbohydrate,
      fiber: food.nf_dietary_fiber,
      mealType: this.selectedMealType
    };
    
    console.log('Adding food entry:', newEntry);
    
    this.dailyEntries.push(newEntry);
    
    // Actualizar totales
    this.updateDailyTotals();
    
    // Guardar en historial
    this.saveDailyData();
    
    // Limpiar formulario
    this.nutritionForm.reset();
    this.nutritionInfo = null;
    
    // Actualizar gráficas
    this.renderCharts();
  }
  
  updateDailyTotals() {
    this.dailyTotals = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0
    };
    
    this.dailyEntries.forEach(entry => {
      this.dailyTotals.calories += entry.calories || 0;
      this.dailyTotals.protein += entry.protein || 0;
      this.dailyTotals.fat += entry.fat || 0;
      this.dailyTotals.carbs += entry.carbs || 0;
      this.dailyTotals.fiber += entry.fiber || 0;
    });
    
    console.log('Updated daily totals:', this.dailyTotals);
  }
  
  saveDailyData() {
    const dateString = this.formatDate(this.selectedDate);
    
    // Buscar si ya existe un registro para esta fecha
    const existingIndex = this.nutritionHistory.findIndex(day => day.date === dateString);
    
    if (existingIndex >= 0) {
      // Actualizar registro existente
      this.nutritionHistory[existingIndex] = {
        date: dateString,
        entries: this.dailyEntries,
        totals: this.dailyTotals
      };
    } else {
      // Crear nuevo registro
      this.nutritionHistory.push({
        date: dateString,
        entries: this.dailyEntries,
        totals: this.dailyTotals
      });
    }
    
    // Guardar en localStorage
    this.saveNutritionHistory();
    console.log('Saved daily data:', this.nutritionHistory);
  }
  
  removeFoodEntry(entryId: string) {
    console.log('Removing food entry with ID:', entryId);
    this.dailyEntries = this.dailyEntries.filter(entry => entry.id !== entryId);
    this.updateDailyTotals();
    this.saveDailyData();
    this.renderCharts();
  }
  
  renderCharts() {
    console.log('Rendering charts with data:', this.dailyEntries);
    this.renderCalorieChart();
    this.renderMacroChart();
  }
  
  renderCalorieChart() {
    const canvas = document.getElementById('calorieChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element for calorie chart not found');
      return;
    }
    
    if (this.calorieChart) {
      this.calorieChart.destroy();
    }
    
    // Preparar datos para la gráfica
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealLabels = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks'];
    const mealColors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'];
    
    const mealCalories = mealTypes.map(type => {
      return this.calculateMealTypeTotal(type, 'calories');
    });
    
    console.log('Meal calories for chart:', mealCalories);
    
    this.calorieChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: mealLabels,
        datasets: [{
          data: mealCalories,
          backgroundColor: mealColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const total = mealCalories.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${context.label}: ${value.toFixed(0)} kcal (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  renderMacroChart() {
    const canvas = document.getElementById('macroChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element for macro chart not found');
      return;
    }
    
    if (this.macroChart) {
      this.macroChart.destroy();
    }
    
    // Calcular porcentajes de macronutrientes
    const totalCalories = this.dailyTotals.calories;
    
    // Calorías de cada macronutriente
    const proteinCalories = this.dailyTotals.protein * 4; // 4 kcal por gramo
    const fatCalories = this.dailyTotals.fat * 9; // 9 kcal por gramo
    const carbCalories = this.dailyTotals.carbs * 4; // 4 kcal por gramo
    
    // Porcentajes
    const proteinPercentage = totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
    const fatPercentage = totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;
    const carbPercentage = totalCalories > 0 ? (carbCalories / totalCalories) * 100 : 0;
    
    console.log('Macro data for chart:', {
      protein: this.dailyTotals.protein,
      fat: this.dailyTotals.fat,
      carbs: this.dailyTotals.carbs,
      percentages: {
        protein: proteinPercentage,
        fat: fatPercentage,
        carbs: carbPercentage
      }
    });
    
    this.macroChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Proteínas', 'Grasas', 'Carbohidratos'],
        datasets: [{
          label: 'Gramos',
          data: [
            this.dailyTotals.protein,
            this.dailyTotals.fat,
            this.dailyTotals.carbs
          ],
          backgroundColor: [
            '#3498db',
            '#e74c3c',
            '#f39c12'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Gramos'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex;
                if (index === 0) {
                  return `${proteinPercentage.toFixed(1)}% de calorías totales`;
                } else if (index === 1) {
                  return `${fatPercentage.toFixed(1)}% de calorías totales`;
                } else {
                  return `${carbPercentage.toFixed(1)}% de calorías totales`;
                }
              }
            }
          }
        }
      }
    });
  }
  
  getNutritionDetails(): any[] {
    if (!this.nutritionInfo || !this.nutritionInfo.foods || this.nutritionInfo.foods.length === 0) {
      return [];
    }
    
    const food = this.nutritionInfo.foods[0];
    
    // Verificar que todos los campos necesarios existan
    if (!food) return [];
    
    // Crear un array con los nutrientes principales
    const mainNutrients = [
      { label: 'Calorías', quantity: food.nf_calories || 0, unit: 'kcal' },
      { label: 'Grasas totales', quantity: food.nf_total_fat || 0, unit: 'g' },
      { label: 'Grasas saturadas', quantity: food.nf_saturated_fat || 0, unit: 'g' },
      { label: 'Colesterol', quantity: food.nf_cholesterol || 0, unit: 'mg' },
      { label: 'Sodio', quantity: food.nf_sodium || 0, unit: 'mg' },
      { label: 'Carbohidratos totales', quantity: food.nf_total_carbohydrate || 0, unit: 'g' },
      { label: 'Fibra dietética', quantity: food.nf_dietary_fiber || 0, unit: 'g' },
      { label: 'Azúcares', quantity: food.nf_sugars || 0, unit: 'g' },
      { label: 'Proteínas', quantity: food.nf_protein || 0, unit: 'g' },
      { label: 'Potasio', quantity: food.nf_potassium || 0, unit: 'mg' }
    ];
    
    // Filtrar solo los nutrientes que tienen valores
    return mainNutrients.filter(nutrient => 
      nutrient.quantity !== undefined && 
      nutrient.quantity !== null && 
      !isNaN(nutrient.quantity)
    );
  }
  
  isOverGoal(nutrient: string): boolean {
    switch (nutrient) {
      case 'calories':
        return this.dailyTotals.calories > this.calorieGoal;
      case 'protein':
        return this.dailyTotals.protein > this.proteinGoal;
      case 'fat':
        return this.dailyTotals.fat > this.fatGoal;
      case 'carbs':
        return this.dailyTotals.carbs > this.carbsGoal;
      case 'fiber':
        return this.dailyTotals.fiber > this.fiberGoal;
      default:
        return false;
    }
  }
  
  getGoalPercentage(nutrient: string): number {
    switch (nutrient) {
      case 'calories':
        return (this.dailyTotals.calories / this.calorieGoal) * 100;
      case 'protein':
        return (this.dailyTotals.protein / this.proteinGoal) * 100;
      case 'fat':
        return (this.dailyTotals.fat / this.fatGoal) * 100;
      case 'carbs':
        return (this.dailyTotals.carbs / this.carbsGoal) * 100;
      case 'fiber':
        return (this.dailyTotals.fiber / this.fiberGoal) * 100;
      default:
        return 0;
    }
  }
  
  previousDay() {
    const prevDate = new Date(this.selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    this.selectDate(prevDate);
  }
  
  nextDay() {
    const nextDate = new Date(this.selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    this.selectDate(nextDate);
  }
  
  today() {
    this.selectDate(new Date());
  }
}