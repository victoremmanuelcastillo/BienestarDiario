import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { NutritionixService } from '../../services/nutritionix.service';
import { SpoonacularService } from '../../services/spoonacular.service';

Chart.register(...registerables);

interface NutritionSummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface IMCRecord {
  date: Date;
  imc: number;
  category: string;
}

interface RecipeInteraction {
  date: string;
  viewed: number;
  favorited: number;
}

@Component({
  selector: 'app-graficas-nutricion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './graficas-nutricion.component.html',
  styleUrls: ['./graficas-nutricion.component.css']
})
export class GraficasNutricionComponent implements OnInit {
  // Filtros de fecha
  startDate: string = this.getDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 días atrás
  endDate: string = this.getDateString(new Date());
  
  // Datos para gráficas
  nutritionHistory: NutritionSummary[] = [];
  imcHistory: IMCRecord[] = [];
  recipeInteractions: RecipeInteraction[] = [];
  
  // Pestañas de gráficas
  activeTab: 'calories' | 'macros' | 'imc' | 'recipes' = 'calories';
  
  // Gráficas
  caloriesChart: Chart | null = null;
  macrosChart: Chart | null = null;
  imcChart: Chart | null = null;
  recipesChart: Chart | null = null;
  
  // Resumen de datos
  summaryData = {
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFat: 0,
    caloriesTrend: 0,
    imcTrend: 0,
    mostViewedRecipeCategory: '',
    mostFavoritedRecipeCategory: ''
  };
  
  constructor(
    private nutritionixService: NutritionixService,
    private spoonacularService: SpoonacularService
  ) {}
  
  ngOnInit(): void {
    this.loadAllData();
    setTimeout(() => {
      this.renderAllCharts();
    }, 500);
  }
  
  getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  loadAllData(): void {
    this.loadNutritionHistory();
    this.loadIMCHistory();
    this.loadRecipeInteractions();
    this.calculateSummaryData();
  }
  
  applyFilters(): void {
    this.loadAllData();
    this.renderAllCharts();
  }
  
  loadNutritionHistory(): void {
    // Cargar datos de localStorage
    const saved = localStorage.getItem('nutritionHistory');
    if (saved) {
      const allHistory = JSON.parse(saved);
      
      // Filtrar por fechas
      this.nutritionHistory = allHistory
        .filter((day: any) => {
          const date = day.date;
          return date >= this.startDate && date <= this.endDate;
        })
        .map((day: any) => ({
          date: day.date,
          calories: day.totals.calories,
          protein: day.totals.protein,
          carbs: day.totals.carbs,
          fat: day.totals.fat,
          fiber: day.totals.fiber
        }));
    }
  }
  
  loadIMCHistory(): void {
    // Cargar datos de localStorage
    const saved = localStorage.getItem('imcHistory');
    if (saved) {
      const allHistory = JSON.parse(saved);
      
      // Filtrar por fechas y convertir fechas
      this.imcHistory = allHistory
        .map((record: any) => ({
          ...record,
          date: new Date(record.date)
        }))
        .filter((record: IMCRecord) => {
          const dateStr = this.getDateString(record.date);
          return dateStr >= this.startDate && dateStr <= this.endDate;
        });
    }
  }
  
