// graficas-habitos.component.ts
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
  completionHistory: Date[];
}

@Component({
  selector: 'app-graficas-habitos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graficas-habitos.component.html',
  styleUrls: ['./graficas-habitos.component.css']
})
export class GraficasHabitosComponent implements OnInit, OnChanges {
  @Input() activities: Activity[] = [];
  
  selectedView: 'daily' | 'monthly' = 'daily';
  selectedCategory: CategoryType | 'all' = 'all';
  
  categories = [
    { value: 'all', name: 'Todas las categorías', icon: '📊', color: '#333333' },
    { value: 'health', name: 'Salud', icon: '🏥', color: '#4CAF50' },
    { value: 'exercise', name: 'Ejercicio', icon: '💪', color: '#2196F3' },
    { value: 'nutrition', name: 'Nutrición', icon: '🥗', color: '#FF9800' },
    { value: 'meditation', name: 'Meditación', icon: '🧘', color: '#9C27B0' },
    { value: 'sleep', name: 'Sueño', icon: '😴', color: '#3F51B5' },
    { value: 'other', name: 'Otro', icon: '📌', color: '#607D8B' }
  ];
  
  dailyChart: Chart | null = null;
  monthlyChart: Chart | null = null;
  
  constructor() {}
  
  ngOnInit() {
    // Si no hay actividades pasadas como Input, cargar desde localStorage
    if (this.activities.length === 0) {
      this.loadActivitiesFromStorage();
    }
    
    setTimeout(() => {
      this.renderCharts();
    }, 500);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['activities'] && this.activities.length > 0) {
      setTimeout(() => {
        this.renderCharts();
      }, 500);
    }
  }
  
  loadActivitiesFromStorage() {
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
  }
  
  renderCharts() {
    this.renderDailyChart();
    this.renderMonthlyChart();
  }
  
  renderDailyChart() {
    const canvas = document.getElementById('dailyHabitsChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    if (this.dailyChart) {
      this.dailyChart.destroy();
    }
    
    // Filtrar por categoría si es necesario
    const filteredActivities = this.selectedCategory === 'all' 
      ? this.activities 
      : this.activities.filter(a => a.category === this.selectedCategory);
    
    // Obtener los últimos 7 días
    const dates = [];
    const completionData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateString = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      dates.push(dateString);
      
      // Contar actividades completadas en esta fecha
      const completed = filteredActivities.filter(activity => {
        return activity.completionHistory && activity.completionHistory.some(historyDate => {
          const d = new Date(historyDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === date.getTime();
        });
      }).length;
      
      completionData.push(completed);
    }
    
    this.dailyChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Hábitos completados',
          data: completionData,
          backgroundColor: this.selectedCategory !== 'all' 
            ? this.getCategoryColor(this.selectedCategory) 
            : '#4CAF50',
          borderColor: this.selectedCategory !== 'all' 
            ? this.getCategoryColor(this.selectedCategory) 
            : '#4CAF50',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  renderMonthlyChart() {
    const canvas = document.getElementById('monthlyHabitsChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }
    
    // Filtrar por categoría si es necesario
    const filteredActivities = this.selectedCategory === 'all' 
      ? this.activities 
      : this.activities.filter(a => a.category === this.selectedCategory);
    
    // Obtener los últimos 6 meses
    const months = [];
    const completionData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const year = date.getFullYear();
      months.push(`${monthName} ${year}`);
      
      // Contar actividades completadas en este mes
      const completed = filteredActivities.filter(activity => {
        return activity.completionHistory && activity.completionHistory.some(historyDate => {
          const d = new Date(historyDate);
          return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        });
      }).length;
      
      completionData.push(completed);
    }
    
    this.monthlyChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Hábitos completados',
          data: completionData,
          backgroundColor: this.selectedCategory !== 'all' 
            ? this.getCategoryColor(this.selectedCategory) 
            : '#2196F3',
          borderColor: this.selectedCategory !== 'all' 
            ? this.getCategoryColor(this.selectedCategory) 
            : '#2196F3',
          borderWidth: 2,
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  onViewChange() {
    this.renderCharts();
  }
  
  onCategoryChange() {
    this.renderCharts();
  }
  
  getCategoryColor(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.color : '#607D8B';
  }
  
  getCompletedLastMonth(): number {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    return this.activities.filter(activity => {
      return activity.completionHistory && activity.completionHistory.some(date => {
        const historyDate = new Date(date);
        return historyDate >= lastMonth;
      });
    }).length;
  }
  
  getMaxStreak(): number {
    return Math.max(...this.activities.map(a => a.streak || 0), 0);
  }
  
  getMostActiveCategory(): string {
    const categoryCounts: Record<string, number> = {};
    
    this.activities.forEach(activity => {
      if (!categoryCounts[activity.category]) {
        categoryCounts[activity.category] = 0;
      }
      
      if (activity.completionHistory) {
        categoryCounts[activity.category] += activity.completionHistory.length;
      }
    });
    
    let maxCategory = 'other';
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategory = category;
      }
    });
    
    const categoryInfo = this.categories.find(c => c.value === maxCategory);
    return categoryInfo ? `${categoryInfo.icon} ${categoryInfo.name}` : 'Ninguna';
  }
}