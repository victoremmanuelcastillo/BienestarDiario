import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NutricionComponent } from './nutricion/nutricion.component';
import { EjercicioComponent } from './ejercicio/ejercicio.component';
import { SuenoComponent } from './sueno/sueno.component';
import { MeditacionComponent } from './meditacion/meditacion.component';
import { HidratacionComponent } from './hidratacion/hidratacion.component';
import { BlogComponent } from './blog/blog.component';
import { ContactoComponent } from './contacto/contacto.component';
import { CargaCSVComponent } from './../assets/csv/cargaCSV1.component';
import { CalculadoraNutricionalComponent } from './nutricion/calculadora-nutricional/calculadora-nutricional.component';
import { GraficasNutricionComponent } from './nutricion/graficas-nutricion/graficas-nutricion.component';
import { RecetasSaludablesComponent } from './nutricion/recetas-saludables/recetas-saludables.component';
import { GraficasComponent } from './graficas/graficas.component';
import { CategoriasComponent } from './ejercicio/categorias/categorias.component';
import { RegistroRutinasComponent } from './ejercicio/registro-rutinas/registro-rutinas.component';
import { RecomendacionesComponent } from './ejercicio/recomendaciones/recomendaciones.component';
import { GraficaEjercicioComponent } from './ejercicio/grafica-ejercicio/grafica-ejercicio.component';
import { BeneficiosComponent } from './sueno/beneficios/beneficios.component';
import { MeditacionGuiadaComponent } from './sueno/meditacion-guiada/meditacion-guiada.component';
import { CategoriasComponent as BlogCategoriasComponent } from './blog/categorias/categorias.component';
import { ComunidadComponent } from './blog/comunidad/comunidad.component';
import { GraficasHabitosComponent } from './dashboard/graficas-habitos/graficas-habitos.component';
import { CalculadoraIMCComponent } from './nutricion/calculadora-imc/calculadora-imc.component';
import { ProgresoComponent } from './progreso/progreso.component';
import { ChatIAComponent } from './chat-ia/chat-ia.component';
import { IntroModalComponent } from './dashboard/intro-habitos/intro-habitos.component';
import { MotivacionComponent } from './dashboard/motivacion/motivacion.component';	
import { ClimaComponent } from './clima/clima.component';
	

export const routes: Routes = [
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [NoAuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard y generales
      { path: 'intro-habitos', component: IntroModalComponent },
      { path: 'motivacion', component: MotivacionComponent },
      { path: 'ChatIA', component: ChatIAComponent},
      { path: 'dashboard', component: DashboardComponent },
      { path: 'graficas-habitos', component: GraficasHabitosComponent},
      { path: 'graficas', component: GraficasComponent },
      { path: 'progreso', component: ProgresoComponent },
      { path: 'clima', component: ClimaComponent },
      
      // Rutas de nutrición
      { path: 'nutricion', component: NutricionComponent },
      { path: 'nutriciongen', component: NutricionComponent },
      { path: 'nutricion/calculadora-nutricional', component: CalculadoraNutricionalComponent },
      { path: 'nutricion/graficas-nutricion', component: GraficasNutricionComponent },
      { path: 'nutricion/recetas-saludables', component: RecetasSaludablesComponent },      
      { path: 'nutricion/calculadora-imc', component: CalculadoraIMCComponent },

      // Rutas de ejercicio
      { path: 'ejercicio', component: EjercicioComponent },
      { path: 'ejercicio/categorias', component: CategoriasComponent },
      { path: 'ejercicio/rutinas', component: RegistroRutinasComponent },
      { path: 'ejercicio/recomendaciones', component: RecomendacionesComponent },
      { path: 'ejercicio/graficas', component: GraficaEjercicioComponent },
      
      // Rutas de sueño
      { path: 'sueno', component: SuenoComponent },
      { path: 'sueno/beneficios', component: BeneficiosComponent },
      { path: 'sueno/meditacion', component: MeditacionGuiadaComponent },
      
      // Rutas de blog
      { path: 'blog', component: BlogComponent },
      { path: 'blog/categorias', component: BlogCategoriasComponent },
      { path: 'blog/comunidad', component: ComunidadComponent },
      
      // Otras rutas
      { path: 'meditacion', component: MeditacionComponent },
      { path: 'hidratacion', component: HidratacionComponent },
      { path: 'contacto', component: ContactoComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'cargaCSV1component', component: CargaCSVComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];