import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() lat: number = -33.0458; // Latitud de la ubicación actual (Valparaíso por defecto)
  @Input() lon: number = -71.6197; // Longitud de la ubicación actual (Valparaíso por defecto)
  @Input() searchedLat: number | null = null; // Latitud de la ciudad buscada
  @Input() searchedLon: number | null = null; // Longitud de la ciudad buscada
  private map: any;
  private markers: L.Marker[] = [];

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      this.updateMap();
    }
  }

  private initMap(): void {
    // Crear el mapa
    this.map = L.map('map').setView([this.lat, this.lon], 10);

    // Agregar los tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Agregar marcadores
    this.updateMap();
  }

  private updateMap(): void {
    // Eliminar marcadores existentes
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // Agregar marcador de la ubicación actual
    if (this.lat && this.lon) {
      const currentMarker = L.marker([this.lat, this.lon], {
        icon: this.getCustomIcon(),
      }).addTo(this.map);
      this.markers.push(currentMarker);
    }

    // Agregar marcador de la ciudad buscada
    if (this.searchedLat && this.searchedLon) {
      const searchedMarker = L.marker([this.searchedLat, this.searchedLon], {
        icon: this.getCustomIcon(),
      }).addTo(this.map);
      this.markers.push(searchedMarker);
    }

    // Ajustar la vista del mapa para incluir todos los marcadores
    if (this.markers.length > 0) {
      const group = new L.FeatureGroup(this.markers);
      this.map.fitBounds(group.getBounds());
    }
  }

  private getCustomIcon() {
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', // Ícono del marcador
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png', // Ícono del marcador (2x)
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', // Sombra del marcador
      iconSize: [25, 41], // Tamaño del ícono
      iconAnchor: [12, 41], // Punto de anclaje del ícono
      popupAnchor: [1, -34], // Punto de anclaje del popup
      shadowSize: [41, 41], // Tamaño de la sombra
    });
  }
}
