// src/app/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Inicializar con null y luego cargar desde localStorage solo si estamos en el navegador
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('currentUser');
        }
      }
    }
    
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): boolean {
    // En una aplicación real, aquí harías una llamada a la API
    // Por ahora, simulamos un login exitoso
    
    // Simular verificación de credenciales
    if (email === 'usuario@ejemplo.com' && password === 'password123') {
      const user: User = {
        id: '1',
        name: 'Usuario Ejemplo',
        email: email,
        bio: 'Entusiasta de la vida saludable',
        location: 'Ciudad de México',
        preferences: {
          notifications: true,
          darkMode: false,
          language: 'es'
        }
      };
      
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      this.currentUserSubject.next(user);
      return true;
    }
    
    return false;
  }

  register(name: string, email: string, password: string): boolean {
    // En una aplicación real, aquí harías una llamada a la API
    // Por ahora, simulamos un registro exitoso
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9), // ID aleatorio
      name: name,
      email: email,
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'es'
      }
    };
    
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    this.currentUserSubject.next(user);
    return true;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Método para actualizar el perfil del usuario
  updateUserProfile(userData: Partial<User>): void {
    if (!this.currentUserValue) return;
    
    const updatedUser = {
      ...this.currentUserValue,
      ...userData
    };
    
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    this.currentUserSubject.next(updatedUser);
  }
}