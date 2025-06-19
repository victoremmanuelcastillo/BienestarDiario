// src/app/ejercicio/ejercicio.component.ts
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { EjercicioService, Categoria, Ejercicio } from '../services/ejercicio.service';

@Component({
  selector: 'app-ejercicio',
  templateUrl: './ejercicio.component.html',
  styleUrls: ['./ejercicio.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class EjercicioComponent implements OnInit {
  categorias: Categoria[] = [];
  ejerciciosPorCategoria: { [key: string]: any[] } = {};
  categoriaSeleccionada: string | null = null;
  ejercicioSeleccionado: Ejercicio | null = null;
  cargando: boolean = false;
  error: string | null = null;

  constructor(
    private ejercicioService: EjercicioService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.ejercicioService.getCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar categorías:', err);
        this.error = 'No se pudieron cargar las categorías de ejercicios.';
        this.cargando = false;
        // Cargar datos de ejemplo en caso de error
        this.categorias = this.ejercicioService.getCategoriasEjemplo();
      }
    });
  }

  seleccionarCategoria(categoria: Categoria): void {
    this.categoriaSeleccionada = categoria.nombre;
    this.ejercicioSeleccionado = null;
    this.cargando = true;
    
    // Verificar si ya tenemos los ejercicios de esta categoría cargados
    if (this.categoriaSeleccionada && this.ejerciciosPorCategoria[this.categoriaSeleccionada]) {
      this.cargando = false;
      return;
    }
    
    this.ejercicioService.getEjerciciosPorCategoria(categoria.id).subscribe({
      next: (data: Ejercicio[]) => {
        if (this.categoriaSeleccionada) {
          this.ejerciciosPorCategoria[this.categoriaSeleccionada] = data;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error(`Error al cargar ejercicios de ${categoria.nombre}:`, err);
        this.error = `No se pudieron cargar los ejercicios de ${categoria.nombre}.`;
        this.cargando = false;
        // Cargar datos de ejemplo en caso de error
        if (this.categoriaSeleccionada) {
          this.ejerciciosPorCategoria[this.categoriaSeleccionada] = 
            this.ejercicioService.getEjerciciosEjemploPorCategoria(categoria.id);
        }
      }
    });
  }

  verDetallesEjercicio(ejercicio: Ejercicio): void {
    this.ejercicioSeleccionado = ejercicio;
    
    // Si no hay instrucciones detalladas, cargarlas
    if (!ejercicio.instrucciones || !ejercicio.video) {
      this.cargando = true;
      this.ejercicioService.getDetallesEjercicio(ejercicio.id).subscribe({
        next: (data: Partial<Ejercicio>) => {
          // Actualizar el ejercicio seleccionado con los detalles completos
          if (this.ejercicioSeleccionado) {
            this.ejercicioSeleccionado = { ...ejercicio, ...data };
          }
          this.cargando = false;
        },
        error: (err: any) => {
          console.error(`Error al cargar detalles del ejercicio ${ejercicio.nombre}:`, err);
          this.error = `No se pudieron cargar los detalles del ejercicio.`;
          this.cargando = false;
          
          // Obtener detalles de ejemplo
          const detallesEjemplo = this.ejercicioService.getDetallesEjercicioEjemplo(ejercicio.id);
          if (this.ejercicioSeleccionado) {
            this.ejercicioSeleccionado = { ...ejercicio, ...detallesEjemplo };
          }
        }
      });
    }
  }

  volverACategoria(): void {
    this.ejercicioSeleccionado = null;
  }

  volverACategorias(): void {
    this.categoriaSeleccionada = null;
    this.ejercicioSeleccionado = null;
  }

  // Método para sanitizar URLs de videos
  getSafeVideoUrl(videoUrl: string | undefined): SafeResourceUrl {
    if (!videoUrl) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }

  // Métodos para manejar objetos posiblemente nulos
  getNombre(objeto: any): string {
    return objeto?.nombre || 'Sin nombre';
  }

  getDescripcion(objeto: any): string {
    return objeto?.descripcion || 'Sin descripción';
  }

  getMusculos(ejercicio: Ejercicio | null): string[] {
    return ejercicio?.musculos || [];
  }

  getInstrucciones(ejercicio: Ejercicio | null): string[] {
    return ejercicio?.instrucciones || [];
  }

  getDificultad(ejercicio: Ejercicio | null): string {
    return ejercicio?.dificultad || 'No especificada';
  }

  getEquipamiento(ejercicio: Ejercicio | null): string {
    return ejercicio?.equipamiento || 'No especificado';
  }
}