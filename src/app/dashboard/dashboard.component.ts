import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Feature from 'ol/Feature';
import { Point, Circle as circleGeom } from 'ol/geom';
import { Circle } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import View from 'ol/View';
import Text from 'ol/style/Text';
import { DataService } from '../services/service.service';
import { response } from 'express';
import { error } from 'console';
import { AwsData, EcfsData } from '../models/ecfs_model';

import { BatteryComponent } from '../battery/battery.component';
import { interval, pipe, Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import Overlay from 'ol/Overlay';
import { DirectionComponent } from './direction/direction.component';
import { SpeedComponent } from './speed/speed.component';

interface listModel {
  name: string;
  value: string;
  img: string;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BatteryComponent,
    DirectionComponent,
    SpeedComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard2.component.css',
  providers: [DatePipe],
})
export class DashboardComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  isBrowser: boolean = false;
  map!: Map;
  speed: number = 2;
  latLong: [number, number] = fromLonLat([80.2705, 13.0843]) as [
    number,
    number
  ];
  vectorLayer!: VectorLayer;
  overlay!: Overlay;
  popupContent: string = '';

  sensorList: string[] = ['ECFS', 'AWS'];
  sensorSelect: string = this.sensorList[0];

  isECFSSelected: boolean = true;

  ecfsdata: EcfsData[] = [];
  ecfslastRow?: EcfsData;

  awsdata: AwsData[] = [];
  awslastRow?: AwsData;

  ecfslist: listModel[] = [];
  awsList: listModel[] = [];

  battery: number = 10;

  constructor(private dataService: DataService) {}

  toggleSensor() {
    this.sensorSelect = this.isECFSSelected ? 'ECFS' : 'AWS';
  }
  ngOnInit(): void {
    this.mapInit();
    this.getEcfsData();
    this.getAwsData();
    console.log('ecfs:', this.ecfslastRow?.timestamp);
  }

  assignecfslist() {
    const list = [
      {
        name: 'Ambient Pressure',
        value: this.ecfslastRow!.ambient_pressure.toFixed(2),
        img: '../../assets/ecfs/pressure.svg',
      },
      {
        name: 'CO2 Molar Concentration',
        value: this.ecfslastRow!.co2_molar_li.toFixed(2),
        img: '../../assets/ecfs/co2molar.svg',
      },
      {
        name: 'H2O Molar Concentration',
        value: this.ecfslastRow!.h2o_molar_li.toFixed(2),
        img: '../../assets/ecfs/water.svg',
      },
      {
        name: 'CO2 Absorption',
        value: this.ecfslastRow!.co2_ab_li.toFixed(2),
        img: '../../assets/ecfs/co2molar.svg',
      },
      {
        name: 'H2O Absorption',
        value: this.ecfslastRow!.h2o_ab_li.toFixed(2),
        img: '../../assets/ecfs/water.svg',
      },
      {
        name: 'Pressure',
        value: this.ecfslastRow!.press_li.toFixed(2),
        img: '../../assets/ecfs/pressure.svg',
      },
      {
        name: 'Temperature',
        value: this.ecfslastRow!.temp_li.toFixed(2),
        img: '../../assets/ecfs/temperture.svg',
      },
      {
        name: 'Auxiliary Data',
        value: this.ecfslastRow!.aux_li.toFixed(2),
        img: '../../assets/ecfs/auxilarydata.svg',
      },
      {
        name: 'Wind Velocity X-Direction',
        value: this.ecfslastRow!.ux.toFixed(2),
        img: '../../assets/ecfs/windsp.svg',
      },
      {
        name: 'Wind Velocity Y-Direction',
        value: this.ecfslastRow!.uy.toFixed(2),
        img: '../../assets/ecfs/windsp.svg',
      },
      {
        name: 'Wind Velocity Z-Direction',
        value: this.ecfslastRow!.uz.toFixed(2),
        img: '../../assets/ecfs/windsp.svg',
      },
      {
        name: 'Sonic Temperature',
        value: this.ecfslastRow!.ts.toFixed(2),
        img: '../../assets/ecfs/solar.svg',
      },
      {
        name: 'Acceleration X-Direction',
        value: this.ecfslastRow!.x_accel.toFixed(2),
        img: '../../assets/ecfs/wind direction.svg',
      },
      {
        name: 'Acceleration Y-Direction',
        value: this.ecfslastRow!.y_accel.toFixed(2),
        img: '../../assets/ecfs/wind direction.svg',
      },
      {
        name: 'Acceleration Z-Direction',
        value: this.ecfslastRow!.z_accel.toFixed(2),
        img: '../../assets/ecfs/wind direction.svg',
      },
      {
        name: 'Gyroscope X-Axis',
        value: this.ecfslastRow!.x_gyro.toFixed(2),
        img: '../../assets/ecfs/gyroscope.svg',
      },
      {
        name: 'Gyroscope Y-Axis',
        value: this.ecfslastRow!.y_gyro.toFixed(2),
        img: '../../assets/ecfs/gyroscope.svg',
      },
      {
        name: 'Gyroscope Z-Axis',
        value: this.ecfslastRow!.z_gyro.toFixed(2),
        img: '../../assets/ecfs/gyroscope.svg',
      },
      {
        name: 'Magnetic Field X-Direction',
        value: this.ecfslastRow!.x_mag.toFixed(2),
        img: '../../assets/ecfs/magnetic.svg',
      },
      {
        name: 'Magnetic Field Y-Direction',
        value: this.ecfslastRow!.y_mag.toFixed(2),
        img: '../../assets/ecfs/magnetic.svg',
      },
      {
        name: 'Magnetic Field Z-Direction',
        value: this.ecfslastRow!.z_mag.toFixed(2),
        img: '../../assets/ecfs/magnetic.svg',
      },

      {
        name: 'Roll',
        value: this.ecfslastRow!.roll.toFixed(2),
        img: '../../assets/svg/meter.svg',
      },
      {
        name: 'Pitch',
        value: this.ecfslastRow!.pitch.toFixed(2),
        img: '../../assets/svg/level.svg',
      },
      {
        name: 'Yaw',
        value: this.ecfslastRow!.yaw.toFixed(2),
        img: '../../assets/svg/o2.svg',
      },
      {
        name: 'IMU',
        value: this.ecfslastRow!.imu_timestamp_flags.toFixed(2),
        img: '../../assets/svg/meter.svg',
      },
    ];
    // console.log('ecfs list', list);
    this.ecfslist = list;
  }
  assignawsList() {
    const list = [
      {
        name: 'Air Temperature',
        value: this.awslastRow!.airtemp.toFixed(2),
        img: '../../assets/ecfs/relativehumidity.svg',
      },
      {
        name: 'Barometric Pressure',
        value: this.awslastRow!.bp.toFixed(2),
        img: '../../assets/ecfs/barometric.svg',
      },
      {
        name: 'Relative Humidity',
        value: this.awslastRow!.rh.toFixed(2),
        img: '../../assets/ecfs/humid.svg',
      },
      {
        name: 'Wind Direction uc',
        value: this.awslastRow!.winddir_uc.toFixed(2),
        img: '../../assets/ecfs/wind direction.svg',
      },
      {
        name: 'Wind Speed uc',
        value: this.awslastRow!.ws.toFixed(2),
        img: '../../assets/ecfs/windsp.svg',
      },
      {
        name: 'Wind Dirrection cc',
        value: this.awslastRow!.winddir_cc.toFixed(2),
        img: '../../assets/ecfs/wind direction.svg',
      },
      {
        name: 'Wind Speed cc',
        value: this.awslastRow!.ws_cc.toFixed(2),
        img: '../../assets/ecfs/windsp.svg',
      },
      {
        name: 'Dew Point Temperature',
        value: this.awslastRow!.dp.toFixed(2),
        img: '../../assets/ecfs/temperture.svg',
      },
      {
        name: 'Meteorological Sensor Voltage',
        value: this.awslastRow!.metsens_volts.toFixed(2),
        img: '../../assets/ecfs/coolervoltage.svg',
      },
      {
        name: 'Meteorological Sensor Status',
        value: this.awslastRow!.metsens_status.toFixed(2),
        img: '../../assets/ecfs/status.svg',
      },
      {
        name: 'Rainfall (mm)',
        value: this.awslastRow!.rain_mm.toFixed(2),
        img: '../../assets/ecfs/rain.svg',
      },
      {
        name: 'Sensor Body Temperature (C)',
        value: this.awslastRow!.sbtempc.toFixed(2),
        img: '../../assets/ecfs/temperture.svg',
      },
      {
        name: 'Target Temperature (C)',
        value: this.awslastRow!.targtempc.toFixed(2),
        img: '../../assets/ecfs/temperture.svg',
      },
      {
        name: 'Pyranometer 1 Irradiance',
        value: this.awslastRow!.pyr1_w_irr_tc.toFixed(2),
        img: '../../assets/svg/meter.svg',
      },
      {
        name: 'Pyranometer 1 Temperature',
        value: this.awslastRow!.pyr1_w_bodytemp.toFixed(2),
        img: '../../assets/svg/meter.svg',
      },
      {
        name: 'Pyranometer 2 Irradiance',
        value: this.awslastRow!.pyr2_w_irr_tc.toFixed(2),
        img: '../../assets/svg/level.svg',
      },
      {
        name: 'Pyranometer 2 Temperature',
        value: this.awslastRow!.pyr2_w_bodytemp.toFixed(2),
        img: '../../assets/svg/level.svg',
      },
      {
        name: 'Longwave Radiation',
        value: this.awslastRow!.long_rad_tc.toFixed(2),
        img: '../../assets/ecfs/solar.svg',
      },
      {
        name: 'GPS - Latitude',
        value: this.awslastRow!.gps_lat.toFixed(2),
        img: '../../assets/aws/map.svg',
      },
      {
        name: 'GPS - Longitude',
        value: this.awslastRow!.gps_lon.toFixed(2),
        img: '../../assets/aws/map.svg',
      },
    ];
    // console.log('awslist', list);
    this.awsList = list;
  }

  getEcfsData() {
    this.dataService.getEcfsData().subscribe(
      (response: EcfsData[]) => {
        this.ecfsdata = response.map((item) => ({
          ...item,
          value: item,
        }));
        // console.log('All ecfs data', this.ecfsdata);

        if (this.ecfsdata.length > 0) {
          this.ecfslastRow = this.ecfsdata[this.ecfsdata.length - 1];
          if (this.ecfslastRow) {
            this.assignecfslist();
            // console.log('ecfs has data');
          }
        }
        // console.log('ecfs Last row data:', this.ecfslastRow);
      },
      (error) => {
        // console.error('error:', error);
      }
    );
  }

  getAwsData() {
    this.dataService.getAwsData().subscribe(
      (response: AwsData[]) => {
        this.awsdata = response;
        // console.log('All Aws data', this.awsdata);

        if (this.awsdata.length > 0) {
          this.awslastRow = this.awsdata[this.awsdata.length - 1];
          if (this.awslastRow) {
            this.assignawsList();
            // console.log('aws has data');
          }
        }
        // console.log('last awsrowdata', this.awslastRow);
      },
      (error) => {
        console.error('error', error);
      }
    );
  }

  buoyLocations = [
    {
      name: 'ECFS_Ship',
      coordinates: [82.26975, 13.00475],
      description: 'ECFS SHIP',
      img: 'assets/Sagar_Nidhi.png',
    },
    {
      name: 'AWS 2',
      coordinates: [76.9558, 11.0168],
      description: 'Weather Station 2',
      img: 'assets/aws/aws1.svg',
    },
    {
      name: 'AWS 3',
      coordinates: [78.7047, 10.7905],
      description: 'Weather Station 3',
      img: 'assets/aws/aws1.svg',
    },
    {
      name: 'AWS 4',
      coordinates: [77.5946, 12.9716],
      description: 'Weather Station 4',
      img: 'assets/aws/aws1.svg',
    },
    {
      name: 'AWS 5',
      coordinates: [78.4772, 17.4065],
      description: 'Weather Station 5',
      img: 'assets/aws/aws1.svg',
    },
  ];

  mapInit() {
    const mapContainer = document.getElementById('map1');

    if (!mapContainer) {
      console.error('Map not Found');
      return;
    }

    this.vectorLayer = new VectorLayer({
      source: new VectorSource(),
    });

    this.map = new Map({
      target: 'map1',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            // url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            // url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            // url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          }),
        }),
        this.vectorLayer,
      ],
      view: new View({
        center: this.latLong,
        zoom: 5,
      }),
    });
    this.updateMarkers();
  }

  updateMarkers() {
    const vectorSource = new VectorSource();
    let filteredLocations = [];

    // Filter based on selected sensor
    if (this.sensorSelect === 'ECFS') {
      filteredLocations = this.buoyLocations.filter(
        (loc) => loc.name === 'ECFS_Ship'
      );
    } else {
      filteredLocations = this.buoyLocations.filter(
        (loc) => loc.name !== 'ECFS_Ship'
      );
    }

    // Add features dynamically
    filteredLocations.forEach((buoy) => {
      const iconFeature = new Feature({
        geometry: new Point(fromLonLat(buoy.coordinates)),
        name: buoy.name,
        description: buoy.description,
      });

      iconFeature.setStyle(
        new Style({
          image: new Icon({
            src: buoy.img,
            scale: 0.2,
          }),
          text: new Text({
            font: '12px Arial, sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
            offsetY: -20,
          }),
        })
      );

      vectorSource.addFeature(iconFeature);
    });

    // Update the vector layer
    this.vectorLayer.setSource(vectorSource);
  }
  onSensorChange() {
    this.updateMarkers();
  }
}
