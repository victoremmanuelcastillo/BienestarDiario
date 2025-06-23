// dashboard.component.ts - Dashboard simplificado usando componentes separados
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

// Importar componentes separados
import { HabitosRecomendadosComponent, HabitoRecomendado } from './habitos-recomendados/habitos-recomendados.component';
import { MotivacionComponent } from './motivacion/motivacion.component';
import { HabitsManagerComponent } from './habits-manager/habits-manager.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HabitosRecomendadosComponent, 
    MotivacionComponent,
    HabitsManagerComponent
  ],
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
  private destroy$ = new Subject<void>();
  
  userName: string = '';
  currentDate = new Date();
  greeting: string = '';
  
  // Estadísticas consolidadas de hábitos
  stats = {
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    completionRate: 0
  };

  // Control de vistas
  showHabitsManager = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
    this.setGreeting();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== GESTIÓN DE USUARIOS ==========
  
  loadUserData(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: any) => {
      if (user) {
        this.userName = user.email?.split('@')[0] || 'Usuario';
      }
    });
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = '¡Buenos días';
    } else if (hour < 18) {
      this.greeting = '¡Buenas tardes';
    } else {
      this.greeting = '¡Buenas noches';
    }
  }

  // ========== EVENTOS DEL COMPONENTE DE HÁBITOS ==========

  onHabitsStatsChanged(newStats: any): void {
    this.stats = {
      totalHabits: newStats.totalHabits,
      completedToday: newStats.completedToday,
      currentStreak: newStats.currentStreak,
      completionRate: newStats.completionRate
    };
  }

  onHabitAdded(habit: any): void {
    console.log('Nuevo hábito agregado:', habit);
    // Aquí puedes agregar lógica adicional cuando se agrega un hábito
  }

  onHabitCompleted(event: any): void {
    console.log('Hábito completado:', event);
    // Aquí puedes agregar lógica adicional cuando se completa un hábito
  }

  onHabitDeleted(habit: any): void {
    console.log('Hábito eliminado:', habit);
    // Aquí puedes agregar lógica adicional cuando se elimina un hábito
  }

  // ========== UTILIDADES ==========

  shouldShowMotivation(): boolean {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    
    if (this.stats.totalHabits === 0) return true;
    if (horaActual >= 12 && this.stats.completionRate < 25) return true;
    if (horaActual >= 15 && this.stats.completionRate < 50) return true;
    if (horaActual >= 18 && this.stats.completionRate < 75) return true;
    if (this.stats.currentStreak < 3 && this.stats.totalHabits > 0) return true;
    
    return false;
  }

  showFullHabitsManager(): void {
    this.showHabitsManager = true;
  }

  // Ocultar el gestor completo
  hideFullHabitsManager(): void {
    this.showHabitsManager = false;
  }

  onRecommendedHabitAdded(habito: HabitoRecomendado): void {
    // Mostrar el gestor de hábitos para completar la configuración
    this.showHabitsManager = true;
    console.log('Hábito recomendado seleccionado:', habito);
  }
}