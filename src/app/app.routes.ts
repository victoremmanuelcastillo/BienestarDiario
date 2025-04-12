import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NutricionComponent } from './nutricion/nutricion.component';
import { EjercicioComponent } from './ejercicio/ejercicio.component';
import { SuenoComponent } from './sueno/sueno.component';
import { MeditacionComponent } from './meditacion/meditacion.component';
import { HidratacionComponent } from './hidratacion/hidratacion.component';
import { BlogComponent } from './blog/blog.component';
import { ContactoComponent } from './contacto/contacto.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'nutricion', component: NutricionComponent },
  { path: 'ejercicio', component: EjercicioComponent },
  { path: 'sueno', component: SuenoComponent },
  { path: 'meditacion', component: MeditacionComponent },
  { path: 'hidratacion', component: HidratacionComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'AuthGuard', canActivate: [AuthGuard], component: LoginComponent },
  { path: 'profile', component: ProfileComponent }
];