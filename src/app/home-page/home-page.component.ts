import { Component, OnInit } from '@angular/core';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import { Point, Circle as circleGeom } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit{
map!: Map;
buoy1latlong:[number, number] = fromLonLat([80.482814, 13.031254]) as [number, number];
vectorLayer!: VectorLayer;

ngOnInit(): void {
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
    target: 'map',
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
