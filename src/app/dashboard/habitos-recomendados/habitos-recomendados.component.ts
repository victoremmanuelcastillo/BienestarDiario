// habitos-recomendados.component.ts
import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Reutilizamos los tipos del dashboard
type CategoryType = 'health' | 'exercise' | 'nutrition' | 'meditation' | 'sleep' | 'other';

export interface HabitoRecomendado {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number[];
  customDayOfMonth?: number;
}

@Component({
  selector: 'app-habitos-recomendados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habitos-recomendados.component.html',
  styleUrls: ['./habitos-recomendados.component.css']
})
export class HabitosRecomendadosComponent implements OnInit, OnChanges {
  @Input() habitosActuales: any[] = []; // Recibe los hábitos actuales del usuario
  @Output() agregarHabito = new EventEmitter<HabitoRecomendado>();
  
  recomendaciones: HabitoRecomendado[] = [];
  recomendacionesFiltradas: HabitoRecomendado[] = [];
  
  categories = [
    { value: 'health', name: 'Salud', icon: '🏥', color: '#4CAF50' },
    { value: 'exercise', name: 'Ejercicio', icon: '💪', color: '#2196F3' },
    { value: 'nutrition', name: 'Nutrición', icon: '🥗', color: '#FF9800' },
    { value: 'meditation', name: 'Meditación', icon: '🧘', color: '#9C27B0' },
    { value: 'sleep', name: 'Sueño', icon: '😴', color: '#3F51B5' },
    { value: 'other', name: 'Otro', icon: '📌', color: '#607D8B' }
  ];

  constructor() {}

  ngOnInit() {
    this.cargarRecomendaciones();
  }

  ngOnChanges() {
    // Filtrar recomendaciones cuando cambien los hábitos actuales
    this.filtrarRecomendaciones();
  }

  cargarRecomendaciones() {
    // Lista predefinida de hábitos recomendados
    this.recomendaciones = [
      {
        id: 'rec1',
        title: 'Beber 2 litros de agua',
        description: 'Mantente hidratado durante todo el día',
        category: 'health',
        frequency: 'daily'
      },
      {
        id: 'rec2',
        title: 'Meditar 10 minutos',
        description: 'Practica mindfulness para reducir el estrés',
        category: 'meditation',
        frequency: 'daily'
      },
      {
        id: 'rec3',
        title: 'Caminar 30 minutos',
        description: 'Actividad física moderada para mejorar la salud cardiovascular',
        category: 'exercise',
        frequency: 'daily'
      },
      {
        id: 'rec4',
        title: 'Comer 5 porciones de frutas/verduras',
        description: 'Aumenta tu consumo de nutrientes esenciales',
        category: 'nutrition',
        frequency: 'daily'
      },
      {
        id: 'rec5',
        title: 'Dormir 8 horas',
        description: 'Mantén un horario regular de sueño',
        category: 'sleep',
        frequency: 'daily'
      },
      {
        id: 'rec6',
        title: 'Estiramientos matutinos',
        description: '5 minutos de estiramientos al despertar',
        category: 'exercise',
        frequency: 'daily'
      },
      {
        id: 'rec7',
        title: 'Planificar comidas semanales',
        description: 'Organiza tu alimentación para la semana',
        category: 'nutrition',
        frequency: 'weekly',
        customDayOfMonth: 1
      },
      {
        id: 'rec8',
        title: 'Desconexión digital',
        description: 'Una hora sin dispositivos electrónicos antes de dormir',
        category: 'sleep',
        frequency: 'daily'
      }
    ];
    
    this.filtrarRecomendaciones();
  }

  filtrarRecomendaciones() {
    // Filtrar recomendaciones que ya tiene el usuario
    this.recomendacionesFiltradas = this.recomendaciones.filter(rec => 
      !this.habitosActuales.some(hab => 
        hab.title.toLowerCase() === rec.title.toLowerCase()
      )
    );
  }

  agregarRecomendacion(recomendacion: HabitoRecomendado) {
    this.agregarHabito.emit(recomendacion);
    
    // Eliminar inmediatamente de la lista filtrada para mejor UX
    this.recomendacionesFiltradas = this.recomendacionesFiltradas.filter(
      rec => rec.id !== recomendacion.id
    );
  }

  getCategoryInfo(category: string) {
    return this.categories.find(c => c.value === category) || this.categories[5];
  }
}