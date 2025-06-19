import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpoonacularService {
  private readonly SPOONACULAR_API_URL = 'https://api.spoonacular.com/recipes';
  private readonly API_KEY = '11a1924e2a5c45b1a611e725856d3687'; // Reemplaza con tu clave API real

  constructor(private http: HttpClient) {}

  // Buscar recetas
  searchRecipes(query: string): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('number', '9') // Número de recetas a devolver
      .set('addRecipeInformation', 'true') // Incluir información adicional
      .set('fillIngredients', 'true') // Incluir ingredientes
      .set('apiKey', this.API_KEY);

    return this.http.get(`${this.SPOONACULAR_API_URL}/complexSearch`, { params }).pipe(
      tap(data => console.log('Spoonacular recipes:', data)),
      catchError(error => {
        console.error('Error fetching recipes from Spoonacular:', error);
        return of({ results: [] });
      })
    );
  }

  // Obtener recetas aleatorias
  getRandomRecipes(number: number = 6): Observable<any> {
    const params = new HttpParams()
      .set('number', number.toString())
      .set('tags', 'vegetarian,healthy')
      .set('apiKey', this.API_KEY);

    return this.http.get(`${this.SPOONACULAR_API_URL}/random`, { params }).pipe(
      tap(data => console.log('Random recipes:', data)),
      catchError(error => {
        console.error('Error fetching random recipes:', error);
        return of({ recipes: [] });
      })
    );
  }

  // Obtener detalles de una receta
  getRecipeDetails(recipeId: number): Observable<any> {
    const params = new HttpParams()
      .set('includeNutrition', 'true') // Incluir información nutricional
      .set('apiKey', this.API_KEY);

    return this.http.get(`${this.SPOONACULAR_API_URL}/${recipeId}/information`, { params }).pipe(
      tap(data => console.log('Recipe details:', data)),
      catchError(error => {
        console.error('Error fetching recipe details:', error);
        return of(null);
      })
    );
  }
}