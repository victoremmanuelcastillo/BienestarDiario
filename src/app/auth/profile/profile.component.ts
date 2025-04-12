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
  showSuccessMessage = false;
  
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
  }

  ngOnInit(): void {
    this.loadUserData();
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
      }
    } else {
      // Si no hay usuario, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const userData = this.profileForm.value;
      this.authService.updateUserProfile(userData);
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  updatePreferences(): void {
    if (this.preferencesForm.valid) {
      const preferences = this.preferencesForm.value;
      const currentUser = this.authService.currentUserValue;
      
      if (currentUser) {
        this.authService.updateUserProfile({
          ...currentUser,
          preferences: preferences
        });
        
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      }
    }
  }

  // Getters para validación de formularios
  get nameInvalid() {
    return this.profileForm.get('name')?.invalid && this.profileForm.get('name')?.touched;
  }
  
  get emailInvalid() {
    return this.profileForm.get('email')?.invalid && this.profileForm.get('email')?.touched;
  }
}