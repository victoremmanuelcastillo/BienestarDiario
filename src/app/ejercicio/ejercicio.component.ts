// src/app/ejercicio/ejercicio.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EjercicioService } from '../services/ejercicio.service';

@Component({
  selector: 'app-ejercicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejercicio.component.html',
  styleUrls: ['./ejercicio.component.css']
})
export class EjercicioComponent implements OnInit {
  categories: any[] = [];
  exercises: any[] = [];
  selectedCategory: number | null = null;
  selectedExercise: any = null;
  exerciseDetails: any = null;
  exerciseImages: any[] = [];
  workoutRoutines: any[] = [];
  isLoading = false;
  activeTab = 'exercises'; // 'exercises' o 'routines'

  constructor(private ejercicioService: EjercicioService) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadWorkoutRoutines();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.ejercicioService.getExerciseCategories().subscribe({
      next: (data) => {
        this.categories = data.results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      }
    });
  }

  loadExercisesByCategory(categoryId: number): void {
    this.selectedCategory = categoryId;
    this.isLoading = true;
    this.ejercicioService.getExercisesByCategory(categoryId).subscribe({
      next: (data) => {
        this.exercises = data.results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exercises:', error);
        this.isLoading = false;
      }
    });
  }

  loadExerciseDetails(exerciseId: number): void {
    this.isLoading = true;
    this.ejercicioService.getExerciseDetails(exerciseId).subscribe({
      next: (data) => {
        this.exerciseDetails = data;
        this.loadExerciseImages(exerciseId);
      },
      error: (error) => {
        console.error('Error loading exercise details:', error);
        this.isLoading = false;
      }
    });
  }

  loadExerciseImages(exerciseId: number): void {
    this.ejercicioService.getExerciseImages(exerciseId).subscribe({
      next: (data) => {
        this.exerciseImages = data.results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exercise images:', error);
        this.isLoading = false;
      }
    });
  }

  loadWorkoutRoutines(): void {
    this.ejercicioService.getWorkoutRoutines().subscribe({
      next: (data) => {
        this.workoutRoutines = data;
      },
      error: (error) => {
        console.error('Error loading workout routines:', error);
      }
    });
  }

  showExerciseDetails(exercise: any): void {
    this.selectedExercise = exercise;
    this.loadExerciseDetails(exercise.id);
  }

  closeExerciseDetails(): void {
    this.selectedExercise = null;
    this.exerciseDetails = null;
    this.exerciseImages = [];
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}