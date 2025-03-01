import { AfterViewInit, Component, OnInit } from '@angular/core';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import { Point, Circle as circleGeom } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import View from 'ol/View';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule} from '@angular/forms'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{

sensorList: string[] = ['ECFS', 'AWS'];
sensorSelect: string = this.sensorList[0];  
map!: Map;
buoy1latlong:[number, number] = fromLonLat([80.482814, 13.031254]) as [number, number];
vectorLayer!: VectorLayer;

ngOnInit(): void {
  this.mapInit();
}

mapInit() {
  const mapContainer = document.getElementById('leaflet-map');

  if(!mapContainer) {
    console.error('Map Container not found');
    return;
  }

  const iconFeature = new Feature({
    geometry: new Point(this.buoy1latlong)
  });

  const circleFeature = new Feature({
    geometry: new circleGeom(this.buoy1latlong, 50000)
  });


  iconFeature.setStyle(new Style ({
    image: new Icon({
      src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      scale: 0.05
    }),

    text: new Text({
      text: 'Bouy 1', // Label text
      font: '12px Arial, sans-serif', // Font style
      fill: new Fill({ color: '#000' }), // Text color
      stroke: new Stroke({ color: '#fff', width: 2 }), // Outline for better visibility
      offsetY: -20 // Offset the text above the icon
    })
  })
);

circleFeature.setStyle(new Style ({
  fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }), // Semi-transparent fill
      stroke: new Stroke({
        color: 'blue',
        width: 2
      })
}));

const vectorSource = new VectorSource({
  features: [iconFeature,circleFeature]
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

  this.map = new Map({
    target: 'leaflet-map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        })
      }),
      vectorLayer,
    ],
    view: new View({
      center: this.buoy1latlong,
      zoom: 5
    })
  }); 
}
}
