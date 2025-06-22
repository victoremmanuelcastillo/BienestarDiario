// motivacion.component.ts - Componente corregido
import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MensajeMotivacion {
  id: string;
  mensaje: string;
  tipoProgreso: 'inicio' | 'bajo' | 'medio' | 'alto' | 'completado';
  rangoProgreso: { min: number; max: number };
  usado: boolean;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-motivacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motivacion.component.html',
  styleUrls: ['./motivacion.component.css']
})
export class MotivacionComponent implements OnInit, OnChanges {
  @Input() completionRate: number = 0;
  @Input() currentStreak: number = 0;
  @Input() totalActivities: number = 0;

  mensajeActual: string = '';
  mostrarMensaje: boolean = false;
  
  // Mensajes de respaldo predefinidos
  mensajesRespaldo: MensajeMotivacion[] = [
    // Inicio (0-20%)
    {
      id: 'backup_1',
      mensaje: '🌟 ¡Hoy es un nuevo comienzo!',
      tipoProgreso: 'inicio',
      rangoProgreso: { min: 0, max: 20 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_2',
      mensaje: '💪 ¡Tú puedes hacerlo!',
      tipoProgreso: 'inicio',
      rangoProgreso: { min: 0, max: 20 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_3',
      mensaje: '🚀 ¡Comienza ahora mismo!',
      tipoProgreso: 'inicio',
      rangoProgreso: { min: 0, max: 20 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_4',
      mensaje: '✨ Cada paso cuenta',
      tipoProgreso: 'inicio',
      rangoProgreso: { min: 0, max: 20 },
      usado: false,
      fechaCreacion: new Date()
    },
    
    // Bajo (21-40%)
    {
      id: 'backup_5',
      mensaje: '🔄 ¡Sigue adelante!',
      tipoProgreso: 'bajo',
      rangoProgreso: { min: 21, max: 40 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_6',
      mensaje: '🎯 Mantén el enfoque',
      tipoProgreso: 'bajo',
      rangoProgreso: { min: 21, max: 40 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_7',
      mensaje: '💎 Los diamantes se forman bajo presión',
      tipoProgreso: 'bajo',
      rangoProgreso: { min: 21, max: 40 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_8',
      mensaje: '🌱 Estás creciendo cada día',
      tipoProgreso: 'bajo',
      rangoProgreso: { min: 21, max: 40 },
      usado: false,
      fechaCreacion: new Date()
    },
    
    // Medio (41-60%)
    {
      id: 'backup_9',
      mensaje: '📈 ¡Vas por buen camino!',
      tipoProgreso: 'medio',
      rangoProgreso: { min: 41, max: 60 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_10',
      mensaje: '🏃‍♂️ ¡No te detengas ahora!',
      tipoProgreso: 'medio',
      rangoProgreso: { min: 41, max: 60 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_11',
      mensaje: '⚡ ¡Tienes impulso!',
      tipoProgreso: 'medio',
      rangoProgreso: { min: 41, max: 60 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_12',
      mensaje: '🎉 ¡Más de la mitad completado!',
      tipoProgreso: 'medio',
      rangoProgreso: { min: 41, max: 60 },
      usado: false,
      fechaCreacion: new Date()
    },
    
    // Alto (61-80%)
    {
      id: 'backup_13',
      mensaje: '🔥 ¡Estás en racha!',
      tipoProgreso: 'alto',
      rangoProgreso: { min: 61, max: 80 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_14',
      mensaje: '🏆 ¡Casi lo logras!',
      tipoProgreso: 'alto',
      rangoProgreso: { min: 61, max: 80 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_15',
      mensaje: '💯 ¡El final está cerca!',
      tipoProgreso: 'alto',
      rangoProgreso: { min: 61, max: 80 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_16',
      mensaje: '🌟 ¡Eres increíble!',
      tipoProgreso: 'alto',
      rangoProgreso: { min: 61, max: 80 },
      usado: false,
      fechaCreacion: new Date()
    },
    
    // Completado (81-100%)
    {
      id: 'backup_17',
      mensaje: '🎊 ¡Excelente trabajo!',
      tipoProgreso: 'completado',
      rangoProgreso: { min: 81, max: 100 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_18',
      mensaje: '👑 ¡Eres un campeón!',
      tipoProgreso: 'completado',
      rangoProgreso: { min: 81, max: 100 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_19',
      mensaje: '🏅 ¡Objetivo cumplido!',
      tipoProgreso: 'completado',
      rangoProgreso: { min: 81, max: 100 },
      usado: false,
      fechaCreacion: new Date()
    },
    {
      id: 'backup_20',
      mensaje: '✅ ¡Misión completada!',
      tipoProgreso: 'completado',
      rangoProgreso: { min: 81, max: 100 },
      usado: false,
      fechaCreacion: new Date()
    }
  ];

  constructor() {}

  ngOnInit() {
    this.actualizarMensajeMotivacion();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['completionRate'] || changes['currentStreak'] || changes['totalActivities']) {
      this.actualizarMensajeMotivacion();
    }
  }

  actualizarMensajeMotivacion() {
    // Determinar el progreso actual
    const progreso = this.completionRate || 0;
    const tipoProgreso = this.determinarTipoProgreso(progreso);
    
    // Obtener mensaje apropiado
    const mensaje = this.obtenerMensajeMotivacion(tipoProgreso, progreso);
    
    if (mensaje) {
      this.mensajeActual = mensaje.mensaje;
      this.mostrarMensaje = true;
    } else {
      this.mostrarMensaje = false;
    }
  }

  determinarTipoProgreso(progreso: number): 'inicio' | 'bajo' | 'medio' | 'alto' | 'completado' {
    if (progreso <= 20) return 'inicio';
    if (progreso <= 40) return 'bajo';
    if (progreso <= 60) return 'medio';
    if (progreso <= 80) return 'alto';
    return 'completado';
  }

  obtenerMensajeMotivacion(tipoProgreso: string, progreso: number): MensajeMotivacion | null {
    // Filtrar mensajes por tipo de progreso
    const mensajesDisponibles = this.mensajesRespaldo.filter(m => 
      m.tipoProgreso === tipoProgreso && 
      progreso >= m.rangoProgreso.min && 
      progreso <= m.rangoProgreso.max
    );

    if (mensajesDisponibles.length === 0) {
      return null;
    }

    // Seleccionar mensaje aleatorio
    const indiceAleatorio = Math.floor(Math.random() * mensajesDisponibles.length);
    return mensajesDisponibles[indiceAleatorio];
  }

  // Método para obtener contexto adicional basado en la situación del usuario
  obtenerContextoMotivacion(): string {
    const hora = new Date().getHours();
    
    if (this.totalActivities === 0) {
      return '¡Es hora de agregar tu primer hábito!';
    }
    
    if (this.currentStreak === 0) {
      return '¡Comienza una nueva racha hoy!';
    }
    
    if (this.currentStreak >= 7) {
      return `¡Llevas ${this.currentStreak} días consecutivos! 🔥`;
    }
    
    if (hora >= 20 && this.completionRate < 50) {
      return 'Aún tienes tiempo para completar más hábitos hoy';
    }
    
    if (hora >= 6 && hora < 12 && this.completionRate === 0) {
      return '¡Buenos días! Es perfecto momento para comenzar';
    }
    
    return '';
  }

  // Método para obtener color del mensaje basado en el progreso
  obtenerColorMensaje(): string {
    const progreso = this.completionRate || 0;
    
    if (progreso <= 20) return '#ff6b6b'; // Rojo suave
    if (progreso <= 40) return '#ffa726'; // Naranja
    if (progreso <= 60) return '#ffca28'; // Amarillo
    if (progreso <= 80) return '#66bb6a'; // Verde claro
    return '#4caf50'; // Verde
  }

  // Método para obtener ícono basado en el progreso
  obtenerIconoProgreso(): string {
    const progreso = this.completionRate || 0;
    
    if (progreso <= 20) return '🌱';
    if (progreso <= 40) return '🌿';
    if (progreso <= 60) return '🌳';
    if (progreso <= 80) return '⭐';
    return '🏆';
  }

  // Método para refrescar mensaje (llamado desde el template)
  refrescarMensaje() {
    this.actualizarMensajeMotivacion();
  }
}