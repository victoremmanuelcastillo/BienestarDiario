// src/app/services/ejercicio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export interface Categoria {
  id: number;
  nombre: string;
  imagen: string;
  descripcion: string;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  instrucciones?: string[];
  musculos?: string[];
  dificultad?: string;
  equipamiento?: string;
  video?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {
  private apiUrl = 'https://wger.de/api/v2';
  
  constructor(private http: HttpClient) { }

  // Obtener categorías de ejercicios
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<any>(`${this.apiUrl}/exercisecategory/`).pipe(
      map((response: any) => {
        // Transformar la respuesta de la API a nuestro formato
        if (response && response.results) {
          return response.results.map((cat: any) => ({
            id: cat.id,
            nombre: cat.name,
            imagen: this.getCategoriaImagen(cat.name),
            descripcion: this.getDescripcionCategoria(cat.name)
          }));
        }
        return this.getCategoriasEjemplo();
      }),
      catchError(error => {
        console.error('Error al obtener categorías:', error);
        return of(this.getCategoriasEjemplo());
      })
    );
  }

  // Obtener ejercicios por categoría
  getEjerciciosPorCategoria(categoriaId: number): Observable<Ejercicio[]> {
    return this.http.get<any>(`${this.apiUrl}/exercise/?category=${categoriaId}&language=2`).pipe(
      map((response: any) => {
        // Transformar la respuesta de la API a nuestro formato
        if (response && response.results) {
          return response.results.map((ej: any) => ({
            id: ej.id,
            nombre: ej.name,
            descripcion: ej.description || 'Sin descripción disponible',
            imagen: this.getEjercicioImagen(ej.name)
          }));
        }
        return this.getEjerciciosEjemploPorCategoria(categoriaId);
      }),
      catchError(error => {
        console.error('Error al obtener ejercicios:', error);
        return of(this.getEjerciciosEjemploPorCategoria(categoriaId));
      })
    );
  }

  // Obtener detalles de un ejercicio específico
  getDetallesEjercicio(ejercicioId: number): Observable<Partial<Ejercicio>> {
    return this.http.get<any>(`${this.apiUrl}/exerciseinfo/${ejercicioId}/`).pipe(
      map((response: any) => {
        // Transformar la respuesta de la API a nuestro formato
        if (response) {
          return {
            instrucciones: this.parseInstrucciones(response.description),
            musculos: response.muscles ? response.muscles.map((m: any) => m.name) : ['No especificado'],
            dificultad: this.getDificultad(response.category ? response.category.id : 0),
            equipamiento: response.equipment ? response.equipment.map((e: any) => e.name).join(', ') : 'Ninguno',
            video: this.getVideoUrl(response.name || '')
          };
        }
        return this.getDetallesEjercicioEjemplo(ejercicioId);
      }),
      catchError(error => {
        console.error('Error al obtener detalles del ejercicio:', error);
        return of(this.getDetallesEjercicioEjemplo(ejercicioId));
      })
    );
  }

  // Métodos auxiliares para generar datos cuando la API no proporciona toda la información
  private getCategoriaImagen(categoria: string): string {
    const imagenes: { [key: string]: string } = {
      'Arms': 'assets/images/ejercicios/brazos.jpg',
      'Legs': 'assets/images/ejercicios/piernas.jpg',
      'Abs': 'assets/images/ejercicios/abdomen.jpg',
      'Back': 'assets/images/ejercicios/espalda.jpg',
      'Chest': 'assets/images/ejercicios/pecho.jpg',
      'Shoulders': 'assets/images/ejercicios/hombros.jpg',
      'Calves': 'assets/images/ejercicios/pantorrillas.jpg'
    };
    
    return imagenes[categoria] || 'assets/images/ejercicios/default.jpg';
  }

  private getDescripcionCategoria(categoria: string): string {
    const descripciones: { [key: string]: string } = {
      'Arms': 'Ejercicios para fortalecer los músculos de los brazos',
      'Legs': 'Ejercicios para fortalecer los músculos de las piernas',
      'Abs': 'Ejercicios para fortalecer los músculos abdominales',
      'Back': 'Ejercicios para fortalecer los músculos de la espalda',
      'Chest': 'Ejercicios para fortalecer los músculos del pecho',
      'Shoulders': 'Ejercicios para fortalecer los músculos de los hombros',
      'Calves': 'Ejercicios para fortalecer los músculos de las pantorrillas'
    };
    
    return descripciones[categoria] || 'Ejercicios para mejorar tu condición física';
  }

  private getEjercicioImagen(nombre: string): string {
    // Simplemente para demostración, en un entorno real podrías tener un mapeo más completo
    // o usar imágenes de la API si están disponibles
    const nombreLower = nombre.toLowerCase();
    
    if (nombreLower.includes('curl') || nombreLower.includes('bicep')) {
      return 'assets/images/ejercicios/curl-biceps.jpg';
    } else if (nombreLower.includes('triceps') || nombreLower.includes('extension')) {
      return 'assets/images/ejercicios/extension-triceps.jpg';
    } else if (nombreLower.includes('squat') || nombreLower.includes('sentadilla')) {
      return 'assets/images/ejercicios/sentadillas.jpg';
    } else if (nombreLower.includes('crunch') || nombreLower.includes('abdominal')) {
      return 'assets/images/ejercicios/crunches.jpg';
    } else if (nombreLower.includes('plank') || nombreLower.includes('plancha')) {
      return 'assets/images/ejercicios/plancha.jpg';
    } else if (nombreLower.includes('press') || nombreLower.includes('bench')) {
      return 'assets/images/ejercicios/press-banca.jpg';
    } else if (nombreLower.includes('pull') || nombreLower.includes('row')) {
      return 'assets/images/ejercicios/remo.jpg';
    }
    
    return 'assets/images/ejercicios/default.jpg';
  }

  private parseInstrucciones(descripcion: string): string[] {
    // Convertir la descripción HTML en pasos de instrucciones
    // Esto es una simplificación, en un entorno real podrías usar un parser HTML
    if (!descripcion) return ['No hay instrucciones disponibles'];
    
    // Eliminar etiquetas HTML
    const textoLimpio = descripcion.replace(/<[^>]*>/g, '');
    
    // Dividir por puntos o saltos de línea
    let pasos = textoLimpio.split(/\.\s+|\n+/);
    
    // Filtrar pasos vacíos y formatear
    pasos = pasos.filter(paso => paso.trim().length > 0)
                 .map(paso => paso.trim())
                 .slice(0, 5); // Limitar a 5 pasos para simplificar
    
    if (pasos.length === 0) {
      return ['No hay instrucciones detalladas disponibles'];
    }
    
    return pasos;
  }

  private getDificultad(categoriaId: number): string {
    // Asignar dificultad basada en la categoría
    const dificultades: { [key: number]: string } = {
      8: 'Principiante', // Arms
      9: 'Principiante', // Legs
      10: 'Intermedio', // Abs
      12: 'Avanzado', // Back
      11: 'Intermedio', // Chest
      13: 'Intermedio', // Shoulders
      14: 'Principiante' // Calves
    };
    
    return dificultades[categoriaId] || 'Intermedio';
  }

  private getVideoUrl(nombre: string): string {
    // En un entorno real, podrías tener una base de datos de videos
    // Aquí simplemente devolvemos algunos videos de ejemplo basados en el nombre
    const nombreLower = nombre.toLowerCase();
    
    if (nombreLower.includes('curl') || nombreLower.includes('bicep')) {
      return 'https://www.youtube.com/embed/ykJmrZ5v0Oo';
    } else if (nombreLower.includes('triceps') || nombreLower.includes('extension')) {
      return 'https://www.youtube.com/embed/nRiJVZDpdL0';
    } else if (nombreLower.includes('squat') || nombreLower.includes('sentadilla')) {
      return 'https://www.youtube.com/embed/aclHkVaku9U';
    } else if (nombreLower.includes('crunch') || nombreLower.includes('abdominal')) {
      return 'https://www.youtube.com/embed/Xyd_fa5zoEU';
    } else if (nombreLower.includes('plank') || nombreLower.includes('plancha')) {
      return 'https://www.youtube.com/embed/pSHjTRCQxIw';
    } else if (nombreLower.includes('press') || nombreLower.includes('bench')) {
      return 'https://www.youtube.com/embed/rT7DgCr-3pg';
    } else if (nombreLower.includes('pull') || nombreLower.includes('row')) {
      return 'https://www.youtube.com/embed/GZbfZ033f74';
    }
    
    // Video genérico si no hay coincidencia
    return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  }

  // Datos de ejemplo para cuando la API no está disponible
  getCategoriasEjemplo(): Categoria[] {
    return [
      { id: 1, nombre: 'Brazos', imagen: 'assets/images/ejercicios/brazos.jpg', descripcion: 'Ejercicios para fortalecer los músculos de los brazos' },
      { id: 2, nombre: 'Piernas', imagen: 'assets/images/ejercicios/piernas.jpg', descripcion: 'Ejercicios para fortalecer los músculos de las piernas' },
      { id: 3, nombre: 'Abdomen', imagen: 'assets/images/ejercicios/abdomen.jpg', descripcion: 'Ejercicios para fortalecer los músculos abdominales' },
      { id: 4, nombre: 'Espalda', imagen: 'assets/images/ejercicios/espalda.jpg', descripcion: 'Ejercicios para fortalecer los músculos de la espalda' },
      { id: 5, nombre: 'Pecho', imagen: 'assets/images/ejercicios/pecho.jpg', descripcion: 'Ejercicios para fortalecer los músculos del pecho' },
      { id: 6, nombre: 'Cardio', imagen: 'assets/images/ejercicios/cardio.jpg', descripcion: 'Ejercicios cardiovasculares para mejorar la resistencia' },
      { id: 7, nombre: 'Estiramiento', imagen: 'assets/images/ejercicios/estiramiento.jpg', descripcion: 'Ejercicios de estiramiento para mejorar la flexibilidad' }
    ];
  }

  getEjerciciosEjemploPorCategoria(categoriaId: number): Ejercicio[] {
    const ejerciciosPorCategoria: { [key: number]: Ejercicio[] } = {
      1: [ // Brazos
        { 
          id: 101, 
          nombre: 'Curl de bíceps con mancuernas', 
          imagen: 'assets/images/ejercicios/curl-biceps.jpg',
          descripcion: 'Ejercicio para fortalecer los bíceps'
        },
        { 
          id: 102, 
          nombre: 'Extensiones de tríceps', 
          imagen: 'assets/images/ejercicios/extension-triceps.jpg',
          descripcion: 'Ejercicio para fortalecer los tríceps'
        },
        { 
          id: 103, 
          nombre: 'Fondos en paralelas', 
          imagen: 'assets/images/ejercicios/fondos-paralelas.jpg',
          descripcion: 'Ejercicio para fortalecer los tríceps y pectorales'
        },
        { 
          id: 104, 
          nombre: 'Martillo con mancuernas', 
          imagen: 'assets/images/ejercicios/martillo-mancuernas.jpg',
          descripcion: 'Ejercicio para fortalecer los bíceps y antebrazos'
        },
        { 
          id: 105, 
          nombre: 'Press francés', 
          imagen: 'assets/images/ejercicios/press-frances.jpg',
          descripcion: 'Ejercicio para fortalecer los tríceps'
        }
      ],
      2: [ // Piernas
        { 
          id: 201, 
          nombre: 'Sentadillas', 
          imagen: 'assets/images/ejercicios/sentadillas.jpg',
          descripcion: 'Ejercicio para fortalecer los músculos de las piernas'
        },
        { 
          id: 202, 
          nombre: 'Estocadas', 
          imagen: 'assets/images/ejercicios/estocadas.jpg',
          descripcion: 'Ejercicio para fortalecer los músculos de las piernas'
        }
      ],
      3: [ // Abdomen
        { 
          id: 301, 
          nombre: 'Crunches', 
          imagen: 'assets/images/ejercicios/crunches.jpg',
          descripcion: 'Ejercicio para fortalecer los músculos abdominales'
        },
        { 
          id: 302, 
          nombre: 'Plancha', 
          imagen: 'assets/images/ejercicios/plancha.jpg',
          descripcion: 'Ejercicio para fortalecer el core'
        }
      ]
    };
    
    return ejerciciosPorCategoria[categoriaId] || [];
  }

  getDetallesEjercicioEjemplo(ejercicioId: number): Partial<Ejercicio> {
    const detallesPorId: { [key: number]: Partial<Ejercicio> } = {
      101: {
        instrucciones: [
          'Párate con los pies separados al ancho de los hombros',
          'Sostén una mancuerna en cada mano con los brazos extendidos',
          'Flexiona los codos y levanta las mancuernas hacia los hombros',
          'Baja lentamente a la posición inicial',
          'Repite 10-12 veces para 3 series'
        ],
        musculos: ['Bíceps braquial', 'Braquial anterior'],
        dificultad: 'Principiante',
        equipamiento: 'Mancuernas',
        video: 'https://www.youtube.com/embed/ykJmrZ5v0Oo'
      },
      102: {
        instrucciones: [
          'Siéntate en un banco con una mancuerna sostenida con ambas manos',
          'Levanta la mancuerna sobre tu cabeza con los brazos extendidos',
          'Baja la mancuerna detrás de tu cabeza flexionando los codos',
          'Extiende los codos para volver a la posición inicial',
          'Repite 10-12 veces para 3 series'
        ],
        musculos: ['Tríceps braquial'],
        dificultad: 'Intermedio',
        equipamiento: 'Mancuernas',
        video: 'https://www.youtube.com/embed/nRiJVZDpdL0'
      },
      103: {
        instrucciones: [
          'Sujétate en las barras paralelas con los brazos extendidos',
          'Baja el cuerpo flexionando los codos hasta formar un ángulo de 90 grados',
          'Empuja hacia arriba hasta extender completamente los brazos',
          'Mantén el torso ligeramente inclinado hacia adelante para enfocarte en los tríceps',
          'Repite 8-10 veces para 3 series'
        ],
        musculos: ['Tríceps braquial', 'Pectoral mayor', 'Deltoides anterior'],
        dificultad: 'Avanzado',
        equipamiento: 'Barras paralelas',
        video: 'https://www.youtube.com/embed/eERwCQHZqfA'
      }
    };
    
    return detallesPorId[ejercicioId] || {
      instrucciones: ['No hay instrucciones disponibles para este ejercicio'],
      musculos: ['Información no disponible'],
      dificultad: 'Intermedio',
      equipamiento: 'No especificado',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    };
  }
}