// src/app/ejercicio/recomendaciones/recomendaciones.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PerfilUsuario {
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  objetivos: string[];
  tiempoDisponible: number;
  preferencias: string[];
  limitaciones: string[];
  historialEjercicios: string[];
}

interface Recomendacion {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  duracion: number;
  calorias: number;
  equipamiento: string[];
  imagen: string;
  puntuacion: number;
  razon: string;
  video?: string;
  instrucciones: string[];
  beneficios: string[];
}

interface PlanPersonalizado {
  nombre: string;
  duracion: string;
  objetivo: string;
  ejercicios: Recomendacion[];
  descripcion: string;
  frecuencia: string;
}

@Component({
  selector: 'app-recomendaciones',
  templateUrl: './recomendaciones.component.html',
  styleUrls: ['./recomendaciones.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class RecomendacionesComponent implements OnInit {
  
  // Perfil del usuario
  perfilUsuario: PerfilUsuario = {
    nivel: 'intermedio',
    objetivos: ['perder_peso', 'ganar_musculo'],
    tiempoDisponible: 45,
    preferencias: ['cardio', 'fuerza'],
    limitaciones: [],
    historialEjercicios: ['flexiones', 'sentadillas', 'burpees']
  };

  // Estados del componente
  vistaActual: 'recomendaciones' | 'perfil' | 'planes' = 'recomendaciones';
  cargandoRecomendaciones: boolean = false;
  filtroCategoria: string = 'todos';
  filtroNivel: string = 'todos';

  // Recomendaciones
  recomendaciones: Recomendacion[] = [];
  recomendacionesPersonalizadas: Recomendacion[] = [];
  planesPersonalizados: PlanPersonalizado[] = [];

  // Datos de ejemplo actualizados con las imágenes correctas
  categoriasDisponibles = [
    { id: 'cardio', nombre: 'Cardio', icono: '🏃‍♂️' },
    { id: 'fuerza', nombre: 'Fuerza', icono: '💪' },
    { id: 'flexibilidad', nombre: 'Flexibilidad', icono: '🧘‍♀️' },
    { id: 'hiit', nombre: 'HIIT', icono: '⚡' },
    { id: 'core', nombre: 'Core', icono: '🔥' },
    { id: 'funcional', nombre: 'Funcional', icono: '🏋️‍♂️' }
  ];

  objetivosDisponibles = [
    { id: 'perder_peso', nombre: 'Perder Peso', icono: '📉' },
    { id: 'ganar_musculo', nombre: 'Ganar Músculo', icono: '💪' },
    { id: 'resistencia', nombre: 'Mejorar Resistencia', icono: '🫁' },
    { id: 'flexibilidad', nombre: 'Aumentar Flexibilidad', icono: '🤸‍♂️' },
    { id: 'general', nombre: 'Fitness General', icono: '⚖️' }
  ];

  ngOnInit(): void {
    this.cargarRecomendaciones();
    this.generarRecomendacionesPersonalizadas();
    this.generarPlanesPersonalizados();
  }

  // Método para obtener rutas de imágenes correctas
  private obtenerImagenCategoria(categoria: string): string {
    const imagenes: { [key: string]: string } = {
      'cardio': 'assets/images/categorias/cardio.png',
      'fuerza': 'assets/images/categorias/fuerza.png',
      'flexibilidad': 'assets/images/categorias/felxibilidad.png', // Mantener el typo si el archivo se llama así
      'hiit': 'assets/images/categorias/hiit.png',
      'core': 'assets/images/categorias/core.png',
      'funcional': 'assets/images/categorias/funcional.png'
    };
    return imagenes[categoria] || 'assets/images/categorias/default.png';
  }

  cargarRecomendaciones(): void {
    this.cargandoRecomendaciones = true;
    
    // Simular carga de datos con imágenes actualizadas
    setTimeout(() => {
      this.recomendaciones = [
        {
          id: 1,
          titulo: 'Rutina de Cardio Intensivo',
          descripcion: 'Quema calorías rápidamente con esta rutina de alta intensidad',
          categoria: 'cardio',
          nivel: 'intermedio',
          duracion: 30,
          calorias: 350,
          equipamiento: ['Ninguno'],
          imagen: this.obtenerImagenCategoria('cardio'),
          puntuacion: 95,
          razon: 'Basado en tu historial de ejercicios cardiovasculares',
          instrucciones: [
            'Calentamiento de 5 minutos',
            '20 minutos de ejercicios de alta intensidad',
            'Enfriamiento de 5 minutos'
          ],
          beneficios: ['Quema grasa', 'Mejora cardiovascular', 'Aumenta resistencia']
        },
        {
          id: 2,
          titulo: 'Entrenamiento de Fuerza para Principiantes',
          descripcion: 'Desarrolla músculo de forma segura con ejercicios básicos',
          categoria: 'fuerza',
          nivel: 'principiante',
          duracion: 45,
          calorias: 280,
          equipamiento: ['Mancuernas', 'Banco'],
          imagen: this.obtenerImagenCategoria('fuerza'),
          puntuacion: 92,
          razon: 'Ideal para comenzar con entrenamiento de fuerza',
          instrucciones: [
            'Calentamiento dinámico',
            'Ejercicios básicos con peso corporal',
            'Progresión gradual'
          ],
          beneficios: ['Construcción muscular', 'Fortalece huesos', 'Mejora postura']
        },
        {
          id: 3,
          titulo: 'Yoga para Flexibilidad',
          descripcion: 'Mejora tu flexibilidad y reduce el estrés',
          categoria: 'flexibilidad',
          nivel: 'todos',
          duracion: 60,
          calorias: 180,
          equipamiento: ['Esterilla'],
          imagen: this.obtenerImagenCategoria('flexibilidad'),
          puntuacion: 88,
          razon: 'Complementa perfectamente tu rutina actual',
          instrucciones: [
            'Respiración consciente',
            'Posturas progresivas',
            'Relajación final'
          ],
          beneficios: ['Aumenta flexibilidad', 'Reduce estrés', 'Mejora equilibrio']
        },
        {
          id: 4,
          titulo: 'HIIT Avanzado',
          descripcion: 'Desafía tus límites con intervalos de alta intensidad',
          categoria: 'hiit',
          nivel: 'avanzado',
          duracion: 25,
          calorias: 400,
          equipamiento: ['Kettlebell', 'Cuerda'],
          imagen: this.obtenerImagenCategoria('hiit'),
          puntuacion: 96,
          razon: 'Tu nivel permite entrenamientos más intensos',
          instrucciones: [
            'Calentamiento específico',
            'Intervalos 30s trabajo / 10s descanso',
            'Enfriamiento activo'
          ],
          beneficios: ['Máxima quema de calorías', 'Efecto afterburn', 'Tiempo eficiente']
        },
        {
          id: 5,
          titulo: 'Core Strengthening',
          descripcion: 'Fortalece tu núcleo con ejercicios específicos',
          categoria: 'core',
          nivel: 'intermedio',
          duracion: 20,
          calorias: 150,
          equipamiento: ['Esterilla'],
          imagen: this.obtenerImagenCategoria('core'),
          puntuacion: 90,
          razon: 'Complementa tu entrenamiento de fuerza',
          instrucciones: [
            'Activación del core',
            'Ejercicios isométricos',
            'Movimientos dinámicos'
          ],
          beneficios: ['Fortalece abdomen', 'Mejora estabilidad', 'Previene lesiones']
        },
        {
          id: 6,
          titulo: 'Entrenamiento Funcional',
          descripcion: 'Movimientos que imitan actividades de la vida diaria',
          categoria: 'funcional',
          nivel: 'intermedio',
          duracion: 35,
          calorias: 250,
          equipamiento: ['Kettlebell', 'TRX'],
          imagen: this.obtenerImagenCategoria('funcional'),
          puntuacion: 87,
          razon: 'Mejora tu funcionalidad en actividades cotidianas',
          instrucciones: [
            'Calentamiento funcional',
            'Ejercicios multiarticulares',
            'Enfriamiento y movilidad'
          ],
          beneficios: ['Mejora coordinación', 'Aumenta estabilidad', 'Fortalece múltiples grupos musculares']
        },
        {
          id: 7,
          titulo: 'Cardio de Bajo Impacto',
          descripcion: 'Ejercicio cardiovascular suave para articulaciones',
          categoria: 'cardio',
          nivel: 'principiante',
          duracion: 40,
          calorias: 200,
          equipamiento: ['Ninguno'],
          imagen: this.obtenerImagenCategoria('cardio'),
          puntuacion: 85,
          razon: 'Perfecto para empezar sin sobrecargar las articulaciones',
          instrucciones: [
            'Calentamiento gradual',
            'Ejercicios de bajo impacto',
            'Enfriamiento progresivo'
          ],
          beneficios: ['Protege articulaciones', 'Mejora resistencia', 'Reduce estrés']
        },
        {
          id: 8,
          titulo: 'HIIT para Principiantes',
          descripcion: 'Introducción a los entrenamientos de alta intensidad',
          categoria: 'hiit',
          nivel: 'principiante',
          duracion: 20,
          calorias: 250,
          equipamiento: ['Ninguno'],
          imagen: this.obtenerImagenCategoria('hiit'),
          puntuacion: 93,
          razon: 'Excelente introducción al entrenamiento HIIT',
          instrucciones: [
            'Calentamiento preparatorio',
            'Intervalos modificados',
            'Recuperación adecuada'
          ],
          beneficios: ['Quema calorías eficientemente', 'Mejora condición física', 'Ahorra tiempo']
        }
      ];
      this.cargandoRecomendaciones = false;
    }, 1000);
  }

  generarRecomendacionesPersonalizadas(): void {
    // Filtrar recomendaciones basadas en el perfil del usuario
    this.recomendacionesPersonalizadas = this.recomendaciones.filter(rec => {
      const coincideNivel = rec.nivel === this.perfilUsuario.nivel || rec.nivel === 'todos';
      const coincideTiempo = rec.duracion <= this.perfilUsuario.tiempoDisponible;
      const coincidePreferencia = this.perfilUsuario.preferencias.includes(rec.categoria);
      
      return coincideNivel && coincideTiempo && coincidePreferencia;
    }).sort((a, b) => b.puntuacion - a.puntuacion);
  }

  generarPlanesPersonalizados(): void {
    this.planesPersonalizados = [
      {
        nombre: 'Plan Quema Grasa 4 Semanas',
        duracion: '4 semanas',
        objetivo: 'Pérdida de peso',
        descripcion: 'Combina cardio y fuerza para maximizar la quema de calorías',
        frecuencia: '4-5 días por semana',
        ejercicios: this.recomendaciones.filter(r => ['cardio', 'hiit'].includes(r.categoria)).slice(0, 3)
      },
      {
        nombre: 'Construcción Muscular Progresiva',
        duracion: '6 semanas',
        objetivo: 'Ganancia muscular',
        descripcion: 'Entrenamiento progresivo de fuerza con aumento gradual de intensidad',
        frecuencia: '3-4 días por semana',
        ejercicios: this.recomendaciones.filter(r => ['fuerza', 'core'].includes(r.categoria)).slice(0, 3)
      },
      {
        nombre: 'Bienestar Integral',
        duracion: '8 semanas',
        objetivo: 'Fitness general',
        descripcion: 'Programa equilibrado que incluye todos los aspectos del fitness',
        frecuencia: '5-6 días por semana',
        ejercicios: this.recomendaciones.slice(0, 4)
      },
      {
        nombre: 'Entrenamiento Funcional Completo',
        duracion: '5 semanas',
        objetivo: 'Movimiento funcional',
        descripcion: 'Mejora tu capacidad de movimiento en actividades diarias',
        frecuencia: '4 días por semana',
        ejercicios: this.recomendaciones.filter(r => ['funcional', 'core', 'flexibilidad'].includes(r.categoria)).slice(0, 3)
      }
    ];
  }

  // Métodos de navegación
  cambiarVista(vista: 'recomendaciones' | 'perfil' | 'planes'): void {
    this.vistaActual = vista;
  }

  // Métodos de filtrado
  aplicarFiltros(): void {
    // Lógica de filtrado basada en filtroCategoria y filtroNivel
    this.generarRecomendacionesPersonalizadas();
  }

  // Métodos de perfil
  actualizarPerfil(): void {
    this.generarRecomendacionesPersonalizadas();
    this.generarPlanesPersonalizados();
    this.cambiarVista('recomendaciones');
  }

  toggleObjetivo(objetivo: string): void {
    const index = this.perfilUsuario.objetivos.indexOf(objetivo);
    if (index > -1) {
      this.perfilUsuario.objetivos.splice(index, 1);
    } else {
      this.perfilUsuario.objetivos.push(objetivo);
    }
  }

  togglePreferencia(categoria: string): void {
    const index = this.perfilUsuario.preferencias.indexOf(categoria);
    if (index > -1) {
      this.perfilUsuario.preferencias.splice(index, 1);
    } else {
      this.perfilUsuario.preferencias.push(categoria);
    }
  }

  // Estados adicionales para la funcionalidad
  ejercicioEnEjecucion: Recomendacion | null = null;
  planEnSeguimiento: PlanPersonalizado | null = null;
  mostrarModalEjercicio: boolean = false;
  mostrarModalPlan: boolean = false;
  favoritos: number[] = []; // IDs de recomendaciones favoritas

  // Métodos de recomendaciones
  marcarComoFavorito(recomendacion: Recomendacion): void {
    const index = this.favoritos.indexOf(recomendacion.id);
    if (index > -1) {
      this.favoritos.splice(index, 1);
      console.log('Removido de favoritos:', recomendacion.titulo);
    } else {
      this.favoritos.push(recomendacion.id);
      console.log('Agregado a favoritos:', recomendacion.titulo);
    }
  }

  esFavorito(recomendacion: Recomendacion): boolean {
    return this.favoritos.includes(recomendacion.id);
  }

  iniciarEjercicio(recomendacion: Recomendacion): void {
    this.ejercicioEnEjecucion = recomendacion;
    this.mostrarModalEjercicio = true;
    console.log('Iniciando ejercicio:', recomendacion.titulo);
  }

  cerrarModalEjercicio(): void {
    this.mostrarModalEjercicio = false;
    this.ejercicioEnEjecucion = null;
  }

  comenzarEjercicioReal(): void {
    if (this.ejercicioEnEjecucion) {
      console.log('Comenzando ejercicio real:', this.ejercicioEnEjecucion.titulo);
      // Aquí puedes implementar la lógica para iniciar el temporizador o navegar a otra vista
      // Por ejemplo: this.router.navigate(['/ejercicio', this.ejercicioEnEjecucion.id]);
      
      // Simular inicio de ejercicio
      alert(`¡Comenzando "${this.ejercicioEnEjecucion.titulo}"!\n\nDuración: ${this.ejercicioEnEjecucion.duracion} minutos\nCalorías estimadas: ${this.ejercicioEnEjecucion.calorias}\n\n¡Vamos a entrenar! 💪`);
      this.cerrarModalEjercicio();
    }
  }

  compartirRecomendacion(recomendacion: Recomendacion): void {
    // Implementar funcionalidad de compartir usando Web Share API si está disponible
    if (navigator.share) {
      navigator.share({
        title: `Recomendación de ejercicio: ${recomendacion.titulo}`,
        text: `${recomendacion.descripcion} - Duración: ${recomendacion.duracion}min, Calorías: ${recomendacion.calorias}`,
        url: window.location.href
      }).then(() => {
        console.log('Recomendación compartida exitosamente');
      }).catch((error) => {
        console.log('Error al compartir:', error);
        this.compartirTradicional(recomendacion);
      });
    } else {
      this.compartirTradicional(recomendacion);
    }
  }

  private compartirTradicional(recomendacion: Recomendacion): void {
    const texto = `¡Mira esta recomendación de ejercicio!\n\n📋 ${recomendacion.titulo}\n📝 ${recomendacion.descripcion}\n⏱️ Duración: ${recomendacion.duracion} minutos\n🔥 Calorías: ${recomendacion.calorias}\n💪 Nivel: ${recomendacion.nivel}`;
    
    // Copiar al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        alert('¡Información copiada al portapapeles!');
      });
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('¡Información copiada al portapapeles!');
    }
  }

  seguirPlan(plan: PlanPersonalizado): void {
    this.planEnSeguimiento = plan;
    this.mostrarModalPlan = true;
    console.log('Siguiendo plan:', plan.nombre);
  }

  cerrarModalPlan(): void {
    this.mostrarModalPlan = false;
    this.planEnSeguimiento = null;
  }

  comenzarPlanReal(): void {
    if (this.planEnSeguimiento) {
      console.log('Comenzando plan real:', this.planEnSeguimiento.nombre);
      // Aquí puedes implementar la lógica para guardar el plan en el perfil del usuario
      // Por ejemplo: this.userService.agregarPlanActivo(this.planEnSeguimiento);
      
      // Simular inicio del plan
      alert(`¡Plan "${this.planEnSeguimiento.nombre}" activado! 🎯\n\n📅 Duración: ${this.planEnSeguimiento.duracion}\n🎯 Objetivo: ${this.planEnSeguimiento.objetivo}\n📊 Frecuencia: ${this.planEnSeguimiento.frecuencia}\n\n¡Comienza tu transformación hoy!`);
      this.cerrarModalPlan();
    }
  }

  verDetallesPlan(plan: PlanPersonalizado): void {
    // Mostrar información detallada del plan
    let detalles = `📋 ${plan.nombre}\n\n📝 ${plan.descripcion}\n\n🎯 Objetivo: ${plan.objetivo}\n📅 Duración: ${plan.duracion}\n📊 Frecuencia: ${plan.frecuencia}\n\n💪 Ejercicios incluidos:\n`;
    
    plan.ejercicios.forEach((ejercicio, index) => {
      detalles += `${index + 1}. ${ejercicio.titulo} (${ejercicio.duracion}min - ${ejercicio.calorias}cal)\n`;
    });
    
    detalles += `\n⏱️ Tiempo total por sesión: ${this.calcularTiempoTotal(plan.ejercicios)} minutos\n🔥 Calorías por sesión: ${this.calcularCaloriasTotal(plan.ejercicios)} calorías`;
    
    alert(detalles);
  }

  // Métodos de utilidad
  obtenerIconoCategoria(categoria: string): string {
    const cat = this.categoriasDisponibles.find(c => c.id === categoria);
    return cat ? cat.icono : '🏋️‍♂️';
  }

  obtenerNombreCategoria(categoria: string): string {
    const cat = this.categoriasDisponibles.find(c => c.id === categoria);
    return cat ? cat.nombre : categoria;
  }

  calcularTiempoTotal(ejercicios: Recomendacion[]): number {
    return ejercicios.reduce((total, ej) => total + ej.duracion, 0);
  }

  calcularCaloriasTotal(ejercicios: Recomendacion[]): number {
    return ejercicios.reduce((total, ej) => total + ej.calorias, 0);
  }
}