  loadRecipeInteractions(): void {
    // Cargar favoritos
    const favorites = localStorage.getItem('favoriteRecipes');
    const recentlyViewed = localStorage.getItem('recentlyViewedRecipes');
    
    const favoritesData = favorites ? JSON.parse(favorites) : [];
    const viewedData = recentlyViewed ? JSON.parse(recentlyViewed) : [];
    
    // Crear mapa de interacciones por fecha
    const interactionsByDate = new Map<string, {viewed: number, favorited: number}>();
    
    // Procesar vistas
    viewedData.forEach((recipe: any) => {
      const viewDate = new Date(recipe.viewedAt);
      const dateStr = this.getDateString(viewDate);
      
      if (dateStr >= this.startDate && dateStr <= this.endDate) {
        if (!interactionsByDate.has(dateStr)) {
          interactionsByDate.set(dateStr, {viewed: 0, favorited: 0});
        }
        const current = interactionsByDate.get(dateStr)!;
        interactionsByDate.set(dateStr, {...current, viewed: current.viewed + 1});
      }
    });
    
    // Procesar favoritos (asumiendo que tienen una fecha de adición)
    favoritesData.forEach((recipe: any) => {
      // Si no hay fecha de adición, usar la fecha actual
      const addedDate = recipe.addedToFavoritesAt ? new Date(recipe.addedToFavoritesAt) : new Date();
      const dateStr = this.getDateString(addedDate);
      
      if (dateStr >= this.startDate && dateStr <= this.endDate) {
        if (!interactionsByDate.has(dateStr)) {
          interactionsByDate.set(dateStr, {viewed: 0, favorited: 0});
        }
        const current = interactionsByDate.get(dateStr)!;
        interactionsByDate.set(dateStr, {...current, favorited: current.favorited + 1});
      }
    });
    
    // Convertir mapa a array
    this.recipeInteractions = Array.from(interactionsByDate.entries())
      .map(([date, data]) => ({
        date,
        viewed: data.viewed,
        favorited: data.favorited
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  calculateSummaryData(): void {
    // Calcular promedios de nutrición
    if (this.nutritionHistory.length > 0) {
      this.summaryData.avgCalories = this.nutritionHistory.reduce((sum, day) => sum + day.calories, 0) / this.nutritionHistory.length;
      this.summaryData.avgProtein = this.nutritionHistory.reduce((sum, day) => sum + day.protein, 0) / this.nutritionHistory.length;
      this.summaryData.avgCarbs = this.nutritionHistory.reduce((sum, day) => sum + day.carbs, 0) / this.nutritionHistory.length;
      this.summaryData.avgFat = this.nutritionHistory.reduce((sum, day) => sum + day.fat, 0) / this.nutritionHistory.length;
      
      // Calcular tendencia de calorías (comparar primera mitad con segunda mitad)
      if (this.nutritionHistory.length >= 4) {
        const midpoint = Math.floor(this.nutritionHistory.length / 2);
        const firstHalf = this.nutritionHistory.slice(0, midpoint);
        const secondHalf = this.nutritionHistory.slice(midpoint);
        
        const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.calories, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.calories, 0) / secondHalf.length;
        
        this.summaryData.caloriesTrend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      }
    }
    
    // Calcular tendencia de IMC
    if (this.imcHistory.length >= 2) {
      const firstIMC = this.imcHistory[0].imc;
      const lastIMC = this.imcHistory[this.imcHistory.length - 1].imc;
      
      this.summaryData.imcTrend = ((lastIMC - firstIMC) / firstIMC) * 100;
    }
  }
  
  renderAllCharts(): void {
    this.renderCaloriesChart();
    this.renderMacrosChart();
    this.renderIMCChart();
    this.renderRecipesChart();
  }
  
  renderCaloriesChart(): void {
    const canvas = document.getElementById('caloriesChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    if (this.caloriesChart) {
      this.caloriesChart.destroy();
    }
    
    // Preparar datos
    const labels = this.nutritionHistory.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });
    
    const caloriesData = this.nutritionHistory.map(day => day.calories);
    
    // Crear gráfica
    this.caloriesChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Calorías',
          data: caloriesData,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Calorías (kcal)'
            }
          }
        }
      }
    });
  }
  
  renderMacrosChart(): void {
    const canvas = document.getElementById('macrosChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    if (this.macrosChart) {
      this.macrosChart.destroy();
    }
    
    // Preparar datos
    const labels = this.nutritionHistory.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });
    
    const proteinData = this.nutritionHistory.map(day => day.protein);
    const carbsData = this.nutritionHistory.map(day => day.carbs);
    const fatData = this.nutritionHistory.map(day => day.fat);
    const fiberData = this.nutritionHistory.map(day => day.fiber);
    
    // Crear gráfica
    this.macrosChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Proteínas',
            data: proteinData,
            backgroundColor: '#3498db',
          },
          {
            label: 'Carbohidratos',
            data: carbsData,
            backgroundColor: '#f39c12',
          },
          {
            label: 'Grasas',
            data: fatData,
            backgroundColor: '#e74c3c',
          },
          {
            label: 'Fibra',
            data: fiberData,
            backgroundColor: '#2ecc71',
          }
        ]
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
          },
          x: {
            stacked: false
          }
        }
      }
    });
  }
  
  renderIMCChart(): void {
    const canvas = document.getElementById('imcChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    if (this.imcChart) {
      this.imcChart.destroy();
    }
    
    // Preparar datos
    const sortedHistory = [...this.imcHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const labels = sortedHistory.map(record => 
      record.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    );
    
    const imcData = sortedHistory.map(record => record.imc);
    
    // Crear gráfica
    this.imcChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'IMC',
          data: imcData,
          borderColor: '#9b59b6',
          backgroundColor: 'rgba(155, 89, 182, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            min: Math.max(0, Math.min(...imcData) - 2),
            max: Math.max(...imcData) + 2,
            ticks: {
              stepSize: 1
            },
            title: {
              display: true,
              text: 'IMC'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex;
                return `Categoría: ${sortedHistory[index].category}`;
              }
            }
          }
        }
      }
    });
  }
  
  renderRecipesChart(): void {
    const canvas = document.getElementById('recipesChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    if (this.recipesChart) {
      this.recipesChart.destroy();
    }
    
    // Preparar datos
    const labels = this.recipeInteractions.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });
    
    const viewedData = this.recipeInteractions.map(day => day.viewed);
    const favoritedData = this.recipeInteractions.map(day => day.favorited);
    
    // Crear gráfica
    this.recipesChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Recetas vistas',
            data: viewedData,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Recetas favoritas',
            data: favoritedData,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Número de recetas'
            }
          }
        }
      }
    });
  }
  
  // Métodos para cambiar entre pestañas
  setActiveTab(tab: 'calories' | 'macros' | 'imc' | 'recipes'): void {
    this.activeTab = tab;
    setTimeout(() => {
      this.renderAllCharts();
    }, 100);
  }
  
  // Método para exportar datos
  exportData(): void {
    // Crear objeto con todos los datos
    const exportData = {
      nutritionHistory: this.nutritionHistory,
      imcHistory: this.imcHistory,
      recipeInteractions: this.recipeInteractions,
      summaryData: this.summaryData,
      exportDate: new Date().toISOString(),
      period: {
        startDate: this.startDate,
        endDate: this.endDate
      }
    };
    
    // Convertir a JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Crear blob y descargar
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutricion-resumen-${this.startDate}-${this.endDate}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  
  // Métodos para obtener clases CSS según tendencias
  getTrendClass(value: number): string {
    if (value > 0) return 'trend-up';
    if (value < 0) return 'trend-down';
    return 'trend-neutral';
  }
  
  getTrendIcon(value: number): string {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  }
  
  // Método para formatear porcentajes
  formatPercent(value: number): string {
    return value.toFixed(1) + '%';
  }
}