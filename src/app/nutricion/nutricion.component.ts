import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SpoonacularService } from '../services/spoonacular.service';
import { NutritionixService } from '../services/nutritionix.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nutricion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './nutricion.component.html',
  styleUrls: ['./nutricion.component.css']
})

export class NutricionComponent implements OnInit {
  searchForm: FormGroup;
  nutritionForm: FormGroup;
  recipes: any[] = [];
  nutritionInfo: any = null;
  selectedRecipe: any = null;
  recipeDetails: any = null;
  isLoadingRecipes = false;
  isLoadingNutrition = false;
  isLoadingDetails = false;
  
  handleImageError(event: any) {
    event.target.src = 'assets/images/imc-calculator.jpg';
  }

  constructor(
    private fb: FormBuilder,
    private spoonacularService: SpoonacularService,
    private nutritionixService: NutritionixService
  ) {
    this.searchForm = this.fb.group({
      query: ['']
    });

    this.nutritionForm = this.fb.group({
      ingredient: ['']
    });
  }

  ngOnInit(): void {
    // Cargar algunas recetas populares al inicio
    this.loadPopularRecipes();
  }

  // Cargar recetas populares al inicio
  loadPopularRecipes(): void {
    this.isLoadingRecipes = true;
    this.spoonacularService.getRandomRecipes(6).subscribe({
      next: (response) => {
        if (response && response.recipes) {
          this.recipes = response.recipes.map((recipe: any) => ({
            id: recipe.id,
            title: recipe.title || 'Receta sin título',
            image: recipe.image || 'assets/images/recipe-placeholder.jpg',
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings
          }));
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
          this.recipes = response.results.map((recipe: any) => ({
            id: recipe.id,
            title: recipe.title || 'Receta sin título',
            image: recipe.image || 'assets/images/recipe-placeholder.jpg',
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings
          }));
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
        servings: 4
      },
      {
        id: 2,
        title: 'Pollo al Limón',
        image: 'https://spoonacular.com/recipeImages/2-556x370.jpg',
        readyInMinutes: 30,
        servings: 2
      },
      {
        id: 3,
        title: 'Pasta con Verduras',
        image: 'https://spoonacular.com/recipeImages/3-556x370.jpg',
        readyInMinutes: 25,
        servings: 3
      },
      {
        id: 4,
        title: 'Smoothie de Frutas',
        image: 'https://spoonacular.com/recipeImages/4-556x370.jpg',
        readyInMinutes: 10,
        servings: 2
      },
      {
        id: 5,
        title: 'Salmón al Horno',
        image: 'https://spoonacular.com/recipeImages/5-556x370.jpg',
        readyInMinutes: 35,
        servings: 2
      },
      {
        id: 6,
        title: 'Quinoa con Vegetales',
        image: 'https://spoonacular.com/recipeImages/6-556x370.jpg',
        readyInMinutes: 20,
        servings: 4
      }
    ];
  }

  viewRecipeDetails(recipe: any): void {
    this.selectedRecipe = recipe;
    this.isLoadingDetails = true;
    
    this.spoonacularService.getRecipeDetails(recipe.id).subscribe({
      next: (details) => {
        this.recipeDetails = details;
        
        // Traducir instrucciones están en inglés
        if (this.recipeDetails && this.recipeDetails.instructions) {
          //servicio de traducción
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
  
  // Obtener traducción
  getTranslation(word: string): string | undefined {
    const translations: {[key: string]: string} = {
      // Verbos comunes
      'preheat': 'precalentar',
      'mix': 'mezclar',
      'cook': 'cocinar',
      'bake': 'hornear',
      'cut': 'cortar',
      'add': 'añadir',
      'stir': 'remover',
      'boil': 'hervir',
      'serve': 'servir',
      'drain': 'escurrir',
      'sauté': 'saltear',
      'fry': 'freír',
      'grill': 'asar',
      'chop': 'picar',
      'slice': 'rebanar',
      'dice': 'cortar en cubos',
      'mince': 'picar finamente',
      'season': 'sazonar',
      'sprinkle': 'espolvorear',
      'garnish': 'decorar',
      'simmer': 'cocinar a fuego lento',
      'roast': 'asar',
      'broil': 'gratinar',
      'steam': 'cocer al vapor',
      'whisk': 'batir',
      'knead': 'amasar',
      'marinate': 'marinar',
      'grate': 'rallar',
      'melt': 'derretir',
      'fold': 'incorporar',
      'toss': 'mezclar ligeramente',
      'combine': 'combinar',
      'beat': 'batir',
      'blend': 'mezclar',
      'return': 'volver',
      'remove': 'retirar',
      'set': 'colocar',
      'let': 'dejar',
      'rest': 'reposar',
      'cool': 'enfriar',
      'heat': 'calentar',
      'bring': 'llevar',
      
      // Sustantivos comunes
      'oven': 'horno',
      'pan': 'sartén',
      'pot': 'olla',
      'bowl': 'recipiente',
      'skillet': 'sartén',
      'plate': 'plato',
      'fork': 'tenedor',
      'spoon': 'cuchara',
      'knife': 'cuchillo',
      'cup': 'taza',
      'tablespoon': 'cucharada',
      'teaspoon': 'cucharadita',
      'minutes': 'minutos',
      'hour': 'hora',
      'hours': 'horas',
      'temperature': 'temperatura',
      'degrees': 'grados',
      'sauce': 'salsa',
      'mixture': 'mezcla',
      'dough': 'masa',
      'batter': 'masa líquida',
      'oil': 'aceite',
      'butter': 'mantequilla',
      'salt': 'sal',
      'pepper': 'pimienta',
      'sugar': 'azúcar',
      'flour': 'harina',
      'water': 'agua',
      'milk': 'leche',
      'cream': 'crema',
      'cheese': 'queso',
      'egg': 'huevo',
      'eggs': 'huevos',
      'meat': 'carne',
      'chicken': 'pollo',
      'beef': 'carne de res',
      'pork': 'cerdo',
      'fish': 'pescado',
      'vegetable': 'verdura',
      'vegetables': 'verduras',
      'fruit': 'fruta',
      'fruits': 'frutas',
      'pasta': 'pasta',
      'rice': 'arroz',
      'bread': 'pan',
      
      // Nombres de platos comunes
      'salad': 'ensalada',
      'soup': 'sopa',
      'stew': 'estofado',
      'sandwich': 'sándwich',
      'pizza': 'pizza',
      'burger': 'hamburguesa',
      'cake': 'pastel',
      'pie': 'tarta',
      'cookie': 'galleta',
      'cookies': 'galletas',
      'muffin': 'magdalena',
      'pancake': 'panqueque',
      'waffle': 'gofre',
      'toast': 'tostada',
      'omelette': 'tortilla',
      'smoothie': 'batido',
      'juice': 'jugo',
      'tea': 'té',
      'coffee': 'café',
      
      // Adjetivos comunes
      'hot': 'caliente',
      'cold': 'frío',
      'warm': 'tibio',
      'fresh': 'fresco',
      'frozen': 'congelado',
      'cooked': 'cocinado',
      'raw': 'crudo',
      'chopped': 'picado',
      'sliced': 'rebanado',
      'diced': 'cortado en cubos',
      'minced': 'picado finamente',
      'grated': 'rallado',
      'melted': 'derretido',
      'mixed': 'mezclado',
      'combined': 'combinado',
      'seasoned': 'sazonado',
      'healthy': 'saludable',
      'delicious': 'delicioso',
      'tasty': 'sabroso',
      'sweet': 'dulce',
      'sour': 'ácido',
      'bitter': 'amargo',
      'salty': 'salado',
      'spicy': 'picante',
      'creamy': 'cremoso',
      'crunchy': 'crujiente',
      'soft': 'suave',
      'hard': 'duro',
      'tender': 'tierno',
      'juicy': 'jugoso',
      'dry': 'seco',
      'moist': 'húmedo',
      'fluffy': 'esponjoso',
      'crispy': 'crujiente',
      'golden': 'dorado',
      'brown': 'marrón',
      'green': 'verde',
      'red': 'rojo',
      'yellow': 'amarillo',
      'orange': 'naranja',
      'purple': 'morado',
      'white': 'blanco',
      'black': 'negro',
      
      // Preposiciones y conectores
      'until': 'hasta que',
      'the': 'el',
      'and': 'y',
      'with': 'con',
      'in': 'en',
      'on': 'sobre',
      'for': 'durante',
      'to': 'a',
      'from': 'de',
      'at': 'a',
      'by': 'por',
      'of': 'de',
      'or': 'o',
      'if': 'si',
      'when': 'cuando',
      'while': 'mientras',
      'then': 'luego',
      'after': 'después',
      'before': 'antes',
      'under': 'bajo',
      'over': 'sobre',
      'through': 'a través',
      'into': 'dentro',
      'onto': 'sobre',
      'between': 'entre',
      'among': 'entre',
      'around': 'alrededor',
      'about': 'acerca',
      'against': 'contra',
      'along': 'a lo largo',
      'across': 'a través',
      'behind': 'detrás',
      'beyond': 'más allá',
      'during': 'durante',
      'throughout': 'a lo largo',
      'within': 'dentro',
      'without': 'sin',
      'according': 'según',
      'because': 'porque',
      'since': 'desde',
      'as': 'como',
      'so': 'así que',
      'such': 'tal',
      'that': 'que',
      'though': 'aunque',
      'although': 'aunque',
      'even': 'incluso',
      'still': 'todavía',
      'yet': 'aún',
      'just': 'solo',
      'only': 'solo',
      'also': 'también',
      'too': 'también',
      'very': 'muy',
      'quite': 'bastante',
      'rather': 'bastante',
      'somewhat': 'algo',
      'enough': 'suficiente',
      'not': 'no',
      'never': 'nunca',
      'always': 'siempre',
      'often': 'a menudo',
      'sometimes': 'a veces',
      'rarely': 'raramente',
      'seldom': 'rara vez',
      'usually': 'usualmente',
      'generally': 'generalmente',
      'typically': 'típicamente',
      'occasionally': 'ocasionalmente',
      'frequently': 'frecuentemente'
    };
    
    return translations[word];
  }
  
  // Simulación de traducción
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

  // Diccionario de traducción completo
  getTranslationDictionary(): {[key: string]: string} {
    return {
      // Verbos comunes
      'preheat': 'precalentar',
      'mix': 'mezclar',
      'cook': 'cocinar',
      'bake': 'hornear',
      'cut': 'cortar',
      'add': 'añadir',
      'stir': 'remover',
      'boil': 'hervir',
      'serve': 'servir',
      'drain': 'escurrir',
      'sauté': 'saltear',
      'fry': 'freír',
      'grill': 'asar',
      'chop': 'picar',
      'slice': 'rebanar',
      'dice': 'cortar en cubos',
      'mince': 'picar finamente',
      'season': 'sazonar',
      'sprinkle': 'espolvorear',
      'garnish': 'decorar',
      'simmer': 'cocinar a fuego lento',
      'roast': 'asar',
      'broil': 'gratinar',
      'steam': 'cocer al vapor',
      'whisk': 'batir',
      'knead': 'amasar',
      'marinate': 'marinar',
      'grate': 'rallar',
      'melt': 'derretir',
      'fold': 'incorporar',
      'toss': 'mezclar ligeramente',
      'combine': 'combinar',
      'beat': 'batir',
      'blend': 'mezclar',
      'return': 'volver',
      'remove': 'retirar',
      'set': 'colocar',
      'let': 'dejar',
      'rest': 'reposar',
      'cool': 'enfriar',
      'heat': 'calentar',
      'bring': 'llevar',
      
      // Sustantivos comunes
      'oven': 'horno',
      'pan': 'sartén',
      'pot': 'olla',
      'bowl': 'recipiente',
      'skillet': 'sartén',
      'plate': 'plato',
      'fork': 'tenedor',
      'spoon': 'cuchara',
      'knife': 'cuchillo',
      'cup': 'taza',
      'tablespoon': 'cucharada',
      'teaspoon': 'cucharadita',
      'minutes': 'minutos',
      'hour': 'hora',
      'hours': 'horas',
      'temperature': 'temperatura',
      'degrees': 'grados',
      'sauce': 'salsa',
      'mixture': 'mezcla',
      'dough': 'masa',
      'batter': 'masa líquida',
      'oil': 'aceite',
      'butter': 'mantequilla',
      'salt': 'sal',
      'pepper': 'pimienta',
      'sugar': 'azúcar',
      'flour': 'harina',
      'water': 'agua',
      'milk': 'leche',
      'cream': 'crema',
      'cheese': 'queso',
      'egg': 'huevo',
      'eggs': 'huevos',
      'meat': 'carne',
      'chicken': 'pollo',
      'beef': 'carne de res',
      'pork': 'cerdo',
      'fish': 'pescado',
      'vegetable': 'verdura',
      'vegetables': 'verduras',
      'fruit': 'fruta',
      'fruits': 'frutas',
      'pasta': 'pasta',
      'rice': 'arroz',
      'bread': 'pan',
      
      // Preposiciones y conectores
      'until': 'hasta que',
      'the': 'el',
      'and': 'y',
      'with': 'con',
      'in': 'en',
      'on': 'sobre',
      'for': 'durante',
      'to': 'a',
      'from': 'de',
      'at': 'a',
      'by': 'por',
      'of': 'de',
      'or': 'o',
      'if': 'si',
      'when': 'cuando',
      'while': 'mientras',
      'then': 'luego',
      'after': 'después',
      'before': 'antes'
    };
  }

  // Método auxiliar para capitalizar la primera letra
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
    
  loadMockRecipeDetails(recipeId: number): void {
    // Datos de ejemplo para cuando la API no está disponible
    this.recipeDetails = {
      id: recipeId,
      title: this.selectedRecipe.title,
      image: this.selectedRecipe.image,
      readyInMinutes: this.selectedRecipe.readyInMinutes,
      servings: this.selectedRecipe.servings,
      summary: 'Esta es una deliciosa receta que combina ingredientes frescos y saludables para crear un plato nutritivo y sabroso.',
      instructions: 'Paso 1: Preparar todos los ingredientes. Paso 2: Mezclar los ingredientes en un recipiente. Paso 3: Cocinar a fuego medio durante 15 minutos. Paso 4: Servir caliente.',
      translatedInstructions: 'Paso 1: Preparar todos los ingredientes. Paso 2: Mezclar los ingredientes en un recipiente. Paso 3: Cocinar a fuego medio durante 15 minutos. Paso 4: Servir caliente.',
      translatedTitle: this.selectedRecipe.title,
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

  getNutritionInfo(): void {
    const { ingredient } = this.nutritionForm.value;

    if (!ingredient) return;

    this.isLoadingNutrition = true;
    this.nutritionInfo = null;

    this.nutritionixService.getNutritionInfo(ingredient).subscribe({
      next: (data) => {
        this.nutritionInfo = data;
        this.isLoadingNutrition = false;
      },
      error: (error) => {
        console.error('Error fetching nutrition info:', error);
        this.isLoadingNutrition = false;
        
        // Datos de ejemplo
        this.loadMockNutritionInfo(ingredient);
      }
    });
  }
  
  loadMockNutritionInfo(ingredient: string): void {
    // Datos de ejemplo para cuando la API no está disponible
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
    } else if (ingredientLower.includes('pan')) {
      baseData.foods[0] = {
        ...baseData.foods[0],
        food_name: 'pan',
        serving_unit: 'rebanada',
        serving_weight_grams: 30,
        nf_calories: 80,
        nf_total_fat: 1,
        nf_saturated_fat: 0.2,
        nf_cholesterol: 0,
        nf_sodium: 160,
        nf_total_carbohydrate: 15,
        nf_dietary_fiber: 1,
        nf_sugars: 1.5,
        nf_protein: 3
      };
    } else if (ingredientLower.includes('pasta')) {
      baseData.foods[0] = {
        ...baseData.foods[0],
        food_name: 'pasta',
        serving_unit: 'taza',
        serving_weight_grams: 140,
        nf_calories: 220,
        nf_total_fat: 1.2,
        nf_saturated_fat: 0.2,
        nf_cholesterol: 0,
        nf_sodium: 1,
        nf_total_carbohydrate: 43,
        nf_dietary_fiber: 2.5,
        nf_sugars: 0.8,
        nf_protein: 8
      };
    }
    
    this.nutritionInfo = baseData;
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
  
  closeRecipeDetails(): void {
    this.selectedRecipe = null;
    this.recipeDetails = null;
  }
}