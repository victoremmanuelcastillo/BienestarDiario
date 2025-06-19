// src/app/ejercicio/services/ejercicio.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Ejercicio {
  id: number;
  nombre: string;
  categoria: string;
  musculosObjetivo: string[];
  imagen: string;
}

export interface EjercicioEnRutina {
  ejercicio: Ejercicio;
  series: number;
  repeticiones: number;
  peso?: number;
  tiempo?: number;
  descanso: number;
  notas?: string;
  completado: boolean;
}

export interface Rutina {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  duracionEstimada: number;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  ejercicios: EjercicioEnRutina[];
  fechaCreacion: Date;
  fechaUltimaEjecucion?: Date;
  vecesEjecutada: number;
  esPlantilla: boolean;
  esFavorita: boolean;
  imagen: string;
  etiquetas: string[];
}

export interface RegistroEjercicio {
  id: number;
  rutinaId: number;
  nombreRutina: string;
  fecha: Date;
  duracionReal: number;
  ejerciciosCompletados: number;
  ejerciciosTotal: number;
  caloriasQuemadas: number;
  notas: string;
  estado: 'completada' | 'incompleta' | 'pausada';
  categoria: string;
}

export interface EstadisticaEjercicio {
  fecha: string;
  duracion: number;
  calorias: number;
  ejercicios: number;
  categoria: string;
}

