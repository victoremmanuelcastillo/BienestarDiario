// src/app/ejercicio/grafica-ejercicio/grafica-ejercicio.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importar Chart.js
declare var Chart: any;

@Component({
  selector: 'app-grafica-ejercicio',
  templateUrl: './grafica-ejercicio.component.html',
  styleUrls: ['./grafica-ejercicio.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class GraficaEjercicioComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartProgreso', { static: false }) chartProgresoRef!: ElementRef;
  @ViewChild('chartCalorias', { static: false }) chartCaloriasRef!: ElementRef;
  @ViewChild('chartCategorias', { static: false }) chartCategoriasRef!: ElementRef;
  @ViewChild('chartSemanal', { static: false }) chartSemanalRef!: ElementRef;

  // Hacer Math disponible en el template
  Math = Math;

  // Variables para las gráficas
  chartProgreso: any = null;
  chartCalorias: any = null;
  chartCategorias: any = null;
  chartSemanal: any = null;

  // Período actual seleccionado
  periodoActual: 'semana' | 'mes' | 'año' = 'semana';

  // Datos de ejemplo
  datosEjemplo = {
    semana: {
      fechas: ['Lun 3', 'Mar 4', 'Mié 5', 'Jue 6', 'Vie 7', 'Sáb 8', 'Dom 9'],
      duraciones: [45, 50, 40, 30, 55, 25, 42],
      calorias: [320, 380, 290, 150, 420, 350, 310],
      categorias: { cardio: 3, fuerza: 2, flexibilidad: 1, hiit: 1 }
    },
    mes: {
      fechas: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      duraciones: [240, 290, 200, 315],
      calorias: [1800, 2100, 1500, 2380],
      categorias: { cardio: 8, fuerza: 6, flexibilidad: 3, hiit: 3 }
    },
    año: {
      fechas: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      duraciones: [900, 1100, 800, 1200, 950, 1050],
      calorias: [6500, 7800, 5600, 8500, 6800, 7200],
      categorias: { cardio: 25, fuerza: 20, flexibilidad: 10, hiit: 15 }
    }
  };

  progresoMensual = [
    { semana: 'Semana 1', entrenamientos: 5, tiempoTotal: 240, caloriasQuemadas: 1800 },
    { semana: 'Semana 2', entrenamientos: 6, tiempoTotal: 290, caloriasQuemadas: 2100 },
    { semana: 'Semana 3', entrenamientos: 4, tiempoTotal: 200, caloriasQuemadas: 1500 },
    { semana: 'Semana 4', entrenamientos: 7, tiempoTotal: 315, caloriasQuemadas: 2380 }
  ];

  // Estadísticas resumen
  totalEjercicios: number = 53;
  tiempoTotal: number = 287;
  caloriasTotal: number = 2220;
  promedioSemanal: number = 41;

  ngOnInit(): void {
    this.actualizarEstadisticas();
  }

  ngAfterViewInit(): void {
    // Cargar Chart.js dinámicamente si no está disponible
    if (typeof Chart === 'undefined') {
      this.cargarChartJS();
    } else {
      setTimeout(() => {
        this.inicializarGraficas();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.destruirGraficas();
  }

  cargarChartJS(): void {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
      setTimeout(() => {
        this.inicializarGraficas();
      }, 100);
    };
    document.head.appendChild(script);
  }

  actualizarEstadisticas(): void {
    const datos = this.datosEjemplo[this.periodoActual];
    this.tiempoTotal = datos.duraciones.reduce((a, b) => a + b, 0);
    this.caloriasTotal = datos.calorias.reduce((a, b) => a + b, 0);
    this.totalEjercicios = Object.values(datos.categorias).reduce((a, b) => a + b, 0);
    
    const divisor = this.periodoActual === 'semana' ? 7 : this.periodoActual === 'mes' ? 30 : 365;
    this.promedioSemanal = Math.round(this.tiempoTotal / divisor);
  }

  inicializarGraficas(): void {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js no está disponible');
      return;
    }

    this.crearGraficaProgreso();
    this.crearGraficaCalorias();
    this.crearGraficaCategorias();
    this.crearGraficaSemanal();
  }

  crearGraficaProgreso(): void {
    if (this.chartProgresoRef && this.chartProgresoRef.nativeElement) {
      const ctx = this.chartProgresoRef.nativeElement.getContext('2d');
      const datos = this.datosEjemplo[this.periodoActual];
      
      this.chartProgreso = new Chart(ctx, {
        type: 'line',
        data: {
          labels: datos.fechas,
          datasets: [{
            label: 'Duración (minutos)',
            data: datos.duraciones,
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2e7d32',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `Progreso de Entrenamientos - ${this.capitalizarPeriodo(this.periodoActual)}`,
              font: { size: 16, weight: 'bold' },
              color: '#2e7d32'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return value + ' min';
                }
              }
            }
          }
        }
      });
    }
  }

  crearGraficaCalorias(): void {
    if (this.chartCaloriasRef && this.chartCaloriasRef.nativeElement) {
      const ctx = this.chartCaloriasRef.nativeElement.getContext('2d');
      const datos = this.datosEjemplo[this.periodoActual];
      
      this.chartCalorias = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: datos.fechas,
          datasets: [{
            label: 'Calorías Quemadas',
            data: datos.calorias,
            backgroundColor: [
              '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
              '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
            ],
            borderColor: [
              '#ee5a52', '#45b7d1', '#3867d6', '#7bed9f', 
              '#ff9f43', '#ff6b9d', '#2f3542', '#341f97'
            ],
            borderWidth: 2,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `Calorías Quemadas - ${this.capitalizarPeriodo(this.periodoActual)}`,
              font: { size: 16, weight: 'bold' },
              color: '#2e7d32'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return value + ' cal';
                }
              }
            }
          }
        }
      });
    }
  }

  crearGraficaCategorias(): void {
    if (this.chartCategoriasRef && this.chartCategoriasRef.nativeElement) {
      const ctx = this.chartCategoriasRef.nativeElement.getContext('2d');
      const datos = this.datosEjemplo[this.periodoActual];
      
      this.chartCategorias = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(datos.categorias).map(cat => this.capitalizarCategoria(cat)),
          datasets: [{
            data: Object.values(datos.categorias),
            backgroundColor: ['#2e7d32', '#1976d2', '#f57c00', '#7b1fa2'],
            borderColor: '#fff',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            },
            title: {
              display: true,
              text: `Distribución por Categorías - ${this.capitalizarPeriodo(this.periodoActual)}`,
              font: { size: 16, weight: 'bold' },
              color: '#2e7d32'
            }
          }
        }
      });
    }
  }

  crearGraficaSemanal(): void {
    if (this.chartSemanalRef && this.chartSemanalRef.nativeElement) {
      const ctx = this.chartSemanalRef.nativeElement.getContext('2d');
      
      this.chartSemanal = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Entrenamientos', 'Tiempo', 'Calorías', 'Constancia', 'Variedad', 'Intensidad'],
          datasets: [{
            label: 'Rendimiento',
            data: [8, 7, 9, 6, 8, 7],
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.2)',
            pointBackgroundColor: '#2e7d32',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Análisis de Rendimiento',
              font: { size: 16, weight: 'bold' },
              color: '#2e7d32'
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 10,
              ticks: { stepSize: 2 }
            }
          }
        }
      });
    }
  }

  destruirGraficas(): void {
    if (this.chartProgreso) {
      this.chartProgreso.destroy();
      this.chartProgreso = null;
    }
    if (this.chartCalorias) {
      this.chartCalorias.destroy();
      this.chartCalorias = null;
    }
    if (this.chartCategorias) {
      this.chartCategorias.destroy();
      this.chartCategorias = null;
    }
    if (this.chartSemanal) {
      this.chartSemanal.destroy();
      this.chartSemanal = null;
    }
  }

  capitalizarCategoria(categoria: string): string {
    return categoria.charAt(0).toUpperCase() + categoria.slice(1);
  }

  capitalizarPeriodo(periodo: string): string {
    switch (periodo) {
      case 'semana': return 'Esta Semana';
      case 'mes': return 'Este Mes';
      case 'año': return 'Este Año';
      default: return periodo;
    }
  }

  // Métodos para cambiar período de tiempo
  cambiarPeriodo(periodo: 'semana' | 'mes' | 'año'): void {
    this.periodoActual = periodo;
    this.actualizarEstadisticas();
    this.destruirGraficas();
    setTimeout(() => {
      this.inicializarGraficas();
    }, 100);
  }

  exportarDatos(): void {
    const datos = {
      periodo: this.periodoActual,
      datos: this.datosEjemplo[this.periodoActual],
      progreso: this.progresoMensual,
      resumen: {
        totalEjercicios: this.totalEjercicios,
        tiempoTotal: this.tiempoTotal,
        caloriasTotal: this.caloriasTotal,
        promedioSemanal: this.promedioSemanal
      },
      fechaExportacion: new Date().toISOString()
    };

    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `estadisticas-ejercicio-${this.periodoActual}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('Datos exportados exitosamente:', datos);
  }
}