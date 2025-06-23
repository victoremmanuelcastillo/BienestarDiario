// habits-manager.component.ts - Componente separado para gestión de hábitos - VERSIÓN OPTIMIZADA
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

type CategoryType = 'health' | 'exercise' | 'nutrition' | 'meditation' | 'sleep' | 'other';
type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface HabitSchedule {
  id: string;
  time?: string;
  timeOfDay: TimeOfDay;
  notificationEnabled: boolean;
}

interface Habit {
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
  completionHistory: Date[];
  schedules: HabitSchedule[];
  scheduleCompletions?: { [key: string]: Date };
  isEditing?: boolean;
}

interface CategoryInfo {
  value: CategoryType;
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-habits-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habits-manager.component.html',
  styleUrls: ['./habits-manager.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class HabitsManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private notificationCheckInterval$ = interval(60000);

  // ========== PROPIEDADES DE CACHE PARA OPTIMIZACIÓN ==========
  private _cachedOrderedPeriods: any[] | null = null;
  private _lastOrderUpdateTime: number | null = null;
  private _habitsByTimeCache = new Map<string, Habit[]>();
  private _lastHabitsUpdate: number = 0;

  // Inputs para configurar el componente desde el padre
  @Input() showAddButton: boolean = true;
  @Input() compactMode: boolean = false;
  @Input() maxHabitsToShow: number = 0; // 0 = mostrar todos

  // Outputs para comunicarse con el componente padre
  @Output() habitAdded = new EventEmitter<Habit>();
  @Output() habitCompleted = new EventEmitter<{habit: Habit, schedule: HabitSchedule}>();
  @Output() habitDeleted = new EventEmitter<Habit>();
  @Output() statsChanged = new EventEmitter<any>();

  habits: Habit[] = [];
  showAddHabit = false;
  
  // Formulario para nuevo hábito
  newHabit = {
    title: '',
    description: '',
    category: 'health' as CategoryType,
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    customDays: [] as number[],
    customDayOfMonth: 1,
    schedules: [] as Omit<HabitSchedule, 'id'>[]
  };

  // Estados para edición
  editingHabit: Habit | null = null;
  editForm = { ...this.newHabit };

  // Categorías disponibles
  categories: CategoryInfo[] = [
    { value: 'health', name: 'Salud', icon: '🏥', color: '#4CAF50' },
    { value: 'exercise', name: 'Ejercicio', icon: '💪', color: '#2196F3' },
    { value: 'nutrition', name: 'Nutrición', icon: '🥗', color: '#FF9800' },
    { value: 'meditation', name: 'Meditación', icon: '🧘', color: '#9C27B0' },
    { value: 'sleep', name: 'Sueño', icon: '😴', color: '#3F51B5' },
    { value: 'other', name: 'Otro', icon: '📌', color: '#607D8B' }
  ];

  // Días de la semana
  weekDays = [
    { value: 1, name: 'Lunes' },
    { value: 2, name: 'Martes' },
    { value: 3, name: 'Miércoles' },
    { value: 4, name: 'Jueves' },
    { value: 5, name: 'Viernes' },
    { value: 6, name: 'Sábado' },
    { value: 0, name: 'Domingo' }
  ];

  // Períodos del día
  timeOfDayPeriods = [
    { value: 'morning' as TimeOfDay, name: 'Mañana', icon: '🌅', timeRange: '06:00-12:00' },
    { value: 'afternoon' as TimeOfDay, name: 'Tarde', icon: '☀️', timeRange: '12:01-18:00' },
    { value: 'evening' as TimeOfDay, name: 'Noche', icon: '🌙', timeRange: '18:01-23:59' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadHabits();
    this.emitStatsChanged();
    
    // Inicializar cache
    this.forceViewUpdate();
    
    this.notificationCheckInterval$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.checkScheduledNotifications());
  }

  ngOnDestroy(): void {
    // Limpiar caches
    this._habitsByTimeCache.clear();
    this._cachedOrderedPeriods = null;
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== TRACKBY FUNCTIONS PARA OPTIMIZACIÓN ==========

  trackByHabitId(index: number, habit: Habit): string {
    return habit?.id || index.toString();
  }

  trackByTimeOfDay(index: number, period: any): string {
    return period?.value || index.toString();
  }

  trackByScheduleIndex(index: number, schedule: any): string {
    return `${index}_${schedule?.time || ''}_${schedule?.timeOfDay || ''}`;
  }

  trackByScheduleId(index: number, schedule: HabitSchedule): string {
    return schedule?.id || index.toString();
  }

  trackByDayValue(index: number, day: any): number {
    return day?.value ?? index;
  }

  // ========== MÉTODOS DE ESTABILIZACIÓN ==========

  // Método para forzar actualización de vista sin causar loops
  private forceViewUpdate(): void {
    this._lastHabitsUpdate = Date.now();
    this._habitsByTimeCache.clear();
    this._cachedOrderedPeriods = null;
  }

  // ========== GESTIÓN DE HÁBITOS ==========

  saveHabits(): void {
    localStorage.setItem('bienestar-habits', JSON.stringify(this.habits));
    this._lastHabitsUpdate = Date.now();
    this._habitsByTimeCache.clear();
    this._cachedOrderedPeriods = null;
    this.emitStatsChanged();
  }

  addHabit(): void {
    if (!this.newHabit.title.trim()) return;
  
    // Si no se seleccionó ningún horario, agregar uno por defecto en la mañana
    if (this.newHabit.schedules.length === 0) {
      this.newHabit.schedules.push({
        time: '', // Sin hora específica
        timeOfDay: 'morning', // Por defecto en la mañana
        notificationEnabled: false // Sin notificación por defecto
      });
    }
  
    const habit: Habit = {
      id: Date.now().toString(),
      title: this.newHabit.title,
      description: this.newHabit.description,
      completed: false,
      createdAt: new Date(),
      frequency: this.newHabit.frequency,
      customDays: [...this.newHabit.customDays],
      customDayOfMonth: this.newHabit.customDayOfMonth,
      category: this.newHabit.category,
      streak: 0,
      completionHistory: [],
      schedules: this.newHabit.schedules.map(s => ({
        id: Date.now().toString() + Math.random(),
        time: s.time || undefined, // Puede ser undefined para horario por período
        timeOfDay: s.timeOfDay,
        notificationEnabled: s.notificationEnabled
      })),
      scheduleCompletions: {},
      isEditing: false
    };
  
    this.habits.push(habit);
    this.saveHabits();
    this.habitAdded.emit(habit);
    this.resetForm();
    this.showAddHabit = false;
    this.cdr.detectChanges();
  }

  // ========== GESTIÓN DE HORARIOS PARA NUEVO HÁBITO ==========

  addScheduleToForm(): void {
    this.newHabit.schedules.push({
      time: '',
      timeOfDay: 'morning',
      notificationEnabled: true
    });
  }

  removeScheduleFromForm(index: number): void {
    this.newHabit.schedules.splice(index, 1);
  }

  setScheduleType(schedule: any, type: 'time' | 'period'): void {
    if (type === 'time') {
      schedule.time = '08:00';
      this.updateScheduleTimeOfDay(schedule, schedule.time);
    } else {
      schedule.time = '';
      schedule.timeOfDay = 'morning';
    }
  }

  updateScheduleTimeOfDay(schedule: any, time: string): void {
    if (!time) return;
    
    const [hours] = time.split(':').map(Number);
    if (hours >= 6 && hours < 12) {
      schedule.timeOfDay = 'morning';
    } else if (hours >= 12 && hours < 18) {
      schedule.timeOfDay = 'afternoon';
    } else {
      schedule.timeOfDay = 'evening';
    }
  }

  // ========== GESTIÓN DE HORARIOS PARA EDICIÓN ==========

  addScheduleToEditForm(): void {
    this.editForm.schedules.push({
      time: '',
      timeOfDay: 'morning',
      notificationEnabled: true
    });
  }
  
  removeScheduleFromEditForm(index: number): void {
    this.editForm.schedules.splice(index, 1);
  }
  
  setEditScheduleType(schedule: any, type: 'time' | 'period'): void {
    if (type === 'time') {
      schedule.time = '08:00';
      this.updateScheduleTimeOfDay(schedule, schedule.time);
    } else {
      schedule.time = '';
      schedule.timeOfDay = 'morning';
    }
  }

  // ========== EDICIÓN ==========

  startEditHabit(habit: Habit): void {
    this.editingHabit = habit;
    this.editForm = {
      title: habit.title,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency,
      customDays: [...(habit.customDays || [])],
      customDayOfMonth: habit.customDayOfMonth || 1,
      schedules: habit.schedules.map(s => ({
        time: s.time || '',
        timeOfDay: s.timeOfDay,
        notificationEnabled: s.notificationEnabled
      }))
    };
    habit.isEditing = true;
    this.cdr.detectChanges();
  }

  saveEditHabit(): void {
    if (!this.editingHabit || !this.editForm.title.trim()) return;
  
    // Si no hay horarios en el formulario de edición, agregar uno por defecto
    if (this.editForm.schedules.length === 0) {
      this.editForm.schedules.push({
        time: '',
        timeOfDay: 'morning',
        notificationEnabled: false
      });
    }
  
    this.editingHabit.title = this.editForm.title;
    this.editingHabit.description = this.editForm.description;
    this.editingHabit.category = this.editForm.category;
    this.editingHabit.frequency = this.editForm.frequency;
    this.editingHabit.customDays = [...this.editForm.customDays];
    this.editingHabit.customDayOfMonth = this.editForm.customDayOfMonth;
    this.editingHabit.schedules = this.editForm.schedules.map(s => ({
      id: Date.now().toString() + Math.random(),
      time: s.time || undefined,
      timeOfDay: s.timeOfDay,
      notificationEnabled: s.notificationEnabled
    }));
    this.editingHabit.isEditing = false;
  
    this.saveHabits();
    this.editingHabit = null;
    this.cdr.detectChanges();
  }

  cancelEditHabit(): void {
    if (this.editingHabit) {
      this.editingHabit.isEditing = false;
      this.editingHabit = null;
    }
    this.cdr.detectChanges();
  }

  toggleEditCustomDay(event: any, dayValue: number): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      if (!this.editForm.customDays.includes(dayValue)) {
        this.editForm.customDays.push(dayValue);
      }
    } else {
      this.editForm.customDays = this.editForm.customDays.filter(d => d !== dayValue);
    }
  }

