import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { HabitosRecomendadosComponent, HabitoRecomendado } from './habitos-recomendados/habitos-recomendados.component';
import { MotivacionComponent } from './motivacion/motivacion.component';

// Definir el tipo de categoría
type CategoryType = 'health' | 'exercise' | 'nutrition' | 'meditation' | 'sleep' | 'other';

interface Activity {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number[];
  customDayOfMonth?: number;
  category: CategoryType;
  streak: number;
  lastCompletedDate?: Date;
  completionHistory: Date[]; // Historial de completados
}

interface CategoryInfo {
  value: CategoryType;
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HabitosRecomendadosComponent, MotivacionComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Eliminamos el ViewChild ya que ahora es condicional
  private destroy$ = new Subject<void>();
  
  userName: string = '';
  currentDate = new Date();
  greeting: string = '';
  
  activities: Activity[] = [];
  showAddActivity = false;
  
  // Formulario para nueva actividad
  newActivity = {
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    category: 'health' as CategoryType,
    customDays: [] as number[],
    customDayOfMonth: 1
  };
  
  weekDays = [
    { value: 0, name: 'Domingo', selected: false },
    { value: 1, name: 'Lunes', selected: false },
    { value: 2, name: 'Martes', selected: false },
    { value: 3, name: 'Miércoles', selected: false },
    { value: 4, name: 'Jueves', selected: false },
    { value: 5, name: 'Viernes', selected: false },
    { value: 6, name: 'Sábado', selected: false }
  ];
  
  categories: CategoryInfo[] = [
    { value: 'health', name: 'Salud', icon: '🏥', color: '#4CAF50' },
    { value: 'exercise', name: 'Ejercicio', icon: '💪', color: '#2196F3' },
    { value: 'nutrition', name: 'Nutrición', icon: '🥗', color: '#FF9800' },
    { value: 'meditation', name: 'Meditación', icon: '🧘', color: '#9C27B0' },
    { value: 'sleep', name: 'Sueño', icon: '😴', color: '#3F51B5' },
    { value: 'other', name: 'Otro', icon: '📌', color: '#607D8B' }
  ];
  
