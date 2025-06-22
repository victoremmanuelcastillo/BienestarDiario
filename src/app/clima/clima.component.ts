import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-clima',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './clima.component.html',
  styleUrls: ['./clima.component.css']
})
export class ClimaComponent implements OnInit {
  
  // API Configuration
  private readonly API_KEY = 'b71d90815ac40587ceb2d22a79d9e245';
  private readonly API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  // Component state
  cityInput = '';
  loading = false;
  error = '';
  weatherData: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Cargar clima de Madrid por defecto
    this.cityInput = 'Madrid';
    this.getWeather();
  }

  async getWeather() {
    if (!this.cityInput.trim()) {
      this.showError('Por favor, ingresa el nombre de una ciudad');
      return;
    }

    this.loading = true;
    this.error = '';
    this.weatherData = null;

    try {
      const url = `${this.API_URL}?q=${this.cityInput}&appid=${this.API_KEY}&units=metric&lang=es`;
      
      const data = await this.http.get(url).toPromise();
      this.weatherData = data;
      this.error = '';
      
    } catch (err: any) {
      if (err.status === 404) {
        this.showError('Ciudad no encontrada. Verifica el nombre e intenta nuevamente.');
      } else if (err.status === 401) {
        this.showError('Error de autenticación con la API del clima.');
      } else {
        this.showError('No se pudo obtener la información del clima. Intenta más tarde.');
      }
    } finally {
      this.loading = false;
    }
  }

  private showError(message: string) {
    this.error = message;
    this.weatherData = null;
  }

  // Función para obtener el icono del clima
  getWeatherIcon(weather: string): string {
    const icons: { [key: string]: string } = {
      'cielo claro': '☀️',
      'cielo despejado': '☀️',
      'algo nuboso': '🌤️',
      'nubes dispersas': '⛅',
      'nubes rotas': '☁️',
      'nubes': '☁️',
      'muy nuboso': '☁️',
      'lluvia ligera': '🌦️',
      'lluvia moderada': '🌧️',
      'lluvia intensa': '🌧️',
      'lluvia': '🌧️',
      'tormenta': '⛈️',
      'tormenta eléctrica': '⛈️',
      'nieve': '❄️',
      'neblina': '🌫️',
      'niebla': '🌫️',
      'bruma': '🌫️'
    };
    return icons[weather.toLowerCase()] || '🌤️';
  }

  // Función para manejar Enter en el input
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.getWeather();
    }
  }

  // Getters para el template
  get temperature(): number {
    return this.weatherData ? Math.round(this.weatherData.main.temp) : 0;
  }

  get feelsLike(): number {
    return this.weatherData ? Math.round(this.weatherData.main.feels_like) : 0;
  }

  get cityName(): string {
    return this.weatherData ? this.weatherData.name : '';
  }

  get description(): string {
    return this.weatherData ? this.weatherData.weather[0].description : '';
  }

  get humidity(): number {
    return this.weatherData ? this.weatherData.main.humidity : 0;
  }

  get windSpeed(): number {
    return this.weatherData ? this.weatherData.wind.speed : 0;
  }

  get pressure(): number {
    return this.weatherData ? this.weatherData.main.pressure : 0;
  }
}