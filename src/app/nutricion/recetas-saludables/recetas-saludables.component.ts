// recetas-saludables.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SpoonacularService } from '../../services/spoonacular.service';
import { ViewEncapsulation } from '@angular/core';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  isFavorite?: boolean;
  viewedAt?: Date;
}

@Component({
  selector: 'app-recetas-saludables',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recetas-saludables.component.html',
  styleUrls: ['./recetas-saludables.component.css'],
  encapsulation: ViewEncapsulation.None // Esto permite que los estilos se apliquen globalmente
})
export class RecetasSaludablesComponent implements OnInit {
  searchForm: FormGroup;
  recipes: Recipe[] = [];
  favoriteRecipes: Recipe[] = [];
  recentlyViewedRecipes: Recipe[] = [];
  selectedRecipe: Recipe | null = null;
  recipeDetails: any = null;
  
  activeTab: 'search' | 'favorites' | 'recent' = 'search';
  
  isLoadingRecipes = false;
  isLoadingDetails = false;
  
  constructor(
    private fb: FormBuilder,
    private spoonacularService: SpoonacularService
  ) {
    this.searchForm = this.fb.group({
      query: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadFavoriteRecipes();
    this.loadRecentlyViewedRecipes();
    this.loadPopularRecipes();
  }
  
  loadFavoriteRecipes() {
    const saved = localStorage.getItem('favoriteRecipes');
    if (saved) {
      this.favoriteRecipes = JSON.parse(saved);
    }
  }
  
  loadRecentlyViewedRecipes() {
    const saved = localStorage.getItem('recentlyViewedRecipes');
    if (saved) {
      this.recentlyViewedRecipes = JSON.parse(saved).map((recipe: any) => ({
        ...recipe,
        viewedAt: recipe.viewedAt ? new Date(recipe.viewedAt) : new Date()
      }));
      
      // Ordenar por fecha de visualización (más reciente primero)
      this.recentlyViewedRecipes.sort((a, b) => 
        new Date(b.viewedAt!).getTime() - new Date(a.viewedAt!).getTime()
      );
    }
  }
  
  loadPopularRecipes(): void {
    this.isLoadingRecipes = true;
    this.spoonacularService.getRandomRecipes(6).subscribe({
      next: (response) => {
        if (response && response.recipes) {
          this.recipes = response.recipes.map((recipe: any) => {
            // Verificar si la receta está en favoritos
            const isFavorite = this.favoriteRecipes.some(fav => fav.id === recipe.id);
            
            return {
              id: recipe.id,
              title: recipe.title || 'Receta sin título',
              image: recipe.image || 'assets/images/recipe-placeholder.jpg',
              readyInMinutes: recipe.readyInMinutes,
              servings: recipe.servings,
              isFavorite
            };
          });
        }
        this.isLoadingRecipes = false;
      },
      error: (error) => {
        console.error('Error loading popular recipes:', error);
        this.loadMockRecipes();
        this.isLoadingRecipes = false;
      }
    });
  }
  
  searchRecipes(): void {
    const { query } = this.searchForm.value;
    
    if (!query) return;
    
    this.isLoadingRecipes = true;
    this.recipes = [];
    
    this.spoonacularService.searchRecipes(query).subscribe({
      next: (response) => {
        if (response && response.results) {
          this.recipes = response.results.map((recipe: any) => {
            // Verificar si la receta está en favoritos
            const isFavorite = this.favoriteRecipes.some(fav => fav.id === recipe.id);
            
            return {
              id: recipe.id,
              title: recipe.title || 'Receta sin título',
              image: recipe.image || 'assets/images/recipe-placeholder.jpg',
              readyInMinutes: recipe.readyInMinutes,
              servings: recipe.servings,
              isFavorite
            };
          });
        }
        this.isLoadingRecipes = false;
      },
      error: (error) => {
        console.error('Error searching recipes:', error);
        this.recipes = [];
        this.isLoadingRecipes = false;
        this.loadMockRecipes();
      }
    });
  }
  
  loadMockRecipes(): void {
    this.recipes = [
      {
        id: 1,
        title: 'Ensalada Mediterránea',
        image: 'https://spoonacular.com/recipeImages/1-556x370.jpg',
        readyInMinutes: 15,
        servings: 4,
        isFavorite: this.favoriteRecipes.some(fav => fav.id === 1)
      },
      // Más recetas de ejemplo...
    ];
  }
  
  viewRecipeDetails(recipe: Recipe): void {
    this.selectedRecipe = recipe;
    this.isLoadingDetails = true;
    
    // Añadir a recetas vistas recientemente
    this.addToRecentlyViewed(recipe);
    
    this.spoonacularService.getRecipeDetails(recipe.id).subscribe({
      next: (details) => {
        this.recipeDetails = details;
        
        // Traducir instrucciones si están en inglés
        if (this.recipeDetails && this.recipeDetails.instructions) {
          this.recipeDetails.translatedInstructions = this.translateInstructions(this.recipeDetails.instructions);
        }
        
        // Traducir el título
        if (this.recipeDetails && this.recipeDetails.title) {
          const titleWords = this.recipeDetails.title.split(' ');
          const translatedTitleWords = titleWords.map((word: string) => {
            const lowerWord = word.toLowerCase();
            return this.getTranslation(lowerWord) || word;
          });
          this.recipeDetails.translatedTitle = this.capitalizeFirstLetter(translatedTitleWords.join(' '));
        }
        
        this.isLoadingDetails = false;
      },
      error: (error) => {
        console.error('Error fetching recipe details:', error);
        this.isLoadingDetails = false;
        this.loadMockRecipeDetails(recipe.id);
      }
    });
  }
  
  addToRecentlyViewed(recipe: Recipe) {
    // Crear copia con fecha de visualización
    const recipeWithDate: Recipe = {
      ...recipe,
      viewedAt: new Date()
    };
    
    // Eliminar si ya existe
    this.recentlyViewedRecipes = this.recentlyViewedRecipes.filter(r => r.id !== recipe.id);
    
    // Añadir al principio
    this.recentlyViewedRecipes.unshift(recipeWithDate);
    
    // Limitar a 10 recetas
    if (this.recentlyViewedRecipes.length > 10) {
      this.recentlyViewedRecipes = this.recentlyViewedRecipes.slice(0, 10);
    }
    
    // Guardar en localStorage
    localStorage.setItem('recentlyViewedRecipes', JSON.stringify(this.recentlyViewedRecipes));
  }
  
  toggleFavorite(recipe: Recipe, event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar que se abra el detalle al hacer clic en favorito
    }
    
    const isFavorite = this.favoriteRecipes.some(fav => fav.id === recipe.id);
    
    if (isFavorite) {
      // Eliminar de favoritos
      this.favoriteRecipes = this.favoriteRecipes.filter(fav => fav.id !== recipe.id);
    } else {
      // Añadir a favoritos
      this.favoriteRecipes.push(recipe);
    }
    
    // Actualizar estado en la lista actual
    this.recipes = this.recipes.map(r => {
      if (r.id === recipe.id) {
        return { ...r, isFavorite: !isFavorite };
      }
      return r;
    });
    
    // Actualizar en recientes también
    this.recentlyViewedRecipes = this.recentlyViewedRecipes.map(r => {
      if (r.id === recipe.id) {
        return { ...r, isFavorite: !isFavorite };
      }
      return r;
    });
    
    // Guardar en localStorage
    localStorage.setItem('favoriteRecipes', JSON.stringify(this.favoriteRecipes));
  }
  
  closeRecipeDetails(): void {
    this.selectedRecipe = null;
    this.recipeDetails = null;
  }
  
  // Métodos de traducción (reutilizados del componente original)
  getTranslation(word: string): string | undefined {
    // Diccionario de traducción (reutilizado del componente original)
    const translations: {[key: string]: string} = {
      // Verbos comunes
      'preheat': 'precalentar',
      'mix': 'mezclar',
      // ... resto del diccionario
    };
    
    return translations[word];
  }
  
  translateInstructions(instructions: string): string {
    if (!instructions) return 'No hay instrucciones disponibles';
    
    // Traducir las instrucciones palabra por palabra
    let translated = instructions;
    Object.keys(this.getTranslationDictionary()).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      translated = translated.replace(regex, this.getTranslationDictionary()[word]);
    });
    