  deleteHabit(habit: Habit): void {
    if (confirm(`¿Estás seguro de que quieres eliminar "${habit.title}"?`)) {
      this.habits = this.habits.filter(h => h.id !== habit.id);
      this.saveHabits();
      this.habitDeleted.emit(habit);
      this.cdr.detectChanges();
    }
  }

  // ========== COMPLETAR HÁBITOS ==========

  toggleScheduleCompletion(habit: Habit, schedule: HabitSchedule): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const scheduleKey = `${todayStr}_${schedule.id}`;
    
    if (!habit.scheduleCompletions) {
      habit.scheduleCompletions = {};
    }
    
    if (habit.scheduleCompletions[scheduleKey]) {
      delete habit.scheduleCompletions[scheduleKey];
    } else {
      habit.scheduleCompletions[scheduleKey] = new Date();
    }
    
    this.updateHabitCompletionStatus(habit);
    this.forceViewUpdate();
    this.saveHabits();
    this.habitCompleted.emit({habit, schedule});
    this.cdr.detectChanges();
  }

  isScheduleCompletedToday(habit: Habit, schedule: HabitSchedule): boolean {
    if (!habit.scheduleCompletions) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const scheduleKey = `${todayStr}_${schedule.id}`;
    
    return !!habit.scheduleCompletions[scheduleKey];
  }

  updateHabitCompletionStatus(habit: Habit): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const hasAnyScheduleCompleted = habit.schedules.some(schedule => {
      const scheduleKey = `${todayStr}_${schedule.id}`;
      return habit.scheduleCompletions && habit.scheduleCompletions[scheduleKey];
    });
    
    if (hasAnyScheduleCompleted && !this.isHabitCompletedToday(habit)) {
      const hasCompletionToday = habit.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      
      if (!hasCompletionToday) {
        habit.completionHistory.push(new Date());
        habit.lastCompletedDate = new Date();
        this.updateStreak(habit);
      }
    } else if (!hasAnyScheduleCompleted && this.isHabitCompletedToday(habit)) {
      habit.completionHistory = habit.completionHistory.filter(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() !== today.getTime();
      });
    }
    
    habit.completed = hasAnyScheduleCompleted;
    if (hasAnyScheduleCompleted) {
      habit.completedAt = new Date();
    } else {
      habit.completedAt = undefined;
    }
  }

  isHabitCompletedToday(habit: Habit): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return habit.completionHistory.some(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  }

  // ========== ORGANIZACIÓN POR HORARIOS - OPTIMIZADA ==========

  getHabitsByTimeOfDay(timeOfDay: TimeOfDay): Habit[] {
    const cacheKey = `${timeOfDay}_${this._lastHabitsUpdate}`;
    
    if (this._habitsByTimeCache.has(cacheKey)) {
      return this._habitsByTimeCache.get(cacheKey)!;
    }

    const filteredHabits = this.habits.filter(habit => 
      habit.schedules && habit.schedules.some(schedule => schedule.timeOfDay === timeOfDay)
    );
    
    const result = this.maxHabitsToShow > 0 
      ? filteredHabits.slice(0, this.maxHabitsToShow)
      : filteredHabits;

    this._habitsByTimeCache.set(cacheKey, result);
    return result;
  }

  getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  getActiveSchedulesForPeriod(habit: Habit, timeOfDay: TimeOfDay): HabitSchedule[] {
    return habit.schedules.filter(schedule => schedule.timeOfDay === timeOfDay);
  }

  getPeriodDisplayName(timeOfDay: TimeOfDay): string {
    const periods = {
      'morning': 'Mañana',
      'afternoon': 'Tarde', 
      'evening': 'Noche'
    };
    return periods[timeOfDay] || '';
  }

  getTimeOfDayText(timeOfDay: TimeOfDay): string {
    const texts = {
      'morning': '🌅 Mañana (06:00-12:00)',
      'afternoon': '☀️ Tarde (12:01-18:00)',
      'evening': '🌙 Noche (18:01-23:59)'
    };
    return texts[timeOfDay] || '';
  }

  // ========== REORDENAMIENTO DINÁMICO DE PERÍODOS - OPTIMIZADO ==========

  getOrderedTimeOfDayPeriods(): typeof this.timeOfDayPeriods {
    // Cachear el resultado para evitar recálculos innecesarios
    if (this._cachedOrderedPeriods && this._lastOrderUpdateTime && 
        (Date.now() - this._lastOrderUpdateTime) < 60000) {
      return this._cachedOrderedPeriods;
    }

    const currentTimeOfDay = this.getCurrentTimeOfDay();
    
    const baseOrder = [
      { value: 'morning' as TimeOfDay, name: 'Mañana', icon: '🌅', timeRange: '06:00-12:00' },
      { value: 'afternoon' as TimeOfDay, name: 'Tarde', icon: '☀️', timeRange: '12:01-18:00' },
      { value: 'evening' as TimeOfDay, name: 'Noche', icon: '🌙', timeRange: '18:01-23:59' }
    ];
    
    let orderedPeriods;
    switch (currentTimeOfDay) {
      case 'morning':
        orderedPeriods = [
          baseOrder.find(p => p.value === 'morning')!,
          baseOrder.find(p => p.value === 'afternoon')!,
          baseOrder.find(p => p.value === 'evening')!
        ];
        break;
      case 'afternoon':
        orderedPeriods = [
          baseOrder.find(p => p.value === 'afternoon')!,
          baseOrder.find(p => p.value === 'evening')!,
          baseOrder.find(p => p.value === 'morning')!
        ];
        break;
      case 'evening':
        orderedPeriods = [
          baseOrder.find(p => p.value === 'evening')!,
          baseOrder.find(p => p.value === 'morning')!,
          baseOrder.find(p => p.value === 'afternoon')!
        ];
        break;
      default:
        orderedPeriods = baseOrder;
    }

    this._cachedOrderedPeriods = orderedPeriods;
    this._lastOrderUpdateTime = Date.now();
    
    return orderedPeriods;
  }

  getCurrentPeriodName(): string {
    const currentTimeOfDay = this.getCurrentTimeOfDay();
    switch (currentTimeOfDay) {
      case 'morning':
        return 'Mañana';
      case 'afternoon':
        return 'Tarde';
      case 'evening':
        return 'Noche';
      default:
        return '';
    }
  }

  isCurrentPeriod(periodValue: TimeOfDay): boolean {
    return this.getCurrentTimeOfDay() === periodValue;
  }

  // ========== NOTIFICACIONES ==========

  checkScheduledNotifications(): void {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    this.habits.forEach(habit => {
      habit.schedules.forEach(schedule => {
        if (schedule.notificationEnabled && schedule.time === currentTime) {
          this.sendNotification(habit, schedule);
        }
      });
    });
  }

  sendNotification(habit: Habit, schedule: HabitSchedule): void {
    if (Notification.permission === 'granted') {
      const timeOfDayText = this.timeOfDayPeriods.find(p => p.value === schedule.timeOfDay)?.name || '';
      
      new Notification(`🔔 Recordatorio: ${habit.title}`, {
        body: `Es hora de ${habit.title.toLowerCase()} - ${timeOfDayText} (${schedule.time})`,
        icon: '/assets/icon-192x192.png',
        badge: '/assets/icon-192x192.png',
        requireInteraction: true
      });
    }
  }

  // ========== UTILIDADES ==========

  resetForm(): void {
    this.newHabit = {
      title: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      customDays: [],
      customDayOfMonth: 1,
      schedules: []
    };
  }

  cancelForm(): void {
    this.resetForm();
    this.showAddHabit = false;
  }

  getCategoryInfo(category: string): CategoryInfo {
    return this.categories.find(c => c.value === category) || this.categories[5];
  }

  getFrequencyText(habit: Habit): string {
    switch (habit.frequency) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return `Día ${habit.customDayOfMonth} de cada mes`;
      case 'custom':
        const days = habit.customDays?.map(d => 
          this.weekDays.find(wd => wd.value === d)?.name
        ).filter(Boolean).join(', ');
        return days || 'Personalizado';
      default: return '';
    }
  }

  updateStreak(habit: Habit): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const hasCompletion = habit.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      
      if (hasCompletion) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    habit.streak = streak;
  }

  toggleCustomDay(event: any, dayValue: number): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      if (!this.newHabit.customDays.includes(dayValue)) {
        this.newHabit.customDays.push(dayValue);
      }
    } else {
      this.newHabit.customDays = this.newHabit.customDays.filter(d => d !== dayValue);
    }
  }

  loadHabits(): void {
    const saved = localStorage.getItem('bienestar-habits');
    if (saved) {
      const habits = JSON.parse(saved);
      this.habits = habits.map((h: any) => ({
        ...h,
        createdAt: new Date(h.createdAt),
        completedAt: h.completedAt ? new Date(h.completedAt) : undefined,
        lastCompletedDate: h.lastCompletedDate ? new Date(h.lastCompletedDate) : undefined,
        completionHistory: (h.completionHistory || []).map((d: string) => new Date(d)),
        schedules: (h.schedules || []).map((s: any) => ({
          id: s.id || Date.now().toString() + Math.random(),
          time: s.time || undefined,
          timeOfDay: s.timeOfDay || 'morning',
          notificationEnabled: s.notificationEnabled !== false
        })),
        scheduleCompletions: h.scheduleCompletions || {},
        isEditing: false
      }));
    }
    this.emitStatsChanged();
  }

  // ========== ESTADÍSTICAS ==========

  getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalHabits = this.habits.length;
    const completedToday = this.habits.filter(habit => 
      habit.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      })
    ).length;
    
    const completionRate = totalHabits > 0 
      ? Math.round((completedToday / totalHabits) * 100)
      : 0;
    
    const currentStreak = this.habits.length > 0 
      ? Math.max(...this.habits.map(h => h.streak || 0))
      : 0;

    return {
      totalHabits,
      completedToday,
      completionRate,
      currentStreak
    };
  }

  emitStatsChanged(): void {
    this.statsChanged.emit(this.getStats());
  }

  // ========== MÉTODOS PÚBLICOS PARA EL DASHBOARD ==========

  getHabitsForDashboard(limit: number = 3): Habit[] {
    return this.habits.slice(0, limit);
  }

  getUpcomingNotifications(): Array<{habit: Habit, schedule: HabitSchedule, timeUntil: string}> {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const upcoming = [];
    
    for (const habit of this.habits) {
      for (const schedule of habit.schedules) {
        if (schedule.notificationEnabled && schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          const scheduleMinutes = hours * 60 + minutes;
          
          if (scheduleMinutes > currentMinutes) {
            const timeUntil = this.getTimeUntilText(scheduleMinutes - currentMinutes);
            upcoming.push({ habit, schedule, timeUntil });
          }
        }
      }
    }
    
    return upcoming.sort((a, b) => {
      if (!a.schedule.time || !b.schedule.time) return 0;
      const [aHours, aMinutes] = a.schedule.time.split(':').map(Number);
      const [bHours, bMinutes] = b.schedule.time.split(':').map(Number);
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    }).slice(0, 3);
  }

  private getTimeUntilText(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  // ========== MÉTODOS DE DEBUGGING ==========

  // Método para debugging (remover en producción)
  debugScrollIssue(): void {
    console.log('Habits length:', this.habits.length);
    console.log('Cache size:', this._habitsByTimeCache.size);
    console.log('Ordered periods:', this.getOrderedTimeOfDayPeriods());
    
    this.timeOfDayPeriods.forEach(period => {
      const habits = this.getHabitsByTimeOfDay(period.value);
      console.log(`${period.name}: ${habits.length} habits`);
    });
  }
}