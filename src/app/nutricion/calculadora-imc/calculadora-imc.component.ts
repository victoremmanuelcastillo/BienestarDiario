// calculadora-imc.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface IMCRecord {
  date: Date;
  weight: number;
  height: number;
  imc: number;
  category: string;
}

@Component({
  selector: 'app-calculadora-imc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora-imc.component.html',
  styleUrls: ['./calculadora-imc.component.css']
})
export class CalculadoraIMCComponent implements OnInit {
  weight: number = 70;
  height: number = 170;
  age: number = 30;
  gender: 'male' | 'female' = 'male';
  
  imcResult: number = 0;
  imcCategory: string = '';
  imcColor: string = '';
  imcCategoryClass: string = '';
  
  imcHistory: IMCRecord[] = [];
  imcChart: Chart | null = null;
  
  constructor() {}
  
  ngOnInit() {
    this.loadIMCHistory();
    setTimeout(() => {
      this.renderIMCChart();
    }, 500);
  }
  
  calculateIMC() {
    if (this.weight && this.height) {
      // Convertir altura de cm a metros
      const heightInMeters = this.height / 100;
      
      // Calcular IMC: peso(kg) / altura²(m)
      this.imcResult = this.weight / (heightInMeters * heightInMeters);
      
      // Determinar categoría
      this.setCategoryAndColor();
      
      // Guardar en historial
      this.saveIMCRecord();
      
      // Actualizar gráfica
      this.renderIMCChart();
    }
  }
  
  setCategoryAndColor() {
    if (this.imcResult < 18.5) {
      this.imcCategory = 'Bajo peso';
      this.imcColor = '#3498db'; // Azul
      this.imcCategoryClass = 'underweight';
    } else if (this.imcResult < 25) {
      this.imcCategory = 'Peso normal';
      this.imcColor = '#2ecc71'; // Verde
      this.imcCategoryClass = 'normal';
    } else if (this.imcResult < 30) {
      this.imcCategory = 'Sobrepeso';
      this.imcColor = '#f39c12'; // Naranja
      this.imcCategoryClass = 'overweight';
    } else if (this.imcResult < 35) {
      this.imcCategory = 'Obesidad grado I';
      this.imcColor = '#e67e22'; // Naranja oscuro
      this.imcCategoryClass = 'obese';
    } else if (this.imcResult < 40) {
      this.imcCategory = 'Obesidad grado II';
      this.imcColor = '#e74c3c'; // Rojo
      this.imcCategoryClass = 'obese';
    } else {
      this.imcCategory = 'Obesidad grado III';
      this.imcColor = '#c0392b'; // Rojo oscuro
      this.imcCategoryClass = 'obese';
    }
  }
  
  saveIMCRecord() {
    const newRecord: IMCRecord = {
      date: new Date(),
      weight: this.weight,
      height: this.height,
      imc: this.imcResult,
      category: this.imcCategory
    };
    
    this.imcHistory.push(newRecord);
    
    // Guardar en localStorage
    localStorage.setItem('imcHistory', JSON.stringify(this.imcHistory));
  }
  
  loadIMCHistory() {
    const savedHistory = localStorage.getItem('imcHistory');
    if (savedHistory) {
      this.imcHistory = JSON.parse(savedHistory).map((record: any) => ({
        ...record,
        date: new Date(record.date)
      }));
      
      // Si hay historial, mostrar el último resultado
      if (this.imcHistory.length > 0) {
        const lastRecord = this.imcHistory[this.imcHistory.length - 1];
        this.weight = lastRecord.weight;
        this.height = lastRecord.height;
        this.imcResult = lastRecord.imc;
        this.imcCategory = lastRecord.category;
        this.setCategoryAndColor();
      }
    }
  }
  
  renderIMCChart() {
    const canvas = document.getElementById('imcChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    if (this.imcChart) {
      this.imcChart.destroy();
    }
    
    // Preparar datos para la gráfica
    const sortedHistory = [...this.imcHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Limitar a los últimos 10 registros si hay muchos
    const displayHistory = sortedHistory.slice(-10);
    
    const labels = displayHistory.map(record => 
      record.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    );
    
    const imcData = displayHistory.map(record => record.imc);
    
    // Crear gráfica
    this.imcChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'IMC',
          data: imcData,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            min: Math.max(0, Math.min(...imcData) - 2),
            max: Math.max(...imcData) + 2,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex;
                return `Categoría: ${displayHistory[index].category}`;
              }
            }
          }
        }
      }
    });
  }
  
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.imcResult < 18.5) {
      recommendations.push('Aumenta tu ingesta calórica con alimentos nutritivos.');
      recommendations.push('Incluye proteínas de calidad en cada comida.');
      recommendations.push('Consulta con un nutricionista para un plan personalizado.');
    } else if (this.imcResult < 25) {
      recommendations.push('¡Excelente! Mantén tus hábitos alimenticios saludables.');
      recommendations.push('Realiza actividad física regular para mantener tu peso.');
      recommendations.push('Continúa con una dieta equilibrada y variada.');
    } else if (this.imcResult < 30) {
      recommendations.push('Reduce moderadamente tu ingesta calórica.');
      recommendations.push('Aumenta la actividad física a 150-300 minutos semanales.');
      recommendations.push('Limita el consumo de alimentos procesados y azúcares.');
    } else {
      recommendations.push('Consulta con un profesional de la salud para un plan personalizado.');
      recommendations.push('Incorpora actividad física gradualmente.');
      recommendations.push('Enfócate en una alimentación balanceada y porciones adecuadas.');
      recommendations.push('Establece metas realistas de pérdida de peso (0.5-1kg por semana).');
    }
    
    return recommendations;
  }
  
  clearHistory() {
    if (confirm('¿Estás seguro de que deseas eliminar todo el historial de IMC?')) {
      this.imcHistory = [];
      localStorage.removeItem('imcHistory');
      this.renderIMCChart();
    }
  }
}