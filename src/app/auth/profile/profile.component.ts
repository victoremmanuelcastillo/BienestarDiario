// src/app/auth/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  preferencesForm: FormGroup;
  passwordForm: FormGroup;
  showSuccessMessage = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  activeSection = 'profile-info';
  profileImage: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      bio: [''],
      location: ['']
    });
    
    this.preferencesForm = this.fb.group({
      notifications: [true],
      darkMode: [false],
      language: ['es']
    });
    
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadProfileImage();
    
    // Aplicar modo oscuro si está activado
    this.preferencesForm.get('darkMode')?.valueChanges.subscribe(isDarkMode => {
      this.applyDarkMode(isDarkMode);
    });
  }

  loadUserData(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.profileForm.patchValue({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        location: currentUser.location || ''
      });
      
      // Si hay preferencias guardadas, cargarlas
      if (currentUser.preferences) {
        this.preferencesForm.patchValue(currentUser.preferences);
        
        // Aplicar modo oscuro si está activado
        if (currentUser.preferences.darkMode) {
          this.applyDarkMode(true);
        }
      }
    } else {
      // Si no hay usuario, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  async loadProfileImage(): Promise<void> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;
    
    try {
      // Intentar obtener la URL de avatar del perfil
      const { data, error } = await this.authService.getProfileData(currentUser.id);
      
      if (error) throw error;
      
      if (data && data.avatar_url) {
        this.profileImage = data.avatar_url;
      }
    } catch (error) {
      console.error('Error al cargar imagen de perfil:', error);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    
    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'La imagen no debe superar los 2MB';
      return;
    }
    
    // Validar tipo
    if (!file.type.match('image.*')) {
      this.errorMessage = 'Solo se permiten archivos de imagen';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      // Usar el servicio de autenticación para subir la imagen
      const avatarUrl = await this.authService.uploadProfileImage(file);
      
      if (avatarUrl) {
        this.profileImage = avatarUrl;
        this.showSuccessMessage = true;
        this.successMessage = '¡Foto de perfil actualizada!';
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.successMessage = '';
        }, 3000);
      } else {
        throw new Error('No se pudo obtener la URL de la imagen');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      this.errorMessage = 'Error al subir la imagen. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const userData = this.profileForm.value;
        const success = await this.authService.updateUserProfile(userData);
        
        if (success) {
          this.showSuccessMessage = true;
          this.successMessage = '¡Perfil actualizado correctamente!';
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = 'Error al actualizar el perfil. Por favor, intenta de nuevo.';
        }
      } catch (error) {
        this.errorMessage = 'Error al actualizar el perfil. Por favor, intenta de nuevo.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  async updatePreferences(): Promise<void> {
    if (this.preferencesForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const preferences = this.preferencesForm.value;
        const currentUser = this.authService.currentUserValue;
        
        if (currentUser) {
          const success = await this.authService.updateUserProfile({
            ...currentUser,
            preferences: preferences
          });
          
          if (success) {
            this.showSuccessMessage = true;
            this.successMessage = '¡Preferencias actualizadas correctamente!';
            setTimeout(() => {
              this.showSuccessMessage = false;
              this.successMessage = '';
            }, 3000);
            
            // Aplicar modo oscuro si está activado
            this.applyDarkMode(preferences.darkMode);
          } else {
            this.errorMessage = 'Error al actualizar preferencias. Por favor, intenta de nuevo.';
          }
        }
      } catch (error) {
        this.errorMessage = 'Error al actualizar preferencias. Por favor, intenta de nuevo.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.preferencesForm.markAllAsTouched();
    }
  }

  async updatePassword(): Promise<void> {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const { currentPassword, newPassword } = this.passwordForm.value;
        
        const success = await this.authService.updatePassword(currentPassword, newPassword);
        
        if (success) {
          this.showSuccessMessage = true;
          this.successMessage = '¡Contraseña actualizada correctamente!';
          this.passwordForm.reset();
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = 'Error al actualizar la contraseña. Por favor, verifica tu contraseña actual.';
        }
      } catch (error) {
        this.errorMessage = 'Error al actualizar la contraseña. Por favor, intenta de nuevo.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  applyDarkMode(isDarkMode: boolean): void {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }

  // Getters para validación de formularios
  get nameInvalid() {
    return this.profileForm.get('name')?.invalid && this.profileForm.get('name')?.touched;
  }
  
  get emailInvalid() {
    return this.profileForm.get('email')?.invalid && this.profileForm.get('email')?.touched;
  }
  
  get currentPasswordInvalid() {
    return this.passwordForm.get('currentPassword')?.invalid && this.passwordForm.get('currentPassword')?.touched;
  }
  
  get newPasswordInvalid() {
    return this.passwordForm.get('newPassword')?.invalid && this.passwordForm.get('newPassword')?.touched;
  }
  
  get confirmPasswordInvalid() {
    return (this.passwordForm.get('confirmPassword')?.invalid || this.passwordForm.hasError('passwordMismatch')) && 
           this.passwordForm.get('confirmPassword')?.touched;
  }
}