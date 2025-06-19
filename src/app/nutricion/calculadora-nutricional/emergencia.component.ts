import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving_size: string;
  category: 'frutas' | 'verduras' | 'proteinas' | 'granos' | 'lacteos' | 'otros';
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

@Component({
  selector: 'app-calculadora-nutricional-emergencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="emergency-calculator">
      <div class="emergency-header">
        <h3>Calculadora Nutricional Offline</h3>
        <p class="emergency-note">Esta calculadora se utiliza cuando no hay conexión a la API de nutrición.</p>
      </div>
      
      <div class="search-container">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Buscar alimento..." 
            class="search-input"
            (input)="filterFoods()"
          >
          <select [(ngModel)]="selectedCategory" (change)="filterFoods()" class="category-select">
            <option value="all">Todas las categorías</option>
            <option value="frutas">Frutas</option>
            <option value="verduras">Verduras</option>
            <option value="proteinas">Proteínas</option>
            <option value="granos">Granos y cereales</option>
            <option value="lacteos">Lácteos</option>
            <option value="otros">Otros</option>
          </select>
        </div>
      </div>
      
      <div class="food-list">
        <div *ngIf="filteredFoods.length === 0" class="no-results">
          No se encontraron  los alimentos. Intenta con otra búsqueda.
        </div>
        
        <div *ngFor="let food of filteredFoods" class="food-item" (click)="selectFood(food)">
          <div class="food-name">{{ food.name }}</div>
          <div class="food-details">
            <span>{{ food.calories }} kcal</span>
            <span>{{ food.serving_size }}</span>
          </div>
        </div>
      </div>
      
      <div *ngIf="selectedFood" class="selected-food">
        <h4>{{ selectedFood.name }}</h4>
        
        <div class="portion-selector">
          <label for="portions">Porciones:</label>
          <input 
            type="number" 
            id="portions" 
            [(ngModel)]="portions" 
            min="0.25" 
            max="10" 
            step="0.25"
            (change)="updateNutrition()"
          >
          <span>{{ selectedFood.serving_size }}</span>
        </div>
        
        <div class="nutrition-details">
          <div class="nutrition-row">
            <span>Calorías:</span>
            <span>{{ (selectedFood.calories * portions) | number:'1.0-0' }} kcal</span>
          </div>
          <div class="nutrition-row">
            <span>Proteínas:</span>
            <span>{{ (selectedFood.protein * portions) | number:'1.1-1' }} g</span>
          </div>
          <div class="nutrition-row">
            <span>Carbohidratos:</span>
            <span>{{ (selectedFood.carbs * portions) | number:'1.1-1' }} g</span>
          </div>
          <div class="nutrition-row">
            <span>Grasas:</span>
            <span>{{ (selectedFood.fat * portions) | number:'1.1-1' }} g</span>
          </div>
          <div class="nutrition-row">
            <span>Fibra:</span>
            <span>{{ (selectedFood.fiber * portions) | number:'1.1-1' }} g</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="cancel-btn" (click)="cancelSelection()">Cancelar</button>
          <button class="add-btn" (click)="addFoodEntry()">Añadir a diario</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .emergency-calculator {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .emergency-header {
      margin-bottom: 20px;
      text-align: center;
    }
    
    .emergency-header h3 {
      color: #e74c3c;
      margin-bottom: 5px;
    }
    
    .emergency-note {
      color: #7f8c8d;
      font-size: 14px;
      margin: 0;
    }
    
    .search-container {
      margin-bottom: 20px;
    }
    
    .search-box {
      display: flex;
      gap: 10px;
    }
    
    .search-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 15px;
    }
    
    .category-select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 15px;
      min-width: 150px;
    }
    
    .food-list {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 20px;
      border: 1px solid #eee;
      border-radius: 6px;
    }
    
    .food-item {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .food-item:last-child {
      border-bottom: none;
    }
    
    .food-item:hover {
      background-color: #f8f9fa;
    }
    
    .food-name {
      font-weight: 500;
      margin-bottom: 5px;
    }
    
    .food-details {
      display: flex;
      justify-content: space-between;
      color: #7f8c8d;
      font-size: 14px;
    }
    
    .no-results {
      padding: 20px;
      text-align: center;
      color: #7f8c8d;
    }
    
    .selected-food {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
    }
    
    .selected-food h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #2c3e50;
    }
    
    .portion-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .portion-selector input {
      width: 80px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .nutrition-details {
      margin-bottom: 20px;
    }
    
    .nutrition-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    
    .nutrition-row:last-child {
      border-bottom: none;
    }
    
    .action-buttons {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    
    .cancel-btn, .add-btn {
      padding: 10px 15px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .cancel-btn {
      background-color: #ecf0f1;
      color: #34495e;
    }
    
    .cancel-btn:hover {
      background-color: #dfe6e9;
    }
    
    .add-btn {
      background-color: #3498db;
      color: white;
    }
    
    .add-btn:hover {
      background-color: #2980b9;
    }
  `]
})
export class CalculadoraNutricionalEmergenciaComponent implements OnInit {
  @Input() selectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'breakfast';
  @Output() addFood = new EventEmitter<FoodEntry>();
  
  searchTerm: string = '';
  selectedCategory: string = 'all';
  
  foodDatabase: FoodItem[] = [];
  filteredFoods: FoodItem[] = [];
  
  selectedFood: FoodItem | null = null;
  portions: number = 1;
  
  constructor() {}
  
  ngOnInit(): void {
    this.initFoodDatabase();
    this.filteredFoods = [...this.foodDatabase];
  }
  
  initFoodDatabase(): void {
    this.foodDatabase = [
      // Frutas
      { id: 'f1', name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, serving_size: '1 mediana (100g)', category: 'frutas' },
      { id: 'f2', name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, serving_size: '1 mediano (118g)', category: 'frutas' },
      { id: 'f3', name: 'Naranja', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, serving_size: '1 mediana (131g)', category: 'frutas' },
      { id: 'f4', name: 'Fresas', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, serving_size: '1 taza (152g)', category: 'frutas' },
      { id: 'f5', name: 'Aguacate', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, serving_size: '1/2 unidad (100g)', category: 'frutas' },
      { id: 'f6', name: 'Melon', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9, serving_size: '1 taza (100g),', category: 'frutas' },

      // Verduras
      { id: 'v1', name: 'Brócoli', calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, fiber: 5.1, serving_size: '1 taza (91g)', category: 'verduras' },
      { id: 'v2', name: 'Zanahoria', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, serving_size: '1 mediana (61g)', category: 'verduras' },
      { id: 'v3', name: 'Espinacas', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, serving_size: '1 taza (30g)', category: 'verduras' },
      { id: 'v4', name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, serving_size: '1 mediano (123g)', category: 'verduras' },
      { id: 'v5', name: 'Pepino', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, serving_size: '1/2 unidad (150g)', category: 'verduras' },
      
      // Proteínas
      { id: 'p1', name: 'Pollo (pechuga)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving_size: '100g', category: 'proteinas' },
      { id: 'p2', name: 'Atún en agua', calories: 109, protein: 24, carbs: 0, fat: 0.8, fiber: 0, serving_size: '100g', category: 'proteinas' },
      { id: 'p3', name: 'Huevo', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, serving_size: '1 grande (50g)', category: 'proteinas' },
      { id: 'p4', name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, serving_size: '100g', category: 'proteinas' },
      { id: 'p5', name: 'Lentejas', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, serving_size: '100g cocidas', category: 'proteinas' },
      
      // Granos y cereales
      { id: 'g1', name: 'Arroz integral', calories: 112, protein: 2.3, carbs: 23.5, fat: 0.8, fiber: 1.8, serving_size: '100g cocido', category: 'granos' },
      { id: 'g2', name: 'Quinoa', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, serving_size: '100g cocida', category: 'granos' },
      { id: 'g3', name: 'Pan integral', calories: 81, protein: 4, carbs: 13.8, fat: 1.1, fiber: 2.4, serving_size: '1 rebanada (32g)', category: 'granos' },
      { id: 'g4', name: 'Avena', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 2, serving_size: '1/2 taza (40g)', category: 'granos' },
      { id: 'g5', name: 'Pasta integral', calories: 124, protein: 5.3, carbs: 26, fat: 0.6, fiber: 3.2, serving_size: '100g cocida', category: 'granos' },
      
      // Lácteos
      { id: 'l1', name: 'Leche desnatada', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, serving_size: '100ml', category: 'lacteos' },
      { id: 'l2', name: 'Yogur natural', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, serving_size: '100g', category: 'lacteos' },
      { id: 'l3', name: 'Queso fresco', calories: 98, protein: 14, carbs: 3.5, fat: 4.3, fiber: 0, serving_size: '100g', category: 'lacteos' },
      
      // Otros
      { id: 'o1', name: 'Aceite de oliva', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, serving_size: '1 cucharada (13.5g)', category: 'otros' },
      { id: 'o2', name: 'Nueces', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, serving_size: '1/4 taza (30g)', category: 'otros' },
      { id: 'o3', name: 'Chocolate negro (70%)', calories: 170, protein: 2.2, carbs: 13, fat: 12, fiber: 3, serving_size: '30g', category: 'otros' }
    ];
  }
  
  filterFoods(): void {
    if (!this.searchTerm && this.selectedCategory === 'all') {
      this.filteredFoods = [...this.foodDatabase];
      return;
    }
    
    this.filteredFoods = this.foodDatabase.filter(food => {
      const matchesSearch = !this.searchTerm || 
                           food.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = this.selectedCategory === 'all' || 
                             food.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }
  
  selectFood(food: FoodItem): void {
    this.selectedFood = food;
    this.portions = 1;
    this.updateNutrition();
  }
  
  updateNutrition(): void {
    // Los cálculos se hacen en el template con interpolación
  }
  
  cancelSelection(): void {
    this.selectedFood = null;
  }
  
  addFoodEntry(): void {
    if (!this.selectedFood) return;
    
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      date: new Date(),
      food_name: this.selectedFood.name,
      serving_qty: this.portions,
      serving_unit: this.selectedFood.serving_size.split(' ').pop() || 'porción',
      serving_weight_grams: 100 * this.portions, // Estimación aproximada
      calories: this.selectedFood.calories * this.portions,
      protein: this.selectedFood.protein * this.portions,
      fat: this.selectedFood.fat * this.portions,
      carbs: this.selectedFood.carbs * this.portions,
      fiber: this.selectedFood.fiber * this.portions,
      mealType: this.selectedMealType
    };
    
    this.addFood.emit(newEntry);
    this.selectedFood = null;
  }
}