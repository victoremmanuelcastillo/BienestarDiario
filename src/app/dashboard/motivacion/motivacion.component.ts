import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { OpenaiService } from '../../services/openai.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface MensajeMotivacion {
  id: string;
  mensaje: string;
  tipoProgreso: 'inicio' | 'bajo' | 'medio' | 'alto' | 'completado';
  rangoProgreso: { min: number; max: number };
  usado: boolean;
  fechaCreacion: Date;
}

interface EstadisticasMotivacion {
  totalActivities: number;
  completedToday: number;
  completionRate: number;
  currentStreak: number;
}

@Component({
  selector: 'app-motivacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motivacion.component.html',
  styleUrls: ['./motivacion.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('400ms ease-out', style({ transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class MotivacionComponent implements OnInit, OnDestroy {
  @Input() stats: EstadisticasMotivacion = {
    totalActivities: 0,
    completedToday: 0,
    completionRate: 0,
    currentStreak: 0
  };

  private destroy$ = new Subject<void>();
  
  mensajeActual: string = '';
  cargando: boolean = false;
  mostrarDetalles: boolean = false;
  tipoMensajeActual: string = '';
  
  private mensajesMotivacion: MensajeMotivacion[] = [];
  private ultimaActualizacionAPI: Date | null = null;

  constructor(private openaiService: OpenaiService) {}

  ngOnInit() {
    // Inicialización rápida
    this.inicializacionRapida();
    
    // Luego verificar y actualizar mensajes en segundo plano
    setTimeout(() => {
      this.verificarYActualizarMensajes();
    }, 500);
  }

  private inicializacionRapida() {
    // Cargar mensajes existentes inmediatamente
    const mensajesGuardados = localStorage.getItem('mensajesMotivacion');
    if (mensajesGuardados) {
      try {
        this.mensajesMotivacion = JSON.parse(mensajesGuardados);
      } catch (error) {
        console.warn('Error al cargar mensajes:', error);
        this.usarMensajesPorDefecto();
      }
    } else {
      this.usarMensajesPorDefecto();
    }
    
    // Seleccionar mensaje inicial inmediatamente
    this.seleccionarMensajeSegunProgreso();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async verificarYActualizarMensajes() {
    const mensajesGuardados = localStorage.getItem('mensajesMotivacion');
    const fechaUltimaActualizacion = localStorage.getItem('ultimaActualizacionMotivacion');
    
    if (mensajesGuardados) {
      try {
        this.mensajesMotivacion = JSON.parse(mensajesGuardados).map((m: any) => ({
          ...m,
          fechaCreacion: new Date(m.fechaCreacion)
        }));
      } catch (error) {
        console.warn('Error al cargar mensajes guardados:', error);
        this.mensajesMotivacion = [];
      }
    }

    if (fechaUltimaActualizacion) {
      this.ultimaActualizacionAPI = new Date(fechaUltimaActualizacion);
    }

    // Verificar si necesita actualizar (más de 30 días o menos de 5 mensajes)
    const ahora = new Date();
    const diasDesdeActualizacion = this.ultimaActualizacionAPI ? 
      Math.floor((ahora.getTime() - this.ultimaActualizacionAPI.getTime()) / (30 * 24 * 60 * 60 * 1000)) : 999;
    
    const necesitaActualizar = diasDesdeActualizacion >= 30 || this.mensajesMotivacion.length < 5;

    if (necesitaActualizar) {
      console.log('🔄 Actualizando mensajes motivacionales...');
      // Usar timeout para no bloquear la UI
      setTimeout(() => this.generarNuevosMensajes(), 1000);
    } else {
      console.log(`✅ Mensajes cargados: ${this.mensajesMotivacion.length}, próxima actualización en ${30 - diasDesdeActualizacion} días`);
    }
  }

  private async generarNuevosMensajes() {
    this.cargando = true;
    
    try {
      const prompt = `Genera exactamente 20 mensajes motivacionales para usuarios que necesitan APOYO EXTRA y tienen dificultades con sus hábitos.

IMPORTANTE: Responde ÚNICAMENTE con JSON válido, sin markdown ni explicaciones.

Formato requerido:
{
  "mensajes": [
    {"mensaje": "¡No te rindas! Cada nuevo intento es una victoria!", "tipo": "inicio", "progreso_min": 0, "progreso_max": 20},
    {"mensaje": "¡Los obstáculos son oportunidades disfrazadas!", "tipo": "bajo", "progreso_min": 21, "progreso_max": 40}
  ]
}

Contexto: Los usuarios que ven este componente están pasando por dificultades:
- No han completado sus hábitos del día
- Tienen una racha baja (menos de 3 días)
- Es tarde y tienen poco progreso
- Necesitan motivación extra para no rendirse

Categorías necesarias:
- 4 mensajes "inicio" (0-20%): Para cuando no han empezado o abandonaron
- 4 mensajes "bajo" (21-40%): Para cuando luchan por mantener impulso
- 4 mensajes "medio" (41-60%): Para superar la barrera psicológica
- 4 mensajes "alto" (61-80%): Para el empujón final cuando están cerca
- 4 mensajes "completado" (81-100%): Para celebrar y mantener momentum

Tono: Empático, comprensivo, sin juzgar, que inspire acción inmediata.
Máximo 50 caracteres por mensaje.`;


      const response = await this.openaiService.getChatResponse([
        { role: 'user', content: prompt }
      ]).toPromise();

      let contenido = response.choices[0].message.content.trim();
      
      // Limpiar markdown si está presente
      contenido = this.limpiarRespuestaAPI(contenido);
      
      console.log('Respuesta limpia de API:', contenido);
      
      const datos = JSON.parse(contenido);
      
      // Validar estructura
      if (!datos.mensajes || !Array.isArray(datos.mensajes) || datos.mensajes.length === 0) {
        throw new Error('Estructura de respuesta inválida');
      }
      
      // Procesar y guardar mensajes
      this.mensajesMotivacion = datos.mensajes.map((m: any, index: number) => ({
        id: `msg_${Date.now()}_${index}`,
        mensaje: m.mensaje || `Mensaje motivacional ${index + 1}`,
        tipoProgreso: this.normalizarTipoProgreso(m.tipo),
        rangoProgreso: { min: m.progreso_min || 0, max: m.progreso_max || 100 },
        usado: false,
        fechaCreacion: new Date()
      }));

      // Validar que tenemos mensajes de todos los tipos
      if (this.mensajesMotivacion.length < 5) {
        console.warn('Pocos mensajes generados, usando respaldo');
        this.completarConMensajesRespaldo();
      }

      // Guardar en localStorage
      localStorage.setItem('mensajesMotivacion', JSON.stringify(this.mensajesMotivacion));
      localStorage.setItem('ultimaActualizacionMotivacion', new Date().toISOString());
      
      this.ultimaActualizacionAPI = new Date();
      console.log(`✅ ${this.mensajesMotivacion.length} mensajes generados exitosamente`);
      
    } catch (error) {
      console.error('Error al generar mensajes de motivación:', error);
      this.usarMensajesPorDefecto();
    }
    
    this.cargando = false;
  }

  private limpiarRespuestaAPI(contenido: string): string {
    // Remover markdown si está presente
    contenido = contenido.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    
    // Remover cualquier texto antes del primer {
    const inicioJSON = contenido.indexOf('{');
    if (inicioJSON > 0) {
      contenido = contenido.substring(inicioJSON);
    }
    
    // Remover cualquier texto después del último }
    const finJSON = contenido.lastIndexOf('}');
    if (finJSON > -1 && finJSON < contenido.length - 1) {
      contenido = contenido.substring(0, finJSON + 1);
    }
    
    return contenido.trim();
  }

  private normalizarTipoProgreso(tipo: string): MensajeMotivacion['tipoProgreso'] {
    const tipoLower = tipo?.toLowerCase() || '';
    
    if (tipoLower.includes('inicio') || tipoLower.includes('empez')) return 'inicio';
    if (tipoLower.includes('bajo') || tipoLower.includes('poco')) return 'bajo';
    if (tipoLower.includes('medio') || tipoLower.includes('mitad')) return 'medio';
    if (tipoLower.includes('alto') || tipoLower.includes('casi')) return 'alto';
    if (tipoLower.includes('completado') || tipoLower.includes('completo')) return 'completado';
    
    return 'inicio'; // Fallback a tipo válido
  }

  private completarConMensajesRespaldo() {
    const tiposNecesarios: MensajeMotivacion['tipoProgreso'][] = ['inicio', 'bajo', 'medio', 'alto', 'completado'];
    
    tiposNecesarios.forEach(tipo => {
      const existesTipo = this.mensajesMotivacion.some(m => m.tipoProgreso === tipo);
      if (!existesTipo) {
        const mensaje = this.obtenerMensajeRespaldo(tipo);
        this.mensajesMotivacion.push({
          id: `backup_${tipo}_${Date.now()}`,
          mensaje: mensaje.mensaje,
          tipoProgreso: tipo,
          rangoProgreso: mensaje.rango,
          usado: false,
          fechaCreacion: new Date()
        });
      }
    });
  }

  private obtenerMensajeRespaldo(tipo: MensajeMotivacion['tipoProgreso']) {
    const mensajesRespaldo: Record<MensajeMotivacion['tipoProgreso'], { mensaje: string; rango: { min: number; max: number } }> = {
      inicio: { mensaje: '¡Hoy es el día perfecto para empezar!', rango: { min: 0, max: 20 } },
      bajo: { mensaje: '¡Cada paso cuenta! Sigue adelante.', rango: { min: 21, max: 40 } },
      medio: { mensaje: '¡Vas por la mitad! La constancia es clave.', rango: { min: 41, max: 60 } },
      alto: { mensaje: '¡Casi lo logras! Un empujón más.', rango: { min: 61, max: 80 } },
      completado: { mensaje: '🎉 ¡Increíble! Has completado todo.', rango: { min: 81, max: 100 } }
    };
    
    return mensajesRespaldo[tipo] || mensajesRespaldo.inicio;
  }

  private usarMensajesPorDefecto() {
    this.mensajesMotivacion = [
      {
        id: 'default_1',
        mensaje: '¡Cada gran viaje comienza con un solo paso! Hoy es tu día para empezar.',
        tipoProgreso: 'inicio',
        rangoProgreso: { min: 0, max: 20 },
        usado: false,
        fechaCreacion: new Date()
      },
      {
        id: 'default_2',
        mensaje: '¡Vas por buen camino! Los pequeños progresos suman grandes resultados.',
        tipoProgreso: 'bajo',
        rangoProgreso: { min: 21, max: 40 },
        usado: false,
        fechaCreacion: new Date()
      },
      {
        id: 'default_3',
        mensaje: '¡Estás en la mitad del camino! La constancia es tu mejor aliada.',
        tipoProgreso: 'medio',
        rangoProgreso: { min: 41, max: 60 },
        usado: false,
        fechaCreacion: new Date()
      },
      {
        id: 'default_4',
        mensaje: '¡Excelente progreso! Estás muy cerca de completar tus metas del día.',
        tipoProgreso: 'alto',
        rangoProgreso: { min: 61, max: 80 },
        usado: false,
        fechaCreacion: new Date()
      },
      {
        id: 'default_5',
        mensaje: '🎉 ¡Increíble! Has completado tus hábitos. Eres una inspiración.',
        tipoProgreso: 'completado',
        rangoProgreso: { min: 81, max: 100 },
        usado: false,
        fechaCreacion: new Date()
      }
    ];
  }

  private seleccionarMensajeSegunProgreso() {
    // Si no hay mensajes, usar uno por defecto inmediatamente
    if (this.mensajesMotivacion.length === 0) {
      this.usarMensajesPorDefecto();
    }

    const progreso = this.stats.completionRate;
    const ahora = new Date();
    const horaActual = ahora.getHours();
    
    let tipoProgreso: MensajeMotivacion['tipoProgreso'];
    let contextoEspecial = '';

    // Determinar contexto especial basado en problemas del usuario
    if (this.stats.totalActivities === 0) {
      tipoProgreso = 'inicio';
      contextoEspecial = 'sin_actividades';
    } else if (horaActual >= 18 && progreso < 50) {
      tipoProgreso = 'bajo';
      contextoEspecial = 'tarde_bajo_progreso';
    } else if (horaActual >= 15 && progreso < 25) {
      tipoProgreso = 'inicio';
      contextoEspecial = 'dia_avanzado_sin_progreso';
    } else if (this.stats.currentStreak < 3 && this.stats.totalActivities > 0) {
      tipoProgreso = this.determinarTipoSegunProgreso(progreso);
      contextoEspecial = 'racha_baja';
    } else {
      tipoProgreso = this.determinarTipoSegunProgreso(progreso);
    }

    // Seleccionar mensaje apropiado
    this.seleccionarMensajeConContexto(tipoProgreso, contextoEspecial);
  }

  private determinarTipoSegunProgreso(progreso: number): MensajeMotivacion['tipoProgreso'] {
    if (progreso <= 20) return 'inicio';
    if (progreso <= 40) return 'bajo';
    if (progreso <= 60) return 'medio';
    if (progreso <= 80) return 'alto';
    return 'completado';
  }

  private seleccionarMensajeConContexto(tipoProgreso: MensajeMotivacion['tipoProgreso'], contexto: string) {
    // Buscar mensajes del tipo correspondiente que no hayan sido usados
    let mensajesCandidatos = this.mensajesMotivacion.filter(m => 
      m.tipoProgreso === tipoProgreso && !m.usado
    );

    // Si no hay mensajes sin usar de este tipo, resetear y buscar de nuevo
    if (mensajesCandidatos.length === 0) {
      this.mensajesMotivacion.forEach(m => {
        if (m.tipoProgreso === tipoProgreso) {
          m.usado = false;
        }
      });
      mensajesCandidatos = this.mensajesMotivacion.filter(m => m.tipoProgreso === tipoProgreso);
    }

    // Seleccionar mensaje apropiado según contexto
    if (mensajesCandidatos.length > 0) {
      const mensajeSeleccionado = mensajesCandidatos[Math.floor(Math.random() * mensajesCandidatos.length)];
      this.mensajeActual = this.adaptarMensajeAlContexto(mensajeSeleccionado.mensaje, contexto);
      this.tipoMensajeActual = this.getTipoMensajeTexto(tipoProgreso);
      
      // Marcar como usado
      mensajeSeleccionado.usado = true;
      this.guardarMensajes();
    } else {
      // Mensaje por contexto específico
      this.mensajeActual = this.obtenerMensajeContextual(contexto, tipoProgreso);
      this.tipoMensajeActual = this.getTipoMensajeTexto(tipoProgreso);
    }
  }

  private adaptarMensajeAlContexto(mensaje: string, contexto: string): string {
    const adaptaciones = {
      'sin_actividades': '¡Es momento de crear tu primer hábito del día!',
      'tarde_bajo_progreso': '¡Aún tienes tiempo! Un pequeño esfuerzo marca la diferencia.',
      'dia_avanzado_sin_progreso': '¡No te rindas! Cada momento es una nueva oportunidad.',
      'racha_baja': '¡Construyamos una nueva racha juntos! Paso a paso.'
    };

    return adaptaciones[contexto as keyof typeof adaptaciones] || mensaje;
  }

  private obtenerMensajeContextual(contexto: string, tipo: MensajeMotivacion['tipoProgreso']): string {
    const mensajesContextuales = {
      'sin_actividades': '🌟 ¡Comienza tu día con el primer hábito saludable!',
      'tarde_bajo_progreso': '⏰ ¡Todavía puedes lograr mucho antes de que termine el día!',
      'dia_avanzado_sin_progreso': '💪 ¡Es hora de ponerse en acción! Cada minuto cuenta.',
      'racha_baja': '🔥 ¡Construyamos una racha increíble empezando hoy!'
    };

    return mensajesContextuales[contexto as keyof typeof mensajesContextuales] || this.obtenerMensajeFallback(this.stats.completionRate);
  }

  private obtenerMensajeFallback(progreso: number): string {
    if (progreso === 0) return '🌟 ¡Es hora de comenzar tu día saludable!';
    if (progreso <= 25) return '💪 ¡Sigue adelante, cada paso cuenta!';
    if (progreso <= 50) return '🎯 ¡Vas por buen camino, mantén el ritmo!';
    if (progreso <= 75) return '🔥 ¡Excelente progreso, casi lo logras!';
    if (progreso < 100) return '⭐ ¡Un último esfuerzo para completar el día!';
    return '🎉 ¡Fantástico! Has completado todas tus metas.';
  }

  private getTipoMensajeTexto(tipo: MensajeMotivacion['tipoProgreso']): string {
    switch (tipo) {
      case 'inicio': return 'Comenzando';
      case 'bajo': return 'En progreso';
      case 'medio': return 'A mitad de camino';
      case 'alto': return 'Casi completo';
      case 'completado': return '¡Completado!';
      default: return 'Motivación';
    }
  }

  private guardarMensajes() {
    localStorage.setItem('mensajesMotivacion', JSON.stringify(this.mensajesMotivacion));
  }

  // Método público para actualizar el mensaje cuando cambien las stats
  actualizarMensaje() {
    this.seleccionarMensajeSegunProgreso();
  }

  // Método para forzar actualización de mensajes
  async forzarActualizacion() {
    await this.generarNuevosMensajes();
    this.seleccionarMensajeSegunProgreso();
  }

  toggleDetalles() {
    this.mostrarDetalles = !this.mostrarDetalles;
  }

  // Método para obtener un mensaje motivacional específico
  obtenerMensajePersonalizado(tipoSolicitado?: MensajeMotivacion['tipoProgreso']): string {
    const tipo = tipoSolicitado || this.determinarTipoProgreso();
    const mensajes = this.mensajesMotivacion.filter(m => m.tipoProgreso === tipo);
    
    if (mensajes.length > 0) {
      const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
      return mensajeAleatorio.mensaje;
    }
    
    return this.mensajeActual;
  }

  private determinarTipoProgreso(): MensajeMotivacion['tipoProgreso'] {
    const progreso = this.stats.completionRate;
    if (progreso <= 20) return 'inicio';
    if (progreso <= 40) return 'bajo';
    if (progreso <= 60) return 'medio';
    if (progreso <= 80) return 'alto';
    return 'completado';
  }

  // Método para obtener estadísticas de motivación
  getEstadisticasMotivacion() {
    const totalMensajes = this.mensajesMotivacion.length;
    const mensajesUsados = this.mensajesMotivacion.filter(m => m.usado).length;
    const diasDesdeActualizacion = this.ultimaActualizacionAPI ? 
      Math.floor((new Date().getTime() - this.ultimaActualizacionAPI.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      totalMensajes,
      mensajesUsados,
      mensajesDisponibles: totalMensajes - mensajesUsados,
      diasDesdeActualizacion,
      proximaActualizacion: 30 - diasDesdeActualizacion
    };
  }

  // Método helper para normalizar el tipo de mensaje para CSS
  getNormalizedType(): string {
    return this.tipoMensajeActual.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z]/g, '')
      .replace('comenzando', 'inicio')
      .replace('enprogreso', 'bajo')
      .replace('amitaddecamino', 'medio')
      .replace('casicompleto', 'alto')
      .replace('completado', 'completado');
  }
}