    return translated;
  }
  
  getTranslationDictionary(): {[key: string]: string} {
    // Diccionario completo (reutilizado del componente original)
    return {
      // Verbos comunes
      'preheat': 'precalentar',
      'mix': 'mezclar',
      // ... resto del diccionario
    };
  }
  
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  loadMockRecipeDetails(recipeId: number): void {
    // Datos de ejemplo para cuando la API no está disponible
    this.recipeDetails = {
      id: recipeId,
      title: this.selectedRecipe?.title,
      image: this.selectedRecipe?.image,
      readyInMinutes: this.selectedRecipe?.readyInMinutes,
      servings: this.selectedRecipe?.servings,
      summary: 'Esta es una deliciosa receta que combina ingredientes frescos y saludables para crear un plato nutritivo y sabroso.',
      instructions: 'Paso 1: Preparar todos los ingredientes. Paso 2: Mezclar los ingredientes en un recipiente. Paso 3: Cocinar a fuego medio durante 15 minutos. Paso 4: Servir caliente.',
      translatedInstructions: 'Paso 1: Preparar todos los ingredientes. Paso 2: Mezclar los ingredientes en un recipiente. Paso 3: Cocinar a fuego medio durante 15 minutos. Paso 4: Servir caliente.',
      translatedTitle: this.selectedRecipe?.title,
      extendedIngredients: [
        { original: '2 tazas de verduras mixtas', name: 'verduras mixtas', amount: 2, unit: 'tazas' },
        { original: '1 cucharada de aceite de oliva', name: 'aceite de oliva', amount: 1, unit: 'cucharada' },
        { original: 'Sal y pimienta al gusto', name: 'sal y pimienta', amount: 1, unit: 'al gusto' },
        { original: '1 diente de ajo picado', name: 'ajo', amount: 1, unit: 'diente' },
        { original: '1/2 cebolla picada', name: 'cebolla', amount: 0.5, unit: 'unidad' },
        { original: '1 cucharadita de hierbas aromáticas', name: 'hierbas aromáticas', amount: 1, unit: 'cucharadita' }
      ],
      diets: ['vegetariano', 'sin gluten'],
      dishTypes: ['plato principal', 'almuerzo'],
      nutrition: {
        nutrients: [
          { name: 'Calorías', amount: 250, unit: 'kcal' },
          { name: 'Proteínas', amount: 15, unit: 'g' },
          { name: 'Grasas', amount: 10, unit: 'g' },
          { name: 'Carbohidratos', amount: 25, unit: 'g' },
          { name: 'Fibra', amount: 8, unit: 'g' },
          { name: 'Azúcares', amount: 5, unit: 'g' },
          { name: 'Sodio', amount: 120, unit: 'mg' },
          { name: 'Calcio', amount: 80, unit: 'mg' }
        ]
      }
    };
  }
}