  // Estadísticas
  stats = {
    totalActivities: 0,
    completedToday: 0,
    currentStreak: 0,
    completionRate: 0
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userName = user.name;
        }
      });
    
    this.setGreeting();
    this.loadActivities();
    this.updateStats();
    
    // Actualizar cada minuto
    setInterval(() => {
      this.currentDate = new Date();
      this.setGreeting();
    }, 60000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setGreeting() {
    const hour = this.currentDate.getHours();
    if (hour < 12) {
      this.greeting = 'Buenos días';
    } else if (hour < 19) {
      this.greeting = 'Buenas tardes';
    } else {
      this.greeting = 'Buenas noches';
    }
  }

  loadActivities() {
    // Cargar actividades desde localStorage
    const stored = localStorage.getItem('userActivities');
    if (stored) {
      this.activities = JSON.parse(stored).map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        completedAt: a.completedAt ? new Date(a.completedAt) : undefined,
        lastCompletedDate: a.lastCompletedDate ? new Date(a.lastCompletedDate) : undefined,
        completionHistory: (a.completionHistory || []).map((d: string) => new Date(d))
      }));
    }
    
    this.checkAndResetDailyActivities();
    this.calculateStreaks();
  }

  checkAndResetDailyActivities() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.activities.forEach(activity => {
      if (activity.lastCompletedDate) {
        const lastCompleted = new Date(activity.lastCompletedDate);
        lastCompleted.setHours(0, 0, 0, 0);
        
        // Si es un nuevo día, resetear el estado de completado
        if (lastCompleted < today && this.shouldShowActivityToday(activity)) {
          activity.completed = false;
        }
      }
    });
    
    this.saveActivities();
  }

  calculateStreaks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.activities.forEach(activity => {
      if (!activity.completionHistory || activity.completionHistory.length === 0) {
        activity.streak = 0;
        return;
      }
      
      // Ordenar historial de más reciente a más antiguo
      const history = [...activity.completionHistory]
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());
      
      let streak = 0;
      let checkDate = new Date(today);
      
      // Si la actividad está completada hoy, empezar desde hoy
      if (activity.completed && activity.lastCompletedDate) {
        const lastDate = new Date(activity.lastCompletedDate);
        lastDate.setHours(0, 0, 0, 0);
        if (lastDate.getTime() === today.getTime()) {
          streak = 1;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
      
      // Contar días consecutivos hacia atrás
      for (const date of history) {
        const completedDate = new Date(date);
        completedDate.setHours(0, 0, 0, 0);
        
        if (completedDate.getTime() === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (completedDate.getTime() < checkDate.getTime()) {
          break;
        }
      }
      
      activity.streak = streak;
    });
  }

  shouldShowActivityToday(activity: Activity): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    
    switch (activity.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return dayOfWeek === 1; // Lunes
      case 'monthly':
        return dayOfMonth === (activity.customDayOfMonth || 1);
      case 'custom':
        return activity.customDays?.includes(dayOfWeek) || false;
      default:
        return true;
    }
  }

  getActivitiesForToday(): Activity[] {
    return this.activities.filter(a => this.shouldShowActivityToday(a));
  }

  toggleActivity(activity: Activity) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!activity.completed) {
      // Marcar como completada
      activity.completed = true;
      activity.completedAt = new Date();
      activity.lastCompletedDate = new Date();
      
      // Inicializar historial si no existe
      if (!activity.completionHistory) {
        activity.completionHistory = [];
      }
      
      // Verificar si ya se completó hoy
      const alreadyCompletedToday = activity.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      
      if (!alreadyCompletedToday) {
        activity.completionHistory.push(new Date());
      }
    } else {
      // Desmarcar como completada
      activity.completed = false;
      activity.completedAt = undefined;
      
      // Remover de historial si se completó hoy
      if (activity.completionHistory) {
        activity.completionHistory = activity.completionHistory.filter(date => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() !== today.getTime();
        });
      }
    }
    
    this.calculateStreaks();
    this.saveActivities();
    this.updateStats();
    
    // Actualizar mensaje de motivación cuando cambie el progreso
    this.actualizarMotivacion();
  }

  addActivity() {
    if (!this.newActivity.title.trim()) return;
    
    const activity: Activity = {
      id: Date.now().toString(),
      title: this.newActivity.title,
      description: this.newActivity.description,
      completed: false,
      createdAt: new Date(),
      frequency: this.newActivity.frequency,
      category: this.newActivity.category,
      customDays: this.newActivity.frequency === 'custom' ? 
        this.weekDays.filter(d => d.selected).map(d => d.value) : undefined,
      customDayOfMonth: this.newActivity.frequency === 'monthly' ? 
        this.newActivity.customDayOfMonth : undefined,
      streak: 0,
      completionHistory: []
    };
    
    this.activities.push(activity);
    this.saveActivities();
    this.resetForm();
    this.updateStats();
    
    // Actualizar mensaje de motivación
    this.actualizarMotivacion();
  }

  // Método para agregar recomendaciones
  agregarRecomendacion(recomendacion: HabitoRecomendado) {
    const activity: Activity = {
      id: Date.now().toString(),
      title: recomendacion.title,
      description: recomendacion.description,
      completed: false,
      createdAt: new Date(),
      frequency: recomendacion.frequency,
      category: recomendacion.category,
      customDays: recomendacion.customDays,
      customDayOfMonth: recomendacion.customDayOfMonth,
      streak: 0,
      completionHistory: []
    };
    
    this.activities.push(activity);
    this.saveActivities();
    this.updateStats();
    
    // Actualizar mensaje de motivación
    this.actualizarMotivacion();
  }

  deleteActivity(id: string) {
    this.activities = this.activities.filter(a => a.id !== id);
    this.saveActivities();
    this.updateStats();
    
    // Actualizar mensaje de motivación
    this.actualizarMotivacion();
  }

  saveActivities() {
    localStorage.setItem('userActivities', JSON.stringify(this.activities));
  }

  resetForm() {
    this.newActivity = {
      title: '',
      description: '',
      frequency: 'daily',
      category: 'health',
      customDays: [],
      customDayOfMonth: 1
    };
    this.weekDays.forEach(d => d.selected = false);
    this.showAddActivity = false;
  }

  updateStats() {
    const todayActivities = this.getActivitiesForToday();
    this.stats.totalActivities = todayActivities.length;
    this.stats.completedToday = todayActivities.filter(a => a.completed).length;
    this.stats.completionRate = this.stats.totalActivities > 0 ? 
      Math.round((this.stats.completedToday / this.stats.totalActivities) * 100) : 0;
    
    // Calcular racha máxima actual (no la histórica)
    this.stats.currentStreak = Math.max(...this.activities.map(a => a.streak || 0), 0);
  }

  // Método para actualizar la motivación - Simplificado ya que el componente es condicional
  private actualizarMotivacion() {
    // El componente se actualiza automáticamente cuando cambian las stats
    // ya que usa *ngIf y recibe [stats] como input
  }

  // Método para determinar si el usuario necesita motivación
  necesitaMotivacion(): boolean {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    
    // Mostrar motivación en estas situaciones:
    
    // 1. Si no tiene actividades para hoy
    if (this.stats.totalActivities === 0) {
      return true;
    }
    
    // 2. Si tiene muy bajo progreso después del mediodía
    if (horaActual >= 12 && this.stats.completionRate < 25) {
      return true;
    }
    
    // 3. Si tiene progreso estancado después de las 3 PM
    if (horaActual >= 15 && this.stats.completionRate < 50) {
      return true;
    }
    
    // 4. Si es tarde (después de las 6 PM) y no ha completado al menos 75%
    if (horaActual >= 18 && this.stats.completionRate < 75) {
      return true;
    }
    
    // 5. Si tiene una racha baja (menos de 3 días)
    if (this.stats.currentStreak < 3 && this.stats.totalActivities > 0) {
      return true;
    }
    
    // 6. Si es el primer día de la semana (lunes) para motivar
    const diaSemana = ahora.getDay();
    if (diaSemana === 1 && this.stats.completionRate < 100) {
      return true;
    }
    
    return false;
  }

  getCategoryInfo(category: string): CategoryInfo {
    return this.categories.find(c => c.value === category) || this.categories[5];
  }

  getFrequencyText(activity: Activity): string {
    switch (activity.frequency) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return `Día ${activity.customDayOfMonth} de cada mes`;
      case 'custom':
        const days = activity.customDays?.map(d => 
          this.weekDays.find(wd => wd.value === d)?.name
        ).filter(Boolean).join(', ');
        return days || 'Personalizado';
      default:
        return '';
    }
  }
}