export interface ProgresoSemanal {
  semana: string;
  entrenamientos: number;
  tiempoTotal: number;
  caloriasQuemadas: number;
}

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {

  private historialSubject = new BehaviorSubject<RegistroEjercicio[]>([]);
  private rutinasSubject = new BehaviorSubject<Rutina[]>([]);

  // Observables públicos
  historial$ = this.historialSubject.asObservable();
  rutinas$ = this.rutinasSubject.asObservable();

  constructor() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    // Datos de ejemplo - en producción vendrían de una API
    const historialInicial: RegistroEjercicio[] = [
      {
        id: 1,
        rutinaId: 1,
        nombreRutina: 'Rutina Matutina Energizante',
        fecha: new Date('2025-06-03'),
        duracionReal: 45,
        ejerciciosCompletados: 8,
        ejerciciosTotal: 8,
        caloriasQuemadas: 320,
        notas: 'Excelente sesión matutina',
        estado: 'completada',
        categoria: 'cardio'
      },
      {
        id: 2,
        rutinaId: 2,
        nombreRutina: 'Fuerza Total',
        fecha: new Date('2025-06-04'),
        duracionReal: 50,
        ejerciciosCompletados: 6,
        ejerciciosTotal: 6,
        caloriasQuemadas: 380,
        notas: 'Buen entrenamiento de fuerza',
        estado: 'completada',
        categoria: 'fuerza'
      },
      {
        id: 3,
        rutinaId: 1,
        nombreRutina: 'Rutina Matutina Energizante',
        fecha: new Date('2025-06-05'),
        duracionReal: 40,
        ejerciciosCompletados: 7,
        ejerciciosTotal: 8,
        caloriasQuemadas: 290,
        notas: 'Día relajado',
        estado: 'incompleta',
        categoria: 'cardio'
      },
      {
        id: 4,
        rutinaId: 3,
        nombreRutina: 'Flexibilidad y Movilidad',
        fecha: new Date('2025-06-06'),
        duracionReal: 30,
        ejerciciosCompletados: 5,
        ejerciciosTotal: 5,
        caloriasQuemadas: 150,
        notas: 'Sesión de estiramiento',
        estado: 'completada',
        categoria: 'flexibilidad'
      },
      {
        id: 5,
        rutinaId: 2,
        nombreRutina: 'Fuerza Total',
        fecha: new Date('2025-06-07'),
        duracionReal: 55,
        ejerciciosCompletados: 6,
        ejerciciosTotal: 6,
        caloriasQuemadas: 420,
        notas: 'Aumenté pesos',
        estado: 'completada',
        categoria: 'fuerza'
      },
      {
        id: 6,
        rutinaId: 4,
        nombreRutina: 'HIIT Intenso',
        fecha: new Date('2025-06-08'),
        duracionReal: 25,
        ejerciciosCompletados: 4,
        ejerciciosTotal: 4,
        caloriasQuemadas: 350,
        notas: 'Entrenamiento intenso',
        estado: 'completada',
        categoria: 'hiit'
      },
      {
        id: 7,
        rutinaId: 1,
        nombreRutina: 'Rutina Matutina Energizante',
        fecha: new Date('2025-06-09'),
        duracionReal: 42,
        ejerciciosCompletados: 8,
        ejerciciosTotal: 8,
        caloriasQuemadas: 310,
        notas: 'Domingo activo',
        estado: 'completada',
        categoria: 'cardio'
      }
    ];

    this.historialSubject.next(historialInicial);
  }

  // Métodos para obtener datos
  obtenerHistorial(): RegistroEjercicio[] {
    return this.historialSubject.value;
  }

  obtenerRutinas(): Rutina[] {
    return this.rutinasSubject.value;
  }

  // Agregar nuevo registro
  agregarRegistro(registro: RegistroEjercicio): void {
    const historialActual = this.historialSubject.value;
    this.historialSubject.next([...historialActual, registro]);
  }

  // Actualizar rutinas
  actualizarRutinas(rutinas: Rutina[]): void {
    this.rutinasSubject.next(rutinas);
  }

  // Métodos para estadísticas
  obtenerEstadisticasSemana(fecha: Date = new Date()): EstadisticaEjercicio[] {
    const historial = this.obtenerHistorial();
    const inicioSemana = this.obtenerInicioSemana(fecha);
    const finSemana = new Date(inicioSemana.getTime() + 6 * 24 * 60 * 60 * 1000);

    return historial
      .filter(registro => {
        const fechaRegistro = new Date(registro.fecha);
        return fechaRegistro >= inicioSemana && fechaRegistro <= finSemana;
      })
      .map(registro => ({
        fecha: registro.fecha.toISOString().split('T')[0],
        duracion: registro.duracionReal,
        calorias: registro.caloriasQuemadas,
        ejercicios: registro.ejerciciosCompletados,
        categoria: registro.categoria
      }));
  }

  obtenerEstadisticasMes(fecha: Date = new Date()): EstadisticaEjercicio[] {
    const historial = this.obtenerHistorial();
    const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

    return historial
      .filter(registro => {
        const fechaRegistro = new Date(registro.fecha);
        return fechaRegistro >= inicioMes && fechaRegistro <= finMes;
      })
      .map(registro => ({
        fecha: registro.fecha.toISOString().split('T')[0],
        duracion: registro.duracionReal,
        calorias: registro.caloriasQuemadas,
        ejercicios: registro.ejerciciosCompletados,
        categoria: registro.categoria
      }));
  }

  obtenerProgresoSemanal(): ProgresoSemanal[] {
    const historial = this.obtenerHistorial();
    const hoy = new Date();
    const semanasAtras = 4;
    const progreso: ProgresoSemanal[] = [];

    for (let i = semanasAtras - 1; i >= 0; i--) {
      const fechaSemana = new Date(hoy.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const inicioSemana = this.obtenerInicioSemana(fechaSemana);
      const finSemana = new Date(inicioSemana.getTime() + 6 * 24 * 60 * 60 * 1000);

      const registrosSemana = historial.filter(registro => {
        const fechaRegistro = new Date(registro.fecha);
        return fechaRegistro >= inicioSemana && fechaRegistro <= finSemana;
      });

      const entrenamientos = registrosSemana.length;
      const tiempoTotal = registrosSemana.reduce((total, registro) => total + registro.duracionReal, 0);
      const caloriasQuemadas = registrosSemana.reduce((total, registro) => total + registro.caloriasQuemadas, 0);

      progreso.push({
        semana: `Semana ${semanasAtras - i}`,
        entrenamientos,
        tiempoTotal,
        caloriasQuemadas
      });
    }

    return progreso;
  }

  obtenerDistribucionCategorias(periodo: 'semana' | 'mes' | 'año' = 'semana'): { [categoria: string]: number } {
    let estadisticas: EstadisticaEjercicio[];

    switch (periodo) {
      case 'semana':
        estadisticas = this.obtenerEstadisticasSemana();
        break;
      case 'mes':
        estadisticas = this.obtenerEstadisticasMes();
        break;
      case 'año':
        estadisticas = this.obtenerEstadisticasAño();
        break;
      default:
        estadisticas = this.obtenerEstadisticasSemana();
    }

    return estadisticas.reduce((acc, stat) => {
      acc[stat.categoria] = (acc[stat.categoria] || 0) + 1;
      return acc;
    }, {} as { [categoria: string]: number });
  }

  private obtenerEstadisticasAño(fecha: Date = new Date()): EstadisticaEjercicio[] {
    const historial = this.obtenerHistorial();
    const inicioAño = new Date(fecha.getFullYear(), 0, 1);
    const finAño = new Date(fecha.getFullYear(), 11, 31);

    return historial
      .filter(registro => {
        const fechaRegistro = new Date(registro.fecha);
        return fechaRegistro >= inicioAño && fechaRegistro <= finAño;
      })
      .map(registro => ({
        fecha: registro.fecha.toISOString().split('T')[0],
        duracion: registro.duracionReal,
        calorias: registro.caloriasQuemadas,
        ejercicios: registro.ejerciciosCompletados,
        categoria: registro.categoria
      }));
  }

  private obtenerInicioSemana(fecha: Date): Date {
    const dia = fecha.getDay();
    const diferencia = fecha.getDate() - dia + (dia === 0 ? -6 : 1); // Lunes como primer día
    return new Date(fecha.setDate(diferencia));
  }

  // Métodos para cálculos rápidos
  calcularTotalEjercicios(periodo: 'semana' | 'mes' | 'año' = 'semana'): number {
    let estadisticas: EstadisticaEjercicio[];

    switch (periodo) {
      case 'semana':
        estadisticas = this.obtenerEstadisticasSemana();
        break;
      case 'mes':
        estadisticas = this.obtenerEstadisticasMes();
        break;
      case 'año':
        estadisticas = this.obtenerEstadisticasAño();
        break;
      default:
        estadisticas = this.obtenerEstadisticasSemana();
    }

    return estadisticas.reduce((total, stat) => total + stat.ejercicios, 0);
  }

  calcularTiempoTotal(periodo: 'semana' | 'mes' | 'año' = 'semana'): number {
    let estadisticas: EstadisticaEjercicio[];

    switch (periodo) {
      case 'semana':
        estadisticas = this.obtenerEstadisticasSemana();
        break;
      case 'mes':
        estadisticas = this.obtenerEstadisticasMes();
        break;
      case 'año':
        estadisticas = this.obtenerEstadisticasAño();
        break;
      default:
        estadisticas = this.obtenerEstadisticasSemana();
    }

    return estadisticas.reduce((total, stat) => total + stat.duracion, 0);
  }

  calcularCaloriasTotal(periodo: 'semana' | 'mes' | 'año' = 'semana'): number {
    let estadisticas: EstadisticaEjercicio[];

    switch (periodo) {
      case 'semana':
        estadisticas = this.obtenerEstadisticasSemana();
        break;
      case 'mes':
        estadisticas = this.obtenerEstadisticasMes();
        break;
      case 'año':
        estadisticas = this.obtenerEstadisticasAño();
        break;
      default:
        estadisticas = this.obtenerEstadisticasSemana();
    }

    return estadisticas.reduce((total, stat) => total + stat.calorias, 0);
  }
}