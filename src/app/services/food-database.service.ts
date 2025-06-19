// food-database.service.ts
import { Injectable } from '@angular/core';

export interface FoodItem {
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

@Injectable({
  providedIn: 'root'
})
export class FoodDatabaseService {
  private foodDatabase: FoodItem[] = [];
  
  constructor() {
    this.initFoodDatabase();
  }
  
  getFoodDatabase(): FoodItem[] {
    return this.foodDatabase;
  }
  
  searchFoods(term: string, category: string = 'all'): FoodItem[] {
    if (!term && category === 'all') {
      return [...this.foodDatabase];
    }
    
    return this.foodDatabase.filter(food => {
      const matchesSearch = !term || 
        food.name.toLowerCase().includes(term.toLowerCase());
      
      const matchesCategory = category === 'all' || 
        food.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }
  
  private initFoodDatabase(): void {
    this.foodDatabase = [
      // Frutas
      { id: 'f1', name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, serving_size: '1 mediana (100g)', category: 'frutas' },
      { id: 'f2', name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, serving_size: '1 mediano (118g)', category: 'frutas' },
      { id: 'f3', name: 'Naranja', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, serving_size: '1 mediana (131g)', category: 'frutas' },
      { id: 'f4', name: 'Fresas', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, serving_size: '1 taza (152g)', category: 'frutas' },
      { id: 'f5', name: 'Aguacate', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, serving_size: '1/2 unidad (100g)', category: 'frutas' },
      { id: 'f6', name: 'Uvas', calories: 69, protein: 0.6, carbs: 18, fat: 0.2, fiber: 0.9, serving_size: '1 taza (100g)', category: 'frutas' },
      { id: 'f7', name: 'Piña', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, serving_size: '1 taza (100g)', category: 'frutas' },
      { id: 'f8', name: 'Sandía', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, serving_size: '1 taza (100g)', category: 'frutas' },
      
      // Verduras
      { id: 'v1', name: 'Brócoli', calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, fiber: 5.1, serving_size: '1 taza (91g)', category: 'verduras' },
      { id: 'v2', name: 'Zanahoria', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, serving_size: '1 mediana (61g)', category: 'verduras' },
      { id: 'v3', name: 'Espinacas', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, serving_size: '1 taza (30g)', category: 'verduras' },
      { id: 'v4', name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, serving_size: '1 mediano (123g)', category: 'verduras' },
      { id: 'v5', name: 'Pepino', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, serving_size: '1/2 unidad (150g)', category: 'verduras' },
      { id: 'v6', name: 'Lechuga', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, serving_size: '1 taza (50g)', category: 'verduras' },
      { id: 'v7', name: 'Pimiento', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7, serving_size: '1 mediano (100g)', category: 'verduras' },
      { id: 'v8', name: 'Cebolla', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, serving_size: '1 mediana (100g)', category: 'verduras' },
      
      // Proteínas
      { id: 'p1', name: 'Pollo (pechuga)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving_size: '100g', category: 'proteinas' },
      { id: 'p2', name: 'Atún en agua', calories: 109, protein: 24, carbs: 0, fat: 0.8, fiber: 0, serving_size: '100g', category: 'proteinas' },
      { id: 'p3', name: 'Huevo', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, serving_size: '1 grande (50g)', category: 'proteinas' },
      { id: 'p4', name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, serving_size: '100g', category: 'proteinas' },
      { id: 'p5', name: 'Lentejas', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, serving_size: '100g cocidas', category: 'proteinas' },
      { id: 'p6', name: 'Salmón', calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0, serving_size: '100g', category: 'proteinas' },
      { id: 'p7', name: 'Carne de res (magra)', calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, serving_size: '100g', category: 'proteinas' },
      { id: 'p8', name: 'Garbanzos', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, serving_size: '100g cocidos', category: 'proteinas' },
      
      // Granos y cereales
      { id: 'g1', name: 'Arroz integral', calories: 112, protein: 2.3, carbs: 23.5, fat: 0.8, fiber: 1.8, serving_size: '100g cocido', category: 'granos' },
      { id: 'g2', name: 'Quinoa', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, serving_size: '100g cocida', category: 'granos' },
      { id: 'g3', name: 'Pan integral', calories: 81, protein: 4, carbs: 13.8, fat: 1.1, fiber: 2.4, serving_size: '1 rebanada (32g)', category: 'granos' },
      { id: 'g4', name: 'Avena', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 2, serving_size: '1/2 taza (40g)', category: 'granos' },
      { id: 'g5', name: 'Pasta integral', calories: 124, protein: 5.3, carbs: 26, fat: 0.6, fiber: 3.2, serving_size: '100g cocida', category: 'granos' },
      { id: 'g6', name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, serving_size: '100g cocido', category: 'granos' },
      { id: 'g7', name: 'Pan blanco', calories: 75, protein: 2.6, carbs: 14, fat: 1, fiber: 0.8, serving_size: '1 rebanada (30g)', category: 'granos' },
      
      // Lácteos
      { id: 'l1', name: 'Leche desnatada', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, serving_size: '100ml', category: 'lacteos' },
      { id: 'l2', name: 'Yogur natural', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, serving_size: '100g', category: 'lacteos' },
      { id: 'l3', name: 'Queso fresco', calories: 98, protein: 14, carbs: 3.5, fat: 4.3, fiber: 0, serving_size: '100g', category: 'lacteos' },
      { id: 'l4', name: 'Leche entera', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, serving_size: '100ml', category: 'lacteos' },
      { id: 'l5', name: 'Queso cheddar', calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, serving_size: '100g', category: 'lacteos' },
      
      // Otros
      { id: 'o1', name: 'Aceite de oliva', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, serving_size: '1 cucharada (13.5g)', category: 'otros' },
      { id: 'o2', name: 'Nueces', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, serving_size: '1/4 taza (30g)', category: 'otros' },
      { id: 'o3', name: 'Chocolate negro (70%)', calories: 170, protein: 2.2, carbs: 13, fat: 12, fiber: 3, serving_size: '30g', category: 'otros' },
      { id: 'o4', name: 'Miel', calories: 64, protein: 0.1, carbs: 17, fat: 0, fiber: 0, serving_size: '1 cucharada (21g)', category: 'otros' },
      { id: 'o5', name: 'Aguacate', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, serving_size: '1/2 unidad (100g)', category: 'otros' }
    ];
  }
}