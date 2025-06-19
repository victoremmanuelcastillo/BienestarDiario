import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      // Verificar que email y password no sean undefined
      if (email && password) {
        this.isLoading = true;
        this.errorMessage = '';
        
        try {
          const success = await this.authService.login(email, password);
          
          if (!success) {
            this.errorMessage = 'Credenciales inválidas. Por favor, intenta de nuevo.';
          }
          // No es necesario redirigir aquí, ya que el servicio lo hace automáticamente
        } catch (error) {
          this.errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}