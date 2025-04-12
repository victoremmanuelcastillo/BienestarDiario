// src/app/services/ejercicio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {
  // API de Wger
  private readonly API_URL = 'https://wger.de/api/v2';
  
  constructor(private http: HttpClient) { }

  // Obtener categorías de ejercicios
  getExerciseCategories(): Observable<any> {
    return this.http.get(`${this.API_URL}/exercisecategory/`).pipe(
      catchError(error => {
        console.error('Error fetching exercise categories:', error);
        return this.getMockCategories();
      })
    );
  }

  // Obtener ejercicios por categoría
  getExercisesByCategory(categoryId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/exercise/?category=${categoryId}&language=2`).pipe(
      catchError(error => {
        console.error('Error fetching exercises:', error);
        return this.getMockExercises();
      })
    );
  }

  // Obtener información detallada de un ejercicio
  getExerciseDetails(exerciseId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/exerciseinfo/${exerciseId}`).pipe(
      catchError(error => {
        console.error('Error fetching exercise details:', error);
        return this.getMockExerciseDetails();
      })
    );
  }

  // Obtener imágenes de un ejercicio
  getExerciseImages(exerciseId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/exerciseimage/?exercise=${exerciseId}`).pipe(
      catchError(error => {
        console.error('Error fetching exercise images:', error);
        return of({ results: [] });
      })
    );
  }

  // Datos simulados para cuando la API no está disponible
  getMockCategories(): Observable<any> {
    return of({
      results: [
        { id: 1, name: 'Brazos' },
        { id: 2, name: 'Piernas' },
        { id: 3, name: 'Abdominales' },
        { id: 4, name: 'Pecho' },
        { id: 5, name: 'Espalda' },
        { id: 6, name: 'Hombros' },
        { id: 7, name: 'Cardio' }
      ]
    });
  }

  getMockExercises(): Observable<any> {
    return of({
      results: [
        {
          id: 1,
          name: 'Flexiones',
          description: 'Ejercicio clásico para pecho, hombros y tríceps',
          category: 4
        },
        {
          id: 2,
          name: 'Sentadillas',
          description: 'Ejercicio fundamental para piernas y glúteos',
          category: 2
        },
        {
          id: 3,
          name: 'Abdominales',
          description: 'Ejercicio básico para fortalecer el core',
          category: 3
        }
      ]
    });
  }

  getMockExerciseDetails(): Observable<any> {
    return of({
      id: 1,
      name: 'Flexiones',
      description: '<p>Las flexiones son un ejercicio clásico que trabaja principalmente el pecho, los hombros y los tríceps.</p><p>Instrucciones:</p><ol><li>Colócate boca abajo con las manos ligeramente más separadas que el ancho de los hombros.</li><li>Mantén el cuerpo recto desde la cabeza hasta los talones.</li><li>Baja el cuerpo doblando los codos hasta casi tocar el suelo.</li><li>Empuja hacia arriba hasta extender completamente los brazos.</li><li>Repite el movimiento.</li></ol>',
      category: { id: 4, name: 'Pecho' },
      muscles: [{ id: 4, name: 'Pectorales' }, { id: 5, name: 'Tríceps' }],
      equipment: [{ id: 1, name: 'Ninguno' }]
    });
  }

  // Obtener rutinas de ejercicio predefinidas
  getWorkoutRoutines(): Observable<any> {
    return of([
      {
        id: 1,
        name: 'Rutina para principiantes',
        description: 'Ideal para personas que comienzan a ejercitarse',
        difficulty: 'Principiante',
        duration: '30 minutos',
        exercises: [
          { id: 1, name: 'Flexiones', sets: 3, reps: '8-10', rest: '60 seg' },
          { id: 2, name: 'Sentadillas', sets: 3, reps: '12-15', rest: '60 seg' },
          { id: 3, name: 'Abdominales', sets: 3, reps: '15-20', rest: '60 seg' },
          { id: 4, name: 'Plancha', sets: 3, reps: '30 seg', rest: '60 seg' }
        ]
      },
      {
        id: 2,
        name: 'Rutina de fuerza completa',
        description: 'Trabaja todos los grupos musculares principales',
        difficulty: 'Intermedio',
        duration: '45-60 minutos',
        exercises: [
          { id: 5, name: 'Dominadas', sets: 4, reps: '6-8', rest: '90 seg' },
          { id: 6, name: 'Press de banca', sets: 4, reps: '8-10', rest: '90 seg' },
          { id: 7, name: 'Peso muerto', sets: 4, reps: '8-10', rest: '120 seg' },
          { id: 8, name: 'Press militar', sets: 4, reps: '8-10', rest: '90 seg' },
          { id: 9, name: 'Remo con barra', sets: 4, reps: '8-10', rest: '90 seg' }
        ]
      },
      {
        id: 3,
        name: 'Rutina HIIT',
        description: 'Entrenamiento de alta intensidad para quemar grasa',
        difficulty: 'Avanzado',
        duration: '25 minutos',
        exercises: [
          { id: 10, name: 'Burpees', sets: 5, reps: '30 seg', rest: '15 seg' },
          { id: 11, name: 'Mountain climbers', sets: 5, reps: '30 seg', rest: '15 seg' },
          { id: 12, name: 'Jumping jacks', sets: 5, reps: '30 seg', rest: '15 seg' },
          { id: 13, name: 'Saltos de caja', sets: 5, reps: '30 seg', rest: '15 seg' },
          { id: 14, name: 'Sprint en el sitio', sets: 5, reps: '30 seg', rest: '15 seg' }
        ]
      }
    ]);
  }
}