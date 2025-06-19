// src/app/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
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
  private supabase: SupabaseClient;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Inicializar el BehaviorSubject primero
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    
    // Inicializar Supabase solo en el navegador
    if (this.isBrowser) {
      this.supabase = createClient(
        'https://vmnqgoocxtsukzhkscus.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbnFnb29jeHRzdWt6aGtzY3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODAxMDQsImV4cCI6MjA2MzQ1NjEwNH0.IOFYghGOaOJYRHv9vWGIjfuG5d2HXltKg36BiwfcJk4'
      );
      
      // Cargar usuario desde localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('currentUser');
        }
      }
      
      // Verificar sesión al iniciar
      this.checkSession();
    } else {
      // Crear un cliente vacío para SSR
      this.supabase = {} as SupabaseClient;
    }
    
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      // Solo usar Supabase en el navegador
      if (this.isBrowser) {
        // Primero intentamos autenticar con Supabase
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password
        });
      
        if (error) {
          console.error('Error de Supabase:', error);
        } else {
          // Si la autenticación con Supabase es exitosa
          // Obtener datos del perfil
          const { data: profileData, error: profileError } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
      
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error al obtener perfil:', profileError);
          }
      
          // Crear objeto de usuario
          const user: User = {
            id: data.user.id,
            name: profileData?.name || data.user.email?.split('@')[0] || 'Usuario',
            email: data.user.email || '',
            bio: profileData?.bio || '',
            location: profileData?.location || '',
            avatar_url: profileData?.avatar_url || '',
            preferences: profileData?.preferences || {
              notifications: true,
              darkMode: false,
              language: 'es'
            }
          };
      
          // Guardar en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          this.currentUserSubject.next(user);
          
          // Redirigir al home
          this.router.navigate(['/dashboard']);
          
          return true;
        }
      }
      
      // Fallback a autenticación local
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
        
        // Redirigir al home
        this.router.navigate(['/']);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  async register(name: string, email: string, password: string): Promise<boolean> {
    try {
      // Solo usar Supabase en el navegador
      if (this.isBrowser) {
        console.log('Intentando registrar usuario en Supabase...', { email, name });
        
        // Registrar con Supabase con autoconfirmación
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            },
            emailRedirectTo: window.location.origin, // Para redirección después de verificación
          }
        });
      
        console.log('Respuesta de registro:', data, error);
      
        if (error) {
          console.error('Error de registro en Supabase:', error);
          return false;
        } 
        
        console.log('Usuario registrado exitosamente en Supabase:', data);
        
        // Crear objeto de usuario
        const user: User = {
          id: data.user?.id || '',
          name,
          email,
          preferences: {
            notifications: true,
            darkMode: false,
            language: 'es'
          }
        };
        
        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        this.currentUserSubject.next(user);
        
        // Intentar crear el perfil después de un registro exitoso
        if (data.user?.id) {
          try {
            console.log('Intentando crear perfil en Supabase para usuario ID:', data.user.id);
            
            // Insertar directamente sin verificar si existe
            const { data: insertData, error: insertError } = await this.supabase
              .from('profiles')
              .insert([
                { 
                  id: data.user.id, 
                  name, 
                  email,
                  preferences: {
                    notifications: true,
                    darkMode: false,
                    language: 'es'
                  }
                }
              ]);
          
            console.log('Resultado de inserción de perfil:', insertData, insertError);
            
            if (insertError) {
              console.error('Error al crear perfil:', insertError);
              
              // Si falla la inserción, intentar una actualización (upsert)
              console.log('Intentando upsert...');
              const { data: upsertData, error: upsertError } = await this.supabase
                .from('profiles')
                .upsert([
                  { 
                    id: data.user.id, 
                    name, 
                    email,
                    preferences: {
                      notifications: true,
                      darkMode: false,
                      language: 'es'
                    }
                  }
                ]);
              
              console.log('Resultado de upsert:', upsertData, upsertError);
              
              if (upsertError) {
                console.error('Error en upsert:', upsertError);
              } else {
                console.log('Perfil creado/actualizado exitosamente mediante upsert');
              }
            } else {
              console.log('Perfil creado exitosamente en Supabase');
            }
          } catch (profileError) {
            console.error('Error al gestionar perfil:', profileError);
          }
        }
        
        // Redirigir al home
        this.router.navigate(['/dashboard']);
        
        return true;
      }
      
      // Fallback o si no estamos en el navegador
      console.log('Usando fallback para registro local');
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
      
      // Redirigir al home
      this.router.navigate(['/']);
      
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    // Cerrar sesión en Supabase solo en el navegador
    if (this.isBrowser) {
      try {
        await this.supabase.auth.signOut();
      } catch (error) {
        console.error('Error al cerrar sesión en Supabase:', error);
      }
      
      // Limpiar localStorage
      localStorage.removeItem('currentUser');
    }
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Método para obtener datos del perfil
  async getProfileData(userId: string) {
    if (!this.isBrowser) return { data: null, error: new Error('No estamos en el navegador') };
    
    return await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  }

  // Método para subir imagen de perfil
  async uploadProfileImage(file: File): Promise<string | null> {
    if (!this.isBrowser || !this.currentUserValue) return null;
    
    try {
      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${this.currentUserValue.id}/${fileName}`;
      
      // Verificar si existe el bucket, si no, crearlo
      const { data: buckets } = await this.supabase.storage.listBuckets();
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarBucketExists) {
        console.log('Creando bucket de avatars...');
        await this.supabase.storage.createBucket('avatars', {
          public: true
        });
      }
      
      // Subir archivo
      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Obtener URL pública
      const { data } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      // Actualizar perfil con nueva URL
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', this.currentUserValue.id);
      
      if (updateError) throw updateError;
      
      // Actualizar usuario en memoria y localStorage
      const updatedUser = {
        ...this.currentUserValue,
        avatar_url: avatarUrl
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      
      return avatarUrl;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      return null;
    }
  }

  // Método para actualizar el perfil del usuario
  async updateUserProfile(userData: Partial<User>): Promise<boolean> {
    if (!this.currentUserValue) return false;
    
    try {
      // Actualizar en Supabase solo en el navegador
      if (this.isBrowser) {
        const { error } = await this.supabase
          .from('profiles')
          .update({
            name: userData.name,
            bio: userData.bio,
            location: userData.location,
            preferences: userData.preferences || this.currentUserValue.preferences
          })
          .eq('id', this.currentUserValue.id);

        if (error) {
          console.error('Error al actualizar perfil en Supabase:', error);
          return false;
        }
      }

      // Actualizar en memoria y localStorage (siempre, incluso si Supabase falla)
      const updatedUser = {
        ...this.currentUserValue,
        ...userData
      };
      
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      this.currentUserSubject.next(updatedUser);
      return true;
    } catch (error) {
      console.error('Error en actualización de perfil:', error);
      return false;
    }
  }

  // Método para cambiar la contraseña
  async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.isBrowser) return false;
    
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error al actualizar contraseña:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      return false;
    }
  }

  // Método para verificar la sesión actual en Supabase
  async checkSession(): Promise<boolean> {
    if (!this.isBrowser) return false;
    
    try {
      const { data, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Error al verificar sesión:', error);
        return false;
      }
      
      if (data.session) {
        // Si hay sesión en Supabase pero no en memoria, recuperar datos
        if (!this.currentUserValue) {
          const { data: profileData } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          
          const user: User = {
            id: data.session.user.id,
            name: profileData?.name || data.session.user.email?.split('@')[0] || 'Usuario',
            email: data.session.user.email || '',
            bio: profileData?.bio || '',
            location: profileData?.location || '',
            avatar_url: profileData?.avatar_url || '',
            preferences: profileData?.preferences || {
              notifications: true,
              darkMode: false,
              language: 'es'
            }
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          this.currentUserSubject.next(user);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      return false;
    }
  }
}