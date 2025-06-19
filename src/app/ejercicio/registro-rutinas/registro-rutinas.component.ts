// src/app/ejercicio/registro-rutinas/registro-rutinas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EjercicioService, Ejercicio, EjercicioEnRutina, Rutina, RegistroEjercicio } from '../services/ejercicio.service';

@Component({
  selector: 'app-registro-rutinas',
  templateUrl: './registro-rutinas.component.html',
  styleUrls: ['./registro-rutinas.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class RegistroRutinasComponent implements OnInit {

  // Estados del componente
  vistaActual: 'lista' | 'crear' | 'editar' | 'ejecutar' | 'historial' = 'lista';
  
  // Rutinas
  rutinas: Rutina[] = [];
  rutinaActual: Rutina | null = null;
  nuevaRutina: Partial<Rutina> = {};
  
  // Ejercicios disponibles
  ejerciciosDisponibles: Ejercicio[] = [];
  ejerciciosFiltrados: Ejercicio[] = [];
  
  // Filtros y búsqueda
  filtroCategoria: string = 'todas';
  filtroNivel: string = 'todos';
  busquedaTexto: string = '';
  
  // Formulario de nueva rutina
  pasoActual: number = 1;
  totalPasos: number = 3;
  
  // Ejecución de rutina
  rutinaEnEjecucion: Rutina | null = null;
  ejercicioActualIndex: number = 0;
  tiempoInicio: Date | null = null;
  tiempoTranscurrido: number = 0;
  timerInterval: any;
  enDescanso: boolean = false;
  tiempoDescanso: number = 0;
  
  // Historial
  historialEjercicios: RegistroEjercicio[] = [];
  
  // Datos de ejemplo
  categoriasDisponibles = [
    { id: 'fuerza', nombre: 'Fuerza', icono: '💪', color: '#e74c3c' },
    { id: 'cardio', nombre: 'Cardio', icono: '🏃‍♂️', color: '#3498db' },
    { id: 'flexibilidad', nombre: 'Flexibilidad', icono: '🧘‍♀️', color: '#9b59b6' },
    { id: 'hiit', nombre: 'HIIT', icono: '⚡', color: '#f39c12' },
    { id: 'funcional', nombre: 'Funcional', icono: '🏋️‍♂️', color: '#27ae60' }
  ];

  constructor(private ejercicioService: EjercicioService) {}

  ngOnInit(): void {
    this.cargarEjerciciosDisponibles();
    this.cargarRutinas();
    this.cargarHistorial();
    this.inicializarNuevaRutina();

    // Suscribirse a cambios en el historial
    this.ejercicioService.historial$.subscribe(historial => {
      this.historialEjercicios = historial;
    });

    // Suscribirse a cambios en rutinas
    this.ejercicioService.rutinas$.subscribe(rutinas => {
      if (rutinas.length > 0) {
        this.rutinas = rutinas;
      }
    });
  }

  // Método para obtener la ruta correcta de las imágenes
  private obtenerRutaImagen(tipo: 'ejercicios' | 'rutinas', nombre: string = 'default'): string {
    return `assets/images/${tipo}/${nombre}.jpg`;
  }

  cargarEjerciciosDisponibles(): void {
    this.ejerciciosDisponibles = [
      {
        id: 1,
        nombre: 'Flexiones de Pecho',
        categoria: 'fuerza',
        musculosObjetivo: ['Pectorales', 'Tríceps', 'Deltoides'],
        imagen: 'assets/images/ejercicios/flexiones.png'
      },
      {
        id: 2,
        nombre: 'Sentadillas',
        categoria: 'fuerza',
        musculosObjetivo: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'],
        imagen: 'assets/images/ejercicios/sentadillas.png'
      },
      {
        id: 3,
        nombre: 'Plancha',
        categoria: 'fuerza',
        musculosObjetivo: ['Core', 'Deltoides', 'Glúteos'],
        imagen: 'assets/images/ejercicios/plancha.png'
      },
      {
        id: 4,
        nombre: 'Jumping Jacks',
        categoria: 'cardio',
        musculosObjetivo: ['Cuerpo completo'],
        imagen: 'assets/images/ejercicios/jumping-jacks.png'
      },
      {
        id: 5,
        nombre: 'Burpees',
        categoria: 'hiit',
        musculosObjetivo: ['Cuerpo completo'],
        imagen: 'assets/images/ejercicios/burpees.png'
      },
      {
        id: 6,
        nombre: 'Estiramiento de Piernas',
        categoria: 'flexibilidad',
        musculosObjetivo: ['Isquiotibiales', 'Cuádriceps'],
        imagen: 'assets/images/ejercicios/estiramiento.png'
      },
      // Puedes agregar más ejercicios aquí usando las categorías que tienes
      {
        id: 7,
        nombre: 'Entrenamiento Core',
        categoria: 'core',
        musculosObjetivo: ['Abdominales', 'Oblicuos', 'Core'],
        imagen: 'assets/images/categorias/core.png'
      },
      {
        id: 8,
        nombre: 'Cardio Intenso',
        categoria: 'cardio',
        musculosObjetivo: ['Sistema Cardiovascular', 'Cuerpo completo'],
        imagen: 'assets/images/categorias/cardio.png'
      },
      {
        id: 9,
        nombre: 'Entrenamiento Funcional',
        categoria: 'funcional',
        musculosObjetivo: ['Estabilizadores', 'Core', 'Cadenas musculares'],
        imagen: 'assets/images/categorias/funcional.png'
      },
      {
        id: 10,
        nombre: 'HIIT Avanzado',
        categoria: 'hiit',
        musculosObjetivo: ['Todo el cuerpo', 'Sistema cardiovascular'],
        imagen: 'assets/images/categorias/hiit.png'
      }
    ];
    this.ejerciciosFiltrados = [...this.ejerciciosDisponibles];
  }

  cargarRutinas(): void {
    this.rutinas = [
      {
        id: 1,
        nombre: 'Rutina Matutina Energizante',
        descripcion: 'Perfecta para empezar el día con energía',
        categoria: 'cardio',
        duracionEstimada: 20,
        nivel: 'principiante',
        ejercicios: [
          {
            ejercicio: this.ejerciciosDisponibles[3], // Jumping Jacks
            series: 3,
            repeticiones: 20,
            descanso: 30,
            completado: false
          },
          {
            ejercicio: this.ejerciciosDisponibles[0], // Flexiones
            series: 3,
            repeticiones: 10,
            descanso: 45,
            completado: false
          }
        ],
        fechaCreacion: new Date('2025-06-01'),
        vecesEjecutada: 15,
        esPlantilla: false,
        esFavorita: true,
        imagen: 'assets/images/categorias/cardio.png', // Usar imagen de categoría
        etiquetas: ['mañana', 'energía', 'rápido']
      },
      {
        id: 2,
        nombre: 'Fuerza Total',
        descripcion: 'Entrenamiento completo de fuerza para todo el cuerpo',
        categoria: 'fuerza',
        duracionEstimada: 45,
        nivel: 'intermedio',
        ejercicios: [
          {
            ejercicio: this.ejerciciosDisponibles[2], // Plancha
            series: 3,
            repeticiones: 1, // Para ejercicios de tiempo, ponemos 1 repetición
            tiempo: 45,
            descanso: 45,
            completado: false
          }
        ],
        fechaCreacion: new Date('2025-05-15'),
        vecesEjecutada: 8,
        esPlantilla: true,
        esFavorita: false,
        imagen: 'assets/images/categorias/fuerza.png', // Usar imagen de categoría
        etiquetas: ['fuerza', 'músculo', 'completo']
      },
      {
        id: 3,
        nombre: 'HIIT Explosivo',
        descripcion: 'Entrenamiento de alta intensidad por intervalos',
        categoria: 'hiit',
        duracionEstimada: 25,
        nivel: 'avanzado',
        ejercicios: [
          {
            ejercicio: this.ejerciciosDisponibles[4], // Burpees
            series: 4,
            repeticiones: 15,
            descanso: 30,
            completado: false
          }
        ],
        fechaCreacion: new Date('2025-06-05'),
        vecesEjecutada: 3,
        esPlantilla: false,
        esFavorita: true,
        imagen: 'assets/images/categorias/hiit.png',
        etiquetas: ['hiit', 'intenso', 'quema-grasa']
      },
      {
        id: 4,
        nombre: 'Flexibilidad y Movilidad',
        descripcion: 'Mejora tu rango de movimiento y previene lesiones',
        categoria: 'flexibilidad',
        duracionEstimada: 30,
        nivel: 'principiante',
        ejercicios: [
          {
            ejercicio: this.ejerciciosDisponibles[5], // Estiramiento
            series: 2,
            repeticiones: 1,
            tiempo: 60,
            descanso: 15,
            completado: false
          }
        ],
        fechaCreacion: new Date('2025-05-20'),
        vecesEjecutada: 12,
        esPlantilla: true,
        esFavorita: false,
        imagen: 'assets/images/categorias/felxibilidad.png', // Nota: mantener el typo si el archivo se llama así
        etiquetas: ['flexibilidad', 'movilidad', 'recuperación']
      },
      {
        id: 5,
        nombre: 'Core Power',
        descripcion: 'Fortalece tu núcleo con ejercicios específicos',
        categoria: 'core',
        duracionEstimada: 20,
        nivel: 'intermedio',
        ejercicios: [
          {
            ejercicio: this.ejerciciosDisponibles[6], // Core
            series: 3,
            repeticiones: 15,
            descanso: 45,
            completado: false
          }
        ],
        fechaCreacion: new Date('2025-06-10'),
        vecesEjecutada: 5,
        esPlantilla: false,
        esFavorita: true,
        imagen: 'assets/images/categorias/core.png',
        etiquetas: ['core', 'abdomen', 'estabilidad']
      },
      {
        id: 6,
        nombre: 'Funcional Dinámico',
        descripcion: 'Movimientos que imitan actividades de la vida diaria',
        categoria: 'funcional',
        duracionEstimada: 35,
        nivel: 'intermedio',
        ejercicios: [
          {
            ejercicio: this.ejerciciosDisponibles[8], // Funcional
            series: 3,
            repeticiones: 12,
            descanso: 60,
            completado: false
          }
        ],
        fechaCreacion: new Date('2025-06-08'),
        vecesEjecutada: 7,
        esPlantilla: true,
        esFavorita: false,
        imagen: 'assets/images/categorias/funcional.png',
        etiquetas: ['funcional', 'movimiento', 'coordinación']
      }
    ];

    // Actualizar el servicio con las rutinas cargadas
    this.ejercicioService.actualizarRutinas(this.rutinas);
  }

  cargarHistorial(): void {
    // Obtener historial del servicio
    this.historialEjercicios = this.ejercicioService.obtenerHistorial();
  }

  // Navegación entre vistas
  cambiarVista(vista: 'lista' | 'crear' | 'editar' | 'ejecutar' | 'historial'): void {
    this.vistaActual = vista;
    if (vista === 'crear') {
      this.inicializarNuevaRutina();
      this.pasoActual = 1;
    }
  }

  // Gestión de rutinas
  inicializarNuevaRutina(): void {
    this.nuevaRutina = {
      nombre: '',
      descripcion: '',
      categoria: 'fuerza',
      nivel: 'principiante',
      ejercicios: [],
      esPlantilla: false,
      esFavorita: false,
      etiquetas: []
    };
  }

  siguientePaso(): void {
    if (this.pasoActual < this.totalPasos) {
      this.pasoActual++;
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  filtrarEjercicios(): void {
    this.ejerciciosFiltrados = this.ejerciciosDisponibles.filter(ejercicio => {
      const coincideCategoria = this.filtroCategoria === 'todas' || ejercicio.categoria === this.filtroCategoria;
      const coincideTexto = ejercicio.nombre.toLowerCase().includes(this.busquedaTexto.toLowerCase());
      return coincideCategoria && coincideTexto;
    });
  }

  agregarEjercicioALaRutina(ejercicio: Ejercicio): void {
    const ejercicioEnRutina: EjercicioEnRutina = {
      ejercicio: ejercicio,
      series: 3,
      repeticiones: 10,
      descanso: 60,
      completado: false
    };
    
    if (!this.nuevaRutina.ejercicios) {
      this.nuevaRutina.ejercicios = [];
    }
    
    this.nuevaRutina.ejercicios.push(ejercicioEnRutina);
  }

  eliminarEjercicioDeLaRutina(index: number): void {
    if (this.nuevaRutina.ejercicios) {
      this.nuevaRutina.ejercicios.splice(index, 1);
    }
  }

  calcularDuracionEstimada(): number {
    if (!this.nuevaRutina.ejercicios) return 0;
    
    return this.nuevaRutina.ejercicios.reduce((total, ej) => {
      const tiempoEjercicio = ej.tiempo || (ej.repeticiones * 3); // 3 segundos por repetición
      const tiempoDescanso = ej.descanso;
      const tiempoSeries = (tiempoEjercicio + tiempoDescanso) * ej.series;
      return total + tiempoSeries;
    }, 0) / 60; // Convertir a minutos
  }

  guardarRutina(): void {
    if (this.nuevaRutina.ejercicios && this.nuevaRutina.ejercicios.length > 0) {
      const rutina: Rutina = {
        id: this.rutinas.length + 1,
        nombre: this.nuevaRutina.nombre || 'Mi Rutina',
        descripcion: this.nuevaRutina.descripcion || '',
        categoria: this.nuevaRutina.categoria || 'fuerza',
        duracionEstimada: Math.round(this.calcularDuracionEstimada()),
        nivel: this.nuevaRutina.nivel || 'principiante',
        ejercicios: this.nuevaRutina.ejercicios,
        fechaCreacion: new Date(),
        vecesEjecutada: 0,
        esPlantilla: this.nuevaRutina.esPlantilla || false,
        esFavorita: this.nuevaRutina.esFavorita || false,
        imagen: this.obtenerRutaImagen('rutinas', 'default'),
        etiquetas: this.nuevaRutina.etiquetas || []
      };
      
      this.rutinas.push(rutina);
      // Actualizar el servicio
      this.ejercicioService.actualizarRutinas(this.rutinas);
      this.cambiarVista('lista');
      console.log('Rutina guardada:', rutina);
    }
  }

  // Ejecución de rutinas
  iniciarRutina(rutina: Rutina): void {
    this.rutinaEnEjecucion = { ...rutina };
    // Resetear estado de ejercicios
    this.rutinaEnEjecucion.ejercicios.forEach(ej => ej.completado = false);
    this.ejercicioActualIndex = 0;
    this.tiempoInicio = new Date();
    this.tiempoTranscurrido = 0;
    this.enDescanso = false;
    this.iniciarTimer();
    this.cambiarVista('ejecutar');
  }

  iniciarTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.tiempoInicio) {
        this.tiempoTranscurrido = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 1000);
      }
      
      if (this.enDescanso && this.tiempoDescanso > 0) {
        this.tiempoDescanso--;
        if (this.tiempoDescanso === 0) {
          this.enDescanso = false;
        }
      }
    }, 1000);
  }

  completarEjercicio(): void {
    if (this.rutinaEnEjecucion && this.ejercicioActualIndex < this.rutinaEnEjecucion.ejercicios.length) {
      const ejercicioActual = this.rutinaEnEjecucion.ejercicios[this.ejercicioActualIndex];
      ejercicioActual.completado = true;
      
      // Iniciar descanso si no es el último ejercicio
      if (this.ejercicioActualIndex < this.rutinaEnEjecucion.ejercicios.length - 1) {
        this.tiempoDescanso = ejercicioActual.descanso;
        this.enDescanso = true;
        setTimeout(() => {
          this.siguienteEjercicio();
        }, ejercicioActual.descanso * 1000);
      } else {
        this.finalizarRutina();
      }
    }
  }

  siguienteEjercicio(): void {
    if (this.rutinaEnEjecucion && this.ejercicioActualIndex < this.rutinaEnEjecucion.ejercicios.length - 1) {
      this.ejercicioActualIndex++;
      this.enDescanso = false;
    }
  }

  ejercicioAnterior(): void {
    if (this.ejercicioActualIndex > 0) {
      this.ejercicioActualIndex--;
      this.enDescanso = false;
    }
  }

  pausarRutina(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  reanudarRutina(): void {
    if (!this.timerInterval) {
      this.iniciarTimer();
    }
  }

  finalizarRutina(): void {
    if (this.rutinaEnEjecucion && this.tiempoInicio) {
      const duracionReal = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 60000);
      const ejerciciosCompletados = this.rutinaEnEjecucion.ejercicios.filter(ej => ej.completado).length;
      
      const registro: RegistroEjercicio = {
        id: this.historialEjercicios.length + 1,
        rutinaId: this.rutinaEnEjecucion.id,
        nombreRutina: this.rutinaEnEjecucion.nombre,
        fecha: new Date(),
        duracionReal: duracionReal,
        ejerciciosCompletados: ejerciciosCompletados,
        ejerciciosTotal: this.rutinaEnEjecucion.ejercicios.length,
        caloriasQuemadas: this.calcularCaloriasQuemadas(duracionReal),
        notas: '',
        estado: ejerciciosCompletados === this.rutinaEnEjecucion.ejercicios.length ? 'completada' : 'incompleta',
        categoria: this.rutinaEnEjecucion.categoria
      };
      
      // Agregar al servicio
      this.ejercicioService.agregarRegistro(registro);
      
      // Actualizar estadísticas de la rutina
      const rutinaOriginal = this.rutinas.find(r => r.id === this.rutinaEnEjecucion!.id);
      if (rutinaOriginal) {
        rutinaOriginal.vecesEjecutada++;
        rutinaOriginal.fechaUltimaEjecucion = new Date();
        // Actualizar en el servicio
        this.ejercicioService.actualizarRutinas(this.rutinas);
      }
      
      this.limpiarEjecucion();
      this.cambiarVista('historial');
    }
  }

  limpiarEjecucion(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.rutinaEnEjecucion = null;
    this.ejercicioActualIndex = 0;
    this.tiempoInicio = null;
    this.tiempoTranscurrido = 0;
    this.enDescanso = false;
    this.tiempoDescanso = 0;
  }

  // Utilidades
  obtenerIconoCategoria(categoria: string): string {
    const cat = this.categoriasDisponibles.find(c => c.id === categoria);
    return cat ? cat.icono : '🏋️‍♂️';
  }

  obtenerColorCategoria(categoria: string): string {
    const cat = this.categoriasDisponibles.find(c => c.id === categoria);
    return cat ? cat.color : '#95a5a6';
  }

  calcularCaloriasQuemadas(duracion: number): number {
    // Cálculo estimado: 5 calorías por minuto (varía según intensidad)
    return Math.round(duracion * 5);
  }

  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  marcarComoFavorita(rutina: Rutina): void {
    rutina.esFavorita = !rutina.esFavorita;
    // Actualizar en el servicio
    this.ejercicioService.actualizarRutinas(this.rutinas);
  }

  duplicarRutina(rutina: Rutina): void {
    const nuevaRutina: Rutina = {
      ...rutina,
      id: this.rutinas.length + 1,
      nombre: `${rutina.nombre} (Copia)`,
      fechaCreacion: new Date(),
      vecesEjecutada: 0,
      fechaUltimaEjecucion: undefined
    };
    this.rutinas.push(nuevaRutina);
    // Actualizar en el servicio
    this.ejercicioService.actualizarRutinas(this.rutinas);
  }

  eliminarRutina(rutinaId: number): void {
    this.rutinas = this.rutinas.filter(r => r.id !== rutinaId);
    // Actualizar en el servicio
    this.ejercicioService.actualizarRutinas(this.rutinas);
  }

  // Método para manejar las etiquetas
  actualizarEtiquetas(valor: string): void {
    if (valor) {
      this.nuevaRutina.etiquetas = valor.split(',').map(t => t.trim()).filter(t => t);
    } else {
      this.nuevaRutina.etiquetas = [];
    }
  }

  // Métodos para el template del historial
  calcularTiempoTotal(): number {
    return this.historialEjercicios.reduce((total, h) => total + h.duracionReal, 0);
  }

  calcularCaloriasTotal(): number {
    return this.historialEjercicios.reduce((total, h) => total + h.caloriasQuemadas, 0);
  }
}