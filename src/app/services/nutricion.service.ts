// src/app/services/nutricion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NutricionService {
  private readonly EDAMAM_API_URL = 'https://api.edamam.com/api/recipes/v2';
  private readonly EDAMAM_APP_ID = '9d92e9df'; 
  private readonly EDAMAM_APP_KEY = 'd87f5e0b84e80a9f650478f37e1079ee'; 
  private readonly NUTRITION_API_URL = 'https://api.edamam.com/api/nutrition-data';
  
  constructor(private http: HttpClient) { }

  // Buscar recetas
  searchRecipes(query: string, diet?: string, health?: string, calories?: string): Observable<any> {
    let params = new HttpParams()
      .set('type', 'public')
      .set('q', query)
      .set('app_id', this.EDAMAM_APP_ID)
      .set('app_key', this.EDAMAM_APP_KEY)
      .set('random', 'true')
      .set('imageSize', 'REGULAR');
    
    if (diet) params = params.set('diet', diet);
    if (health) params = params.set('health', health);
    if (calories) {
      const [min, max] = calories.split('-');
      if (min) params = params.set('calories.min', min);
      if (max && max !== '+') params = params.set('calories.max', max);
    }
    
    return this.http.get(this.EDAMAM_API_URL, { params }).pipe(
      tap(data => console.log('Recipes data:', data)),
      catchError(error => {
        console.error('Error fetching recipes:', error);
        return this.getMockRecipes();
      })
    );
  }
  
  // Obtener información nutricional
  getNutritionInfo(ingredient: string): Observable<any> {
    const params = new HttpParams()
      .set('app_id', this.EDAMAM_APP_ID)
      .set('app_key', this.EDAMAM_APP_KEY)
      .set('ingr', ingredient);
    
    return this.http.get(this.NUTRITION_API_URL, { params }).pipe(
      catchError(error => {
        console.error('Error fetching nutrition info:', error);
        return this.getMockNutritionInfo();
      })
    );
  }
  
  // Datos simulados para cuando la API no está disponible
  private getMockRecipes(): Observable<any> {
    return of({
      hits: [
        {
          recipe: {
            label: 'Ensalada Mediterránea',
            image: 'https://placehold.co/600x400/4CAF50/FFFFFF?text=Ensalada',
            source: 'BienestarDiario',
            url: '#',
            yield: 4,
            dietLabels: ['Bajo en grasas', 'Vegetariano'],
            healthLabels: ['Sin gluten', 'Vegano'],
            cautions: [],
            ingredientLines: [
              '2 tazas de lechuga romana picada',
              '1 pepino mediano, cortado en cubos',
              '1 tomate grande, cortado en cubos',
              '1/2 cebolla roja, en rodajas finas',
              '1/2 taza de aceitunas kalamata',
              '200g de queso feta desmenuzado',
              '2 cucharadas de aceite de oliva extra virgen',
              '1 cucharada de vinagre balsámico',
              'Sal y pimienta al gusto'
            ],
            calories: 320,
            totalTime: 15,
            cuisineType: ['Mediterránea'],
            mealType: ['Almuerzo', 'Cena'],
            dishType: ['Ensalada']
          }
        },
        {
          recipe: {
            label: 'Bowl de Quinoa con Vegetales',
            image: 'https://placehold.co/600x400/FF9800/FFFFFF?text=Quinoa+Bowl',
            source: 'BienestarDiario',
            url: '#',
            yield: 2,
            dietLabels: ['Alto en fibra', 'Bajo en sodio'],
            healthLabels: ['Vegetariano', 'Sin lácteos'],
            cautions: [],
            ingredientLines: [
              '1 taza de quinoa, cocida',
              '1 aguacate, en rodajas',
              '1 taza de garbanzos cocidos',
              '1 taza de espinacas frescas',
              '1 zanahoria, rallada',
              '1/4 taza de semillas de calabaza',
              '2 cucharadas de aceite de oliva',
              'Jugo de 1 limón',
              'Sal y pimienta al gusto'
            ],
            calories: 450,
            totalTime: 25,
            cuisineType: ['Internacional'],
            mealType: ['Almuerzo'],
            dishType: ['Plato principal']
          }
        },
        {
          recipe: {
            label: 'Smoothie Verde Energizante',
            image: 'https://placehold.co/600x400/8BC34A/FFFFFF?text=Smoothie+Verde',
            source: 'BienestarDiario',
            url: '#',
            yield: 1,
            dietLabels: ['Bajo en calorías', 'Bajo en carbohidratos'],
            healthLabels: ['Vegano', 'Sin gluten'],
            cautions: [],
            ingredientLines: [
              '1 plátano maduro',
              '2 tazas de espinacas frescas',
              '1 taza de leche de almendras',
              '1 cucharada de mantequilla de almendras',
              '1 cucharada de semillas de chía',
              '1/2 cucharadita de canela',
              'Hielo al gusto'
            ],
            calories: 250,
            totalTime: 5,
            cuisineType: ['Americana'],
            mealType: ['Desayuno', 'Merienda'],
            dishType: ['Bebida']
          }
        },
        {
          recipe: {
            label: 'Pollo al Horno con Hierbas',
            image: 'https://placehold.co/600x400/FF5722/FFFFFF?text=Pollo+al+Horno',
            source: 'BienestarDiario',
            url: '#',
            yield: 4,
            dietLabels: ['Alto en proteínas', 'Bajo en carbohidratos'],
            healthLabels: ['Sin lácteos', 'Sin azúcar'],
            cautions: [],
            ingredientLines: [
              '4 pechugas de pollo',
              '2 cucharadas de aceite de oliva',
              '2 dientes de ajo picados',
              '1 cucharada de romero fresco picado',
              '1 cucharada de tomillo fresco picado',
              '1 limón (jugo y ralladura)',
              'Sal y pimienta al gusto'
            ],
            calories: 380,
            totalTime: 40,
            cuisineType: ['Mediterránea'],
            mealType: ['Cena'],
            dishType: ['Plato principal']
          }
        },
        {
          recipe: {
            label: 'Tazón de Avena con Frutas',
            image: 'https://placehold.co/600x400/03A9F4/FFFFFF?text=Avena+con+Frutas',
            source: 'BienestarDiario',
            url: '#',
            yield: 1,
            dietLabels: ['Alto en fibra', 'Bajo en grasas'],
            healthLabels: ['Vegetariano', 'Sin azúcares añadidos'],
            cautions: [],
            ingredientLines: [
              '1/2 taza de avena',
              '1 taza de leche de almendras',
              '1 plátano en rodajas',
              '1/4 taza de fresas picadas',
              '1 cucharada de miel',
              '1 cucharada de mantequilla de maní',
              '1 cucharadita de semillas de chía'
            ],
            calories: 320,
            totalTime: 10,
            cuisineType: ['Americana'],
            mealType: ['Desayuno'],
            dishType: ['Cereal']
          }
        },
        {
          recipe: {
            label: 'Salmón a la Parrilla con Limón',
            image: 'https://placehold.co/600x400/E91E63/FFFFFF?text=Salmón',
            source: 'BienestarDiario',
            url: '#',
            yield: 2,
            dietLabels: ['Alto en proteínas', 'Bajo en carbohidratos'],
            healthLabels: ['Sin gluten', 'Pescatariano'],
            cautions: [],
            ingredientLines: [
              '2 filetes de salmón (150g cada uno)',
              '1 limón (jugo y rodajas)',
              '2 cucharadas de aceite de oliva',
              '2 dientes de ajo picados',
              '1 cucharada de eneldo fresco picado',
              'Sal y pimienta al gusto'
            ],
            calories: 420,
            totalTime: 20,
            cuisineType: ['Nórdica'],
            mealType: ['Cena'],
            dishType: ['Plato principal']
          }
        }
      ]
    });
  }
  
  private getMockNutritionInfo(): Observable<any> {
    return of({
      calories: 150,
      totalWeight: 100,
      totalNutrients: {
        PROCNT: {
          label: 'Proteína',
          quantity: 5,
          unit: 'g'
        },
        FAT: {
          label: 'Grasa',
          quantity: 3,
          unit: 'g'
        },
        CHOCDF: {
          label: 'Carbohidratos',
          quantity: 25,
          unit: 'g'
        },
        FIBTG: {
          label: 'Fibra',
          quantity: 3,
          unit: 'g'
        },
        CA: {
          label: 'Calcio',
          quantity: 20,
          unit: 'mg'
        },
        FE: {
          label: 'Hierro',
          quantity: 1.5,
          unit: 'mg'
        },
        NA: {
          label: 'Sodio',
          quantity: 50,
          unit: 'mg'
        },
        VITA_RAE: {
          label: 'Vitamina A',
          quantity: 100,
          unit: 'µg'
        },
        VITC: {
          label: 'Vitamina C',
          quantity: 15,
          unit: 'mg'
        }
      }
    });
  }
}