import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapComponent } from './map/map.component';
import { environment } from './environment';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

interface ForecastData {
  forecast: {
    forecastday: {
      date: string;
      day: {
        mintemp_c: number;
        maxtemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }[];
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'WeatherApp';
  weatherData: WeatherData | null = null;
  searchedWeatherData: WeatherData | null = null;
  currentForecastData: ForecastData['forecast']['forecastday'] = [];
  searchedForecastData: ForecastData['forecast']['forecastday'] = [];
  errorMessage: string = '';
  cityName: string = '';
  citySuggestions: any[] = [];
  showSuggestions: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getLocation();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          this.getWeather(latitude, longitude);
          this.getForecast(latitude, longitude, true);
        },
        (error) => {
          this.errorMessage = 'Error al obtener la ubicación: ' + error.message;
          console.error(error);
        }
      );
    } else {
      this.errorMessage = 'Geolocalización no soportada por este navegador.';
    }
  }

  getWeather(latitude: number, longitude: number) {
    if (!navigator.onLine) {
      this.errorMessage = 'No hay conexión a Internet.';
      return;
    }

    const apiKey = environment.weatherApiKey;
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`;

    this.http.get<WeatherData>(url).subscribe({
      next: (data) => {
        console.log('Respuesta de la API (Ubicación actual):', data);
        this.weatherData = data;
      },
      error: (error) => {
        this.handleApiError(error);
      },
    });
  }

  getForecast(latitude: number, longitude: number, isCurrentLocation: boolean = true) {
    if (!navigator.onLine) {
      this.errorMessage = 'No hay conexión a Internet.';
      return;
    }

    const apiKey = environment.weatherApiKey;
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=7`;

    this.http.get<ForecastData>(url).subscribe({
      next: (data) => {
        console.log('Pronóstico de 7 días:', data);
        if (isCurrentLocation) {
          this.currentForecastData = data.forecast.forecastday;
        } else {
          this.searchedForecastData = data.forecast.forecastday;
        }
      },
      error: (error) => {
        this.handleApiError(error);
      },
    });
  }

  searchWeather() {
    if (!this.cityName) {
      this.errorMessage = 'Por favor, ingresa el nombre de una ciudad.';
      return;
    }

    if (!navigator.onLine) {
      this.errorMessage = 'No hay conexión a Internet.';
      return;
    }

    const apiKey = environment.weatherApiKey;
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${this.cityName}`;

    this.http.get<WeatherData>(url).subscribe({
      next: (data) => {
        console.log('Respuesta de la API (Ciudad buscada):', data);
        this.searchedWeatherData = data;
        this.errorMessage = '';
        this.showSuggestions = false;

        this.getForecast(data.location.lat, data.location.lon, false);
      },
      error: (error) => {
        this.handleApiError(error);
      },
    });
  }

  getCitySuggestions() {
    if (!this.cityName || this.cityName.length < 3) {
      this.citySuggestions = [];
      this.showSuggestions = false;
      return;
    }

    const apiKey = environment.weatherApiKey;
    const url = `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${this.cityName}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        console.log('Sugerencias de ciudades:', data);
        this.citySuggestions = data;
        this.showSuggestions = true;
      },
      error: (error) => {
        this.handleApiError(error);
      },
    });
  }

  selectCity(city: any) {
    this.cityName = city.name;
    this.showSuggestions = false;
    this.searchWeather();
  }

  handleApiError(error: any) {
    if (error.status === 401) {
      this.errorMessage = 'API Key no válida. Verifica tu API Key.';
    } else if (error.status === 403) {
      this.errorMessage = 'Acceso denegado. Verifica tu suscripción.';
    } else if (error.status === 429) {
      this.errorMessage = 'Has excedido el límite de solicitudes. Intenta más tarde.';
    } else {
      this.errorMessage = 'Error al obtener el clima: ' + error.message;
    }
    console.error('Error en la API:', error);
  }
}
