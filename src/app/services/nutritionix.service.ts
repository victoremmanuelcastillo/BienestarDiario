// nutritionix.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NutritionixService {
  private readonly NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2';
  private readonly APP_ID = 'cad9ce68'; // Reemplaza con tu App ID real
  private readonly APP_KEY = 'a7d81a495861ab419f5dce52c12f9f72'; // Reemplaza con tu App Key real

  constructor(private http: HttpClient) {}

  // Obtener información nutricional de un alimento
  getNutritionInfo(ingredient: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('x-app-id', this.APP_ID)
      .set('x-app-key', this.APP_KEY)
      .set('x-remote-user-id', '0');

    const body = { 
      query: ingredient,
      detailed: true
    };

    return this.http.post(`${this.NUTRITIONIX_API_URL}/natural/nutrients`, body, { headers }).pipe(
      tap(data => console.log('Nutritionix data:', data)),
      catchError(error => {
        console.error('Error fetching nutrition info from Nutritionix:', error);
        // Siempre devolver datos de ejemplo si la API falla
        return of(this.getMockNutritionData(ingredient));
      })
    );
  }

  // Datos de ejemplo basados en el ingrediente
  private getMockNutritionData(ingredient: string): any {
    const ingredientLower = ingredient.toLowerCase();
    
    // Datos básicos que se adaptarán según el ingrediente
    const baseData = {
      foods: [
        {
          food_name: ingredientLower,
          serving_qty: 1,
          serving_unit: 'porción',
          serving_weight_grams: 100,
          nf_calories: 100,
          nf_total_fat: 2,
          nf_saturated_fat: 0.5,
          nf_cholesterol: 0,
          nf_sodium: 5,
          nf_total_carbohydrate: 15,
          nf_dietary_fiber: 2,
          nf_sugars: 5,
          nf_protein: 3,
          nf_potassium: 200
        }
      ]
    };
    
    // Ajustar valores según el tipo de alimento
    if (ingredientLower.includes('manzana')) {
      baseData.foods[0] = {
        ...baseData.foods[0],
        food_name: 'manzana',
        serving_unit: 'unidad',
        serving_weight_grams: 182,
        nf_calories: 95,
        nf_total_fat: 0.3,
        nf_saturated_fat: 0.1,
        nf_total_carbohydrate: 25,
        nf_dietary_fiber: 4.4,
        nf_sugars: 19,
        nf_protein: 0.5
      };
    } else if (ingredientLower.includes('pollo')) {
      baseData.foods[0] = {
        ...baseData.foods[0],
        food_name: 'pollo',
        serving_unit: 'filete',
        serving_weight_grams: 120,
        nf_calories: 165,
        nf_total_fat: 3.6,
        nf_saturated_fat: 1,
        nf_cholesterol: 85,
        nf_sodium: 74,
        nf_total_carbohydrate: 0,
        nf_dietary_fiber: 0,
        nf_sugars: 0,
        nf_protein: 31
      };
    } else if (ingredientLower.includes('arroz')) {
      baseData.foods[0] = {
        ...baseData.foods[0],
        food_name: 'arroz',
        serving_unit: 'taza',
        serving_weight_grams: 158,
        nf_calories: 205,
        nf_total_fat: 0.4,
        nf_saturated_fat: 0.1,
        nf_cholesterol: 0,
        nf_sodium: 2,
        nf_total_carbohydrate: 45,
        nf_dietary_fiber: 0.6,
        nf_sugars: 0.1,
        nf_protein: 4.3
      };
    } else if (ingredientLower.includes('huevo')) {
      baseData.foods[0] = {
        ...baseData.foods[0],
        food_name: 'huevo',
        serving_unit: 'unidad',
        serving_weight_grams: 50,
        nf_calories: 78,
        nf_total_fat: 5.3,
        nf_saturated_fat: 1.6,
        nf_cholesterol: 187,
        nf_sodium: 62,
        nf_total_carbohydrate: 0.6,
        nf_dietary_fiber: 0,
        nf_sugars: 0.6,
        nf_protein: 6.3
      };
    } else if (ingredientLower.includes('leche')) {
      baseData.foods[0] = {
        ...baseData.foods[0],
        food_name: 'leche',
        serving_unit: 'taza',
        serving_weight_grams: 244,
        nf_calories: 122,
        nf_total_fat: 4.8,
        nf_saturated_fat: 3,
        nf_cholesterol: 24,
        nf_sodium: 115,
        nf_total_carbohydrate: 12,
        nf_dietary_fiber: 0,
        nf_sugars: 12,
        nf_protein: 8.1
      };
    }
    
    return baseData;
  }
}