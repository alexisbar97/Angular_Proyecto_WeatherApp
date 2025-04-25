import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() lat: number = -33.0458;
  @Input() lon: number = -71.6197;
  @Input() searchedLat: number | null = null;
  @Input() searchedLon: number | null = null;
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
    this.map = L.map('map').setView([this.lat, this.lon], 10);

    L.tileLayer('https:
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);


    this.updateMap();
  }

  private updateMap(): void {

    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    if (this.lat && this.lon) {
      const currentMarker = L.marker([this.lat, this.lon], {
        icon: this.getCustomIcon(),
      }).addTo(this.map);
      this.markers.push(currentMarker);
    }

    if (this.searchedLat && this.searchedLon) {
      const searchedMarker = L.marker([this.searchedLat, this.searchedLon], {
        icon: this.getCustomIcon(),
      }).addTo(this.map);
      this.markers.push(searchedMarker);
    }

    if (this.markers.length > 0) {
      const group = new L.FeatureGroup(this.markers);
      this.map.fitBounds(group.getBounds());
    }
  }

  private getCustomIcon() {
    return L.icon({
      iconUrl: 'https:
      iconRetinaUrl: 'https:
      shadowUrl: 'https:
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }
}
