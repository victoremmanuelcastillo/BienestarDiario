import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenaiService } from '../services/openai.service';
import { FormsModule } from '@angular/forms';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatTab {
  id: string;
  name: string;
  messages: Message[];
  isActive: boolean;
}

@Component({
  standalone: true,
  selector: 'app-chat-ia',
  templateUrl: './chat-ia.component.html',
  styleUrls: ['./chat-ia.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ChatIAComponent {
  userMessage = '';
  chatTabs: ChatTab[] = [];
  activeTabId = '';
  isLoading = false;
  nextTabNumber = 1;

  constructor(private openaiService: OpenaiService) {
    this.loadChatsFromStorage();
    if (this.chatTabs.length === 0) {
      this.createNewChat();
    }
  }

  createNewChat() {
    const newTab: ChatTab = {
      id: `chat-${Date.now()}`,
      name: `Chat ${this.nextTabNumber}`,
      messages: [],
      isActive: true
    };

    // Desactivar otras pestañas
    this.chatTabs.forEach(tab => tab.isActive = false);
    
    this.chatTabs.push(newTab);
    this.activeTabId = newTab.id;
    this.nextTabNumber++;
    this.saveChatsToStorage();
  }

  selectTab(tabId: string) {
    this.chatTabs.forEach(tab => {
      tab.isActive = tab.id === tabId;
    });
    this.activeTabId = tabId;
    this.saveChatsToStorage();
  }

  deleteTab(tabId: string, event: Event) {
    event.stopPropagation();
    
    if (this.chatTabs.length === 1) {
      // Si solo hay una pestaña, limpiar mensajes en lugar de eliminar
      const tab = this.chatTabs.find(t => t.id === tabId);
      if (tab) {
        tab.messages = [];
        this.saveChatsToStorage();
      }
      return;
    }

    const tabIndex = this.chatTabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      const wasActive = this.chatTabs[tabIndex].isActive;
      this.chatTabs.splice(tabIndex, 1);
      
      if (wasActive && this.chatTabs.length > 0) {
        // Activar la pestaña anterior o la primera disponible
        const newActiveIndex = Math.max(0, tabIndex - 1);
        this.chatTabs[newActiveIndex].isActive = true;
        this.activeTabId = this.chatTabs[newActiveIndex].id;
      }
      
      this.saveChatsToStorage();
    }
  }

  renameTab(tabId: string, newName: string) {
    const tab = this.chatTabs.find(t => t.id === tabId);
    if (tab && newName.trim()) {
      tab.name = newName.trim();
      this.saveChatsToStorage();
    }
  }

  onTabNameBlur(tabId: string, event: Event) {
    const target = event.target as HTMLElement;
    const newName = target.textContent || '';
    this.renameTab(tabId, newName);
  }

  onTabNameEnter(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    target.blur();
  }

  get activeTab(): ChatTab | undefined {
    return this.chatTabs.find(tab => tab.isActive);
  }

  get activeMessages(): Message[] {
    return this.activeTab?.messages || [];
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) return;

    const activeTab = this.activeTab;
    if (!activeTab) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      role: 'user',
      content: this.userMessage.trim(),
      timestamp: new Date()
    };

    activeTab.messages.push(userMessage);
    const messageToSend = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    // Preparar mensajes para la API (formato OpenAI)
    const apiMessages = activeTab.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    this.openaiService.getChatResponse(apiMessages).subscribe(
      (res) => {
        const aiResponse: Message = {
          role: 'assistant',
          content: res.choices[0].message.content,
          timestamp: new Date()
        };
        
        activeTab.messages.push(aiResponse);
        this.isLoading = false;
        this.saveChatsToStorage();
        this.scrollToBottom();
      },
      (error) => {
        console.error('Error al obtener respuesta de la IA', error);
        this.isLoading = false;
        
        // Agregar mensaje de error
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
          timestamp: new Date()
        };
        activeTab.messages.push(errorMessage);
        this.saveChatsToStorage();
      }
    );

    this.saveChatsToStorage();
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  private saveChatsToStorage() {
    try {
      const chatsData = {
        chatTabs: this.chatTabs,
        nextTabNumber: this.nextTabNumber,
        activeTabId: this.activeTabId
      };
      localStorage.setItem('chatIA_data', JSON.stringify(chatsData));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  private loadChatsFromStorage() {
    try {
      const savedData = localStorage.getItem('chatIA_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.chatTabs = data.chatTabs || [];
        this.nextTabNumber = data.nextTabNumber || 1;
        this.activeTabId = data.activeTabId || '';
        
        // Convertir timestamps de string a Date
        this.chatTabs.forEach(tab => {
          tab.messages.forEach(msg => {
            if (typeof msg.timestamp === 'string') {
              msg.timestamp = new Date(msg.timestamp);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
      this.chatTabs = [];
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatMessage(content: string): string {
    if (!content) return '';
    
    // Escape HTML para seguridad
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // Convertir saltos de línea
    formatted = formatted.replace(/\n/g, '<br>');

    // Formatear texto en negrita (**texto**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Formatear texto en cursiva (*texto*)
    formatted = formatted.replace(/(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g, '<em>$1</em>');

    // Formatear listas con viñetas (líneas que empiecen con - o •)
    formatted = formatted.replace(/^[-•]\s*(.+)$/gm, '<li>$1</li>');
    
    // Envolver elementos de lista en <ul>
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
      // Limpiar múltiples <ul> consecutivos
      formatted = formatted.replace(/<\/ul>\s*<ul>/g, '');
    }

    // Formatear números de lista (1. texto, 2. texto, etc.)
    formatted = formatted.replace(/^(\d+\.)\s*(.+)$/gm, '<div class="numbered-item"><span class="number">$1</span> $2</div>');

    // Formatear emojis destacados al inicio (conservar los emojis originales)
    formatted = formatted.replace(/^([🌟💥🔥💪🚀⭐️✨🎯💡📈🏆🎉]+)\s*/gm, '<span class="emoji-highlight">$1</span> ');

    // Formatear frases motivacionales entre comillas
    formatted = formatted.replace(/"([^"]+)"/g, '<span class="quote">"$1"</span>');

    // Separar párrafos (doble salto de línea)
    formatted = formatted.replace(/(<br>\s*){2,}/g, '</p><p>');
    
    // Envolver en párrafos si no hay etiquetas de bloque
    if (!formatted.includes('<ul>') && !formatted.includes('<div class="numbered-item">')) {
      formatted = `<p>${formatted}</p>`;
    }

    return formatted;
  }
}