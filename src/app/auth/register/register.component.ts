import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      
      // Verificar que los valores no sean undefined
      if (name && email && password) {
        this.isLoading = true;
        this.errorMessage = '';
        
        try {
          const success = await this.authService.register(name, email, password);
          
          if (success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Error al registrar usuario. Por favor, intenta de nuevo.';
          }
        } catch (error) {
          this.errorMessage = 'Error al registrar usuario. Por favor, intenta de nuevo.';
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}