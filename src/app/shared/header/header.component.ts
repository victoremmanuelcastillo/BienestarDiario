import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  menuActive = false;
  activeDropdown: string | null = null;
  currentSection: string = 'inicio'; // Sección activa actual
  isScrolled = false; // Estado del scroll
  private lastScrollTop = 0; // Última posición del scroll
  private userSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  // Configuración de las secciones y sus subelementos
  sectionConfig = {
    inicio: [
      { label: 'Dashboard', route: '/', isDefault: true },
      { label: 'Gráficas de Hábitos', route: '/graficas-habitos' },
      { label: 'Motivación', route: '/motivacion' },
      { label: 'Chat IA', route: '/ChatIA' },
    ],
    nutricion: [
      { label: 'Nutrición', route: '/nutricion', isDefault: true },
      { label: 'Calculadora IMC', route: '/nutricion/calculadora-imc' },
      { label: 'Recetas Saludables', route: '/nutricion/recetas-saludables' },
      { label: 'Calculadora Nutricional', route: '/nutricion/calculadora-nutricional' },
      { label: 'Gráficas', route: '/nutricion/graficas-nutricion' },
      { label: 'Chat IA', route: '/ChatIA' }
    ],
    ejercicio: [
      { label: 'Categorías', route: '/ejercicio/categorias', isDefault: true },
      { label: 'Mis Rutinas', route: '/ejercicio/rutinas' },
      { label: 'Recomendaciones', route: '/ejercicio/recomendaciones' },
      { label: 'Gráficas', route: '/ejercicio/graficas' }
    ]
  };
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    // Suscribirse a los cambios de ruta para determinar la sección activa
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateCurrentSection(event.url);
      });

    // Establecer sección inicial
    this.updateCurrentSection(this.router.url);
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Determinar la sección actual basada en la URL
  private updateCurrentSection(url: string): void {
    // Remover console.logs que pueden causar problemas
    let newSection = 'inicio'; // Por defecto
    
    if (url.startsWith('/nutricion')) {
      newSection = 'nutricion';
    } else if (url.startsWith('/ejercicio')) {
      newSection = 'ejercicio';
    } else if (url.startsWith('/sueno')) {
      newSection = 'sueno';
    } else if (url.startsWith('/blog')) {
      newSection = 'blog';
    } else if (url.startsWith('/progreso')) {
      newSection = 'progreso';
    }
    
    // Solo actualizar si realmente cambió
    if (this.currentSection !== newSection) {
      this.currentSection = newSection;
    }
  }

  // Obtener los subelementos de la sección actual
  getCurrentSectionItems() {
    return this.sectionConfig[this.currentSection as keyof typeof this.sectionConfig] || [];
  }

  // Navegar a una sección específica
  navigateToSection(section: string): void {
    const sectionItems = this.sectionConfig[section as keyof typeof this.sectionConfig];
    if (sectionItems && sectionItems.length > 0) {
      const defaultItem = sectionItems.find(item => item.isDefault) || sectionItems[0];
      this.router.navigate([defaultItem.route]);
    }
    this.activeDropdown = null;
    this.menuActive = false;
  }

  toggleMenu(): void {
    this.menuActive = !this.menuActive;
    if (!this.menuActive) {
      this.activeDropdown = null;
    }
  }

  toggleDropdown(dropdown: string): void {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Solo cambiar estado cuando hay una diferencia clara
    if (scrollTop <= 10) {
      // Solo mostrar cuando está realmente en el tope (0-10px)
      if (this.isScrolled) {
        this.isScrolled = false;
      }
    } else if (scrollTop > 50) {
      // Ocultar solo después de 50px para evitar cambios constantes
      if (!this.isScrolled) {
        this.isScrolled = true;
      }
    }
    
    this.lastScrollTop = scrollTop;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-toggle') && !target.closest('.dropdown-menu')) {
      this.activeDropdown = null;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}