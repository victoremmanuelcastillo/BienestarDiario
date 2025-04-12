// src/app/nutricion/nutricion.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NutricionService } from '../services/nutricion.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-nutricion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './nutricion.component.html',
  styleUrls: ['./nutricion.component.css']
})
export class NutricionComponent implements OnInit {
  searchForm: FormGroup;
  nutritionForm: FormGroup;
  recipes: any[] = [];
  nutritionInfo: any = null;
  selectedRecipe: any = null;
  isLoading = false;
  isLoadingNutrition = false;
  hasSearched = false;
  nutritionDetails: any[] = [];
  
  constructor(
    private fb: FormBuilder,
    private nutricionService: NutricionService
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      diet: [''],
      health: [''],
      calories: ['']
    });
    
    this.nutritionForm = this.fb.group({
      ingredient: ['']
    });
  }

  ngOnInit(): void {
    // Cargar algunas recetas al inicio
    this.loadInitialRecipes();
  }

  loadInitialRecipes(): void {
    this.isLoading = true;
    this.nutricionService.searchRecipes('healthy').subscribe({
      next: (data) => {
        if (data && data.hits) {
          this.recipes = data.hits.map((hit: any) => hit.recipe);
        } else {
          this.recipes = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
        this.recipes = [];
        this.isLoading = false;
      }
    });
  }

  searchRecipes(): void {
    const { query, diet, health, calories } = this.searchForm.value;
    
    if (!query) return;
    
    this.isLoading = true;
    this.hasSearched = true;
    
    this.nutricionService.searchRecipes(query, diet, health, calories).subscribe({
      next: (data) => {
        if (data && data.hits) {
          this.recipes = data.hits.map((hit: any) => hit.recipe);
        } else {
          this.recipes = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching recipes:', error);
        this.recipes = [];
        this.isLoading = false;
      }
    });
  }

  getNutritionInfo(): void {
    const { ingredient } = this.nutritionForm.value;
    
    if (!ingredient) return;
    
    this.isLoadingNutrition = true;
    
    this.nutricionService.getNutritionInfo(ingredient).subscribe({
      next: (data) => {
        this.nutritionInfo = data;
        this.processNutritionDetails();
        this.isLoadingNutrition = false;
      },
      error: (error) => {
        console.error('Error getting nutrition info:', error);
        this.nutritionInfo = null;
        this.isLoadingNutrition = false;
      }
    });
  }

  processNutritionDetails(): void {
    if (!this.nutritionInfo || !this.nutritionInfo.totalNutrients) {
      this.nutritionDetails = [];
      return;
    }
    
    const nutrients = this.nutritionInfo.totalNutrients;
    this.nutritionDetails = Object.keys(nutrients)
      .filter(key => !['PROCNT', 'FAT', 'CHOCDF', 'FIBTG'].includes(key)) // Excluir los que ya se muestran en el resumen
      .map(key => ({
        label: nutrients[key].label,
        quantity: nutrients[key].quantity,
        unit: nutrients[key].unit
      }));
  }

  showRecipeDetails(recipe: any): void {
    this.selectedRecipe = recipe;
  }

  closeRecipeDetails(): void {
    this.selectedRecipe = null;
  }
}