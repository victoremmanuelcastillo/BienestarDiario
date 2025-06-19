// src/app/ejercicio/categorias/categorias.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  imagen: string;
  ejerciciosCount: number;
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'todos';
  beneficios: string[];
  equipamientoRequerido: string[];
  tiempoPromedio: number;
  caloriasPromedio: number;
  musculosPrincipales: string[];
  popularidad: number;
  tags: string[];
}

interface EjercicioCategoria {
  id: number;
  nombre: string;
  descripcion: string;
  dificultad: 'fácil' | 'medio' | 'difícil';
  duracion: number;
  calorias: number;
  imagen: string;
  video?: string;
  instrucciones: string[];
  variaciones: string[];
  precauciones: string[];
}

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class CategoriasComponent implements OnInit {
  
  // Estados del componente
  vistaActual: 'categorias' | 'detalle' = 'categorias';
  categoriaSeleccionada: Categoria | null = null;
  ejercicioSeleccionado: EjercicioCategoria | null = null;
  
  // Filtros
  filtroNivel: string = 'todos';
  ordenPor: 'nombre' | 'popularidad' | 'ejercicios' = 'popularidad';
  busquedaTexto: string = '';
  
  // Datos
  categorias: Categoria[] = [];
  ejerciciosPorCategoria: { [key: string]: EjercicioCategoria[] } = {};
  categoriasFiltradas: Categoria[] = [];
  
  // Loading states
  cargandoCategorias: boolean = false;
  cargandoEjercicios: boolean = false;

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarEjerciciosPorCategoria();
  }

  cargarCategorias(): void {
    this.cargandoCategorias = true;
    
    // Simular carga de datos
    setTimeout(() => {
      this.categorias = [
        {
          id: 'cardio',
          nombre: 'Cardio',
          descripcion: 'Ejercicios cardiovasculares para mejorar la resistencia y quemar calorías',
          icono: '🏃‍♂️',
          color: '#e74c3c',
          imagen: 'assets/images/ejercicios/cardio.png',
          ejerciciosCount: 25,
          nivel: 'todos',
          beneficios: [
            'Mejora la salud cardiovascular',
            'Quema calorías eficientemente',
            'Aumenta la resistencia',
            'Reduce el estrés',
            'Mejora el estado de ánimo'
          ],
          equipamientoRequerido: ['Ninguno', 'Zapatillas deportivas'],
          tiempoPromedio: 30,
          caloriasPromedio: 300,
          musculosPrincipales: ['Corazón', 'Pulmones', 'Piernas'],
          popularidad: 95,
          tags: ['resistencia', 'quema-grasa', 'salud-cardíaca']
        },
        {
          id: 'fuerza',
          nombre: 'Fuerza',
          descripcion: 'Entrenamiento con pesas y resistencia para desarrollar masa muscular',
          icono: '💪',
          color: '#2ecc71',
          imagen: 'assets/images/ejercicios/fuerza.png',
          ejerciciosCount: 40,
          nivel: 'todos',
          beneficios: [
            'Desarrolla masa muscular',
            'Aumenta la fuerza',
            'Mejora la densidad ósea',
            'Acelera el metabolismo',
            'Mejora la postura'
          ],
          equipamientoRequerido: ['Pesas', 'Mancuernas', 'Bandas elásticas'],
          tiempoPromedio: 45,
          caloriasPromedio: 250,
          musculosPrincipales: ['Pectorales', 'Bíceps', 'Tríceps', 'Espalda'],
          popularidad: 90,
          tags: ['músculo', 'fuerza', 'tonificación']
        },
        {
          id: 'flexibilidad',
          nombre: 'Flexibilidad',
          descripcion: 'Estiramientos y yoga para mejorar la flexibilidad y movilidad',
          icono: '🧘‍♀️',
          color: '#9b59b6',
          imagen: 'assets/images/ejercicios/felxibilidad.png',
          ejerciciosCount: 30,
          nivel: 'principiante',
          beneficios: [
            'Mejora la flexibilidad',
            'Reduce la tensión muscular',
            'Previene lesiones',
            'Mejora la postura',
            'Reduce el estrés'
          ],
          equipamientoRequerido: ['Esterilla de yoga'],
          tiempoPromedio: 25,
          caloriasPromedio: 120,
          musculosPrincipales: ['Todo el cuerpo'],
          popularidad: 85,
          tags: ['flexibilidad', 'relajación', 'movilidad']
        },
        {
          id: 'hiit',
          nombre: 'HIIT',
          descripcion: 'Entrenamiento de intervalos de alta intensidad para máximos resultados',
          icono: '⚡',
          color: '#f39c12',
          imagen: 'assets/images/ejercicios/hiit.png',
          ejerciciosCount: 20,
          nivel: 'intermedio',
          beneficios: [
            'Quema muchas calorías en poco tiempo',
            'Mejora la capacidad anaeróbica',
            'Efecto afterburn prolongado',
            'Ahorra tiempo',
            'Mejora la resistencia'
          ],
          equipamientoRequerido: ['Ninguno', 'Cronómetro'],
          tiempoPromedio: 20,
          caloriasPromedio: 400,
          musculosPrincipales: ['Cuerpo completo'],
          popularidad: 88,
          tags: ['intenso', 'quema-grasa', 'eficiente']
        },
        {
          id: 'core',
          nombre: 'Core',
          descripcion: 'Fortalecimiento del núcleo corporal para mejor estabilidad',
          icono: '🔥',
          color: '#e67e22',
          imagen: 'assets/images/ejercicios/core.png',
          ejerciciosCount: 18,
          nivel: 'todos',
          beneficios: [
            'Fortalece el abdomen',
            'Mejora la estabilidad',
            'Reduce el dolor de espalda',
            'Mejora el equilibrio',
            'Mejor rendimiento deportivo'
          ],
          equipamientoRequerido: ['Esterilla'],
          tiempoPromedio: 15,
          caloriasPromedio: 150,
          musculosPrincipales: ['Abdominales', 'Oblicuos', 'Espalda baja'],
          popularidad: 82,
          tags: ['abdomen', 'estabilidad', 'core']
        },
        {
          id: 'funcional',
          nombre: 'Funcional',
          descripcion: 'Movimientos que imitan actividades de la vida diaria',
          icono: '🏋️‍♂️',
          color: '#3498db',
          imagen: 'assets/images/ejercicios/funcional.png',
          ejerciciosCount: 22,
          nivel: 'intermedio',
          beneficios: [
            'Mejora movimientos cotidianos',
            'Trabaja múltiples grupos musculares',
            'Mejora la coordinación',
            'Aumenta la fuerza funcional',
            'Previene lesiones'
          ],
          equipamientoRequerido: ['Kettlebells', 'Pelotas medicinales', 'TRX'],
          tiempoPromedio: 35,
          caloriasPromedio: 280,
          musculosPrincipales: ['Cuerpo completo'],
          popularidad: 78,
          tags: ['funcional', 'coordinación', 'vida-diaria']
        }
      ];
      
      this.aplicarFiltros();
      this.cargandoCategorias = false;
    }, 1000);
  }

  cargarEjerciciosPorCategoria(): void {
    // Ejercicios de ejemplo para cada categoría
    this.ejerciciosPorCategoria = {
      cardio: [
        {
          id: 1,
          nombre: 'Jumping Jacks',
          descripcion: 'Saltos con apertura de piernas y brazos',
          dificultad: 'fácil',
          duracion: 3,
          calorias: 30,
          imagen: 'assets/images/ejercicios/funcional.png',
          instrucciones: [
            'Párate derecho con los pies juntos',
            'Salta abriendo las piernas a la anchura de los hombros',
            'Simultáneamente levanta los brazos por encima de la cabeza',
            'Salta de nuevo juntando pies y bajando brazos',
            'Repite el movimiento de forma continua'
          ],
          variaciones: ['Jumping Jacks lentos', 'Half Jacks', 'Power Jacks'],
          precauciones: ['Mantén las rodillas ligeramente flexionadas', 'Aterriza suavemente']
        },
        {
          id: 2,
          nombre: 'Mountain Climbers',
          descripcion: 'Ejercicio que simula escalar una montaña',
          dificultad: 'medio',
          duracion: 2,
          calorias: 25,
          imagen: 'assets/images/ejercicios/core.png',
          instrucciones: [
            'Inicia en posición de plancha',
            'Lleva una rodilla hacia el pecho',
            'Alterna rápidamente entre ambas piernas',
            'Mantén el core contraído',
            'Continúa el movimiento de forma dinámica'
          ],
          variaciones: ['Mountain Climbers lentos', 'Cross-body Mountain Climbers'],
          precauciones: ['No eleves demasiado las caderas', 'Mantén las muñecas alineadas']
        }
      ],
      fuerza: [
        {
          id: 3,
          nombre: 'Flexiones de Pecho',
          descripcion: 'Ejercicio clásico para fortalecer pectorales y brazos',
          dificultad: 'medio',
          duracion: 4,
          calorias: 20,
          imagen: 'assets/images/ejercicios/fuerza.png',
          instrucciones: [
            'Posición de plancha con manos a la anchura de hombros',
            'Baja el cuerpo manteniendo línea recta',
            'Desciende hasta casi tocar el suelo',
            'Empuja hacia arriba hasta posición inicial',
            'Mantén el core contraído todo el tiempo'
          ],
          variaciones: ['Flexiones en rodillas', 'Flexiones inclinadas', 'Flexiones diamante'],
          precauciones: ['No arquees la espalda', 'Controla el descenso']
        }
      ],
      hiit: [
        {
          id: 4,
          nombre: 'Burpees',
          descripcion: 'Ejercicio completo de alta intensidad',
          dificultad: 'difícil',
          duracion: 5,
          calorias: 50,
          imagen: 'assets/images/ejercicios/hiit.png',
          instrucciones: [
            'Párate derecho',
            'Baja a posición de cuclillas y pon las manos en el suelo',
            'Salta hacia atrás a posición de plancha',
            'Haz una flexión (opcional)',
            'Salta los pies hacia las manos',
            'Salta verticalmente con brazos arriba'
          ],
          variaciones: ['Half Burpees', 'Burpee con salto lateral'],
          precauciones: ['Mantén la forma correcta', 'Descansa si es necesario']
        }
      ],
      flexibilidad: [
        {
          id: 5,
          nombre: 'Estiramiento de Isquiotibiales',
          descripcion: 'Estiramiento para la parte posterior de las piernas',
          dificultad: 'fácil',
          duracion: 2,
          calorias: 5,
          imagen: 'assets/images/ejercicios/flexibilidad.png',
          instrucciones: [
            'Siéntate con una pierna extendida',
            'Flexiona hacia adelante desde las caderas',
            'Alcanza hacia el pie sin forzar',
            'Mantén la posición 20-30 segundos',
            'Repite con la otra pierna'
          ],
          variaciones: ['De pie', 'Con banda elástica'],
          precauciones: ['No rebotes', 'Respira profundamente']
        }
      ],
      core: [
        {
          id: 6,
          nombre: 'Plancha Estática',
          descripcion: 'Ejercicio isométrico para fortalecer el core',
          dificultad: 'medio',
          duracion: 3,
          calorias: 15,
          imagen: 'assets/images/ejercicios/core.png',
          instrucciones: [
            'Posición de flexión pero apoyado en antebrazos',
            'Mantén el cuerpo en línea recta',
            'Contrae abdominales y glúteos',
            'Respira normalmente',
            'Mantén la posición el tiempo indicado'
          ],
          variaciones: ['Plancha lateral', 'Plancha con elevación de pierna'],
          precauciones: ['No hundas las caderas', 'No eleves el trasero']
        }
      ],
      funcional: [
        {
          id: 7,
          nombre: 'Sentadillas Goblet',
          descripcion: 'Sentadillas sosteniendo peso en el pecho',
          dificultad: 'medio',
          duracion: 4,
          calorias: 25,
          imagen: 'assets/images/ejercicios/funcional.png',
          instrucciones: [
            'Sostén una pesa cerca del pecho',
            'Párate con pies a anchura de hombros',
            'Baja como si te sentaras en una silla',
            'Desciende hasta que los muslos estén paralelos',
            'Empuja a través de los talones para subir'
          ],
          variaciones: ['Con kettlebell', 'Con mancuerna'],
          precauciones: ['Mantén el pecho erguido', 'No dejes que las rodillas se vayan hacia adentro']
        }
      ]
    };
  }

  // Métodos de filtrado y búsqueda
  aplicarFiltros(): void {
    this.categoriasFiltradas = this.categorias.filter(categoria => {
      const coincideNivel = this.filtroNivel === 'todos' || categoria.nivel === this.filtroNivel || categoria.nivel === 'todos';
      const coincideTexto = categoria.nombre.toLowerCase().includes(this.busquedaTexto.toLowerCase()) ||
                           categoria.descripcion.toLowerCase().includes(this.busquedaTexto.toLowerCase()) ||
                           categoria.tags.some(tag => tag.toLowerCase().includes(this.busquedaTexto.toLowerCase()));
      
      return coincideNivel && coincideTexto;
    });
    
    this.ordenarCategorias();
  }

  ordenarCategorias(): void {
    this.categoriasFiltradas.sort((a, b) => {
      switch (this.ordenPor) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'ejercicios':
          return b.ejerciciosCount - a.ejerciciosCount;
        case 'popularidad':
        default:
          return b.popularidad - a.popularidad;
      }
    });
  }

  // Getters para el template
  get ejercicioActual(): EjercicioCategoria | null {
    return this.ejercicioSeleccionado;
  }

  get categoriaActual(): Categoria | null {
    return this.categoriaSeleccionada;
  }

  // Métodos de navegación
  verDetalleCategoria(categoria: Categoria): void {
    this.categoriaSeleccionada = categoria;
    this.vistaActual = 'detalle';
    this.cargarEjerciciosDeCategoria(categoria.id);
  }

  volverACategorias(): void {
    this.vistaActual = 'categorias';
    this.categoriaSeleccionada = null;
    this.ejercicioSeleccionado = null;
  }

  cargarEjerciciosDeCategoria(categoriaId: string): void {
    this.cargandoEjercicios = true;
    
    // Simular carga
    setTimeout(() => {
      this.cargandoEjercicios = false;
    }, 500);
  }

  verDetalleEjercicio(ejercicio: EjercicioCategoria): void {
    this.ejercicioSeleccionado = ejercicio;
  }

  cerrarDetalleEjercicio(): void {
    this.ejercicioSeleccionado = null;
  }

  // Métodos de utilidad
  obtenerEjerciciosDeCategoria(categoriaId: string): EjercicioCategoria[] {
    if (!categoriaId) {
      return [];
    }
    return this.ejerciciosPorCategoria[categoriaId] || [];
  }

  calcularCaloriasTotales(ejercicios: EjercicioCategoria[]): number {
    if (!ejercicios || ejercicios.length === 0) {
      return 0;
    }
    return ejercicios.reduce((total, ej) => total + ej.calorias, 0);
  }

  calcularTiempoTotal(ejercicios: EjercicioCategoria[]): number {
    if (!ejercicios || ejercicios.length === 0) {
      return 0;
    }
    return ejercicios.reduce((total, ej) => total + ej.duracion, 0);
  }

  obtenerEjerciciosPorDificultad(ejercicios: EjercicioCategoria[], dificultad: string): EjercicioCategoria[] {
    if (!ejercicios || ejercicios.length === 0 || !dificultad) {
      return [];
    }
    return ejercicios.filter(ej => ej.dificultad === dificultad);
  }

  iniciarEjercicio(ejercicio: EjercicioCategoria): void {
    if (!ejercicio) {
      console.warn('No se puede iniciar ejercicio: ejercicio no válido');
      return;
    }
    console.log('Iniciando ejercicio:', ejercicio.nombre);
    // Aquí implementarías la navegación al ejercicio
  }

  marcarComoFavorito(categoria: Categoria): void {
    if (!categoria) {
      console.warn('No se puede marcar como favorita: categoría no válida');
      return;
    }
    console.log('Marcando como favorita:', categoria.nombre);
    // Implementar funcionalidad de favoritos
  }

  compartirCategoria(categoria: Categoria): void {
    if (!categoria) {
      console.warn('No se puede compartir: categoría no válida');
      return;
    }
    console.log('Compartiendo categoría:', categoria.nombre);
    // Implementar funcionalidad de compartir
  }

  // Eventos de filtros
  onFiltroNivelChange(): void {
    this.aplicarFiltros();
  }

  onOrdenChange(): void {
    this.ordenarCategorias();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }
}