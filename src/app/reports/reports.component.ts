import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  AwsReportData,
  EcfsReportData,
  ReportService,
  sensors,
} from '../services/report.service';
import { EcfsData } from '../models/ecfs_model';
import { DataService } from '../services/service.service';
import { load } from 'ol/Image';
import { catchError, map, Observable, of } from 'rxjs';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import moment from 'moment';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    
    FormsModule,
    CommonModule,
    TableModule,
    MultiSelectModule,
    CalendarModule,
    DropdownModule,
    DatePicker,
    Select,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
  providers: [ReportService],
  // encapsulation: ViewEncapsulation.None,
})
export class ReportsComponent implements OnInit {
  selectedStation: string = 'ECFS';

  selectedPeriod: string = 'dateRange';
  periodOptions = [
    { label: 'Daily', value: 'dateRange' },
    { label: 'Weekly', value: 'weekRange' },
    { label: 'Monthly', value: 'monthRange' },
    { label: 'Yearly', value: 'yearRange' },
  ];

  cols: Column[] = [];
  cols2: Column[] = [];
  selectedColumns: Column[] = [];

  ecfs: EcfsReportData[] = [];
  aws: AwsReportData[] = [];

  fromDate = new Date();
  toDate = new Date();
  selectedWeek = new Date();
  selectedMonth = new Date();
  selectedYear = new Date();

  loading: boolean = true;

  constructor(private sensorService: ReportService) {}

  ngOnInit(): void {
    
    setTimeout(() => {
      this.init()
    }, 1);
  }

  init(){
    this.initializeColumns();
    this.onInitFetch();
  }

  initializeColumns() {
    this.cols = [
      { field: 'ecfs_id', header: 'ECFS ID' },
      { field: 'timestamp', header: 'Timestamp' },
      { field: 'co2_molar_li', header: 'CO2 Molar' },
      { field: 'h2o_molar_li', header: 'H2O Molar' },
      { field: 'co2_ab_li', header: 'CO2 Absorption' },
      { field: 'h2o_ab_li', header: 'H2O Absorption' },
      { field: 'press_li', header: 'Pressure' },
      { field: 'temp_li', header: 'Temperature' },
      { field: 'aux_li', header: 'Auxiliary Data' },
      { field: 'cooler_volt_li', header: 'Cooler Voltage' },
      { field: 'diagval_li', header: 'Diagnostic Value' },
      { field: 'out_bw_li', header: 'Output Bandwidth' },
      { field: 'pg_delay_li', header: 'Pressure Gradient Delay' },
      { field: 'ux', header: 'Wind Velocity X' },
      { field: 'uy', header: 'Wind Velocity Y' },
      { field: 'uz', header: 'Wind Velocity Z' },
      { field: 'ts', header: 'Sonic Temperature' },
      { field: 'x_accel', header: 'Acceleration X' },
      { field: 'y_accel', header: 'Acceleration Y' },
      { field: 'z_accel', header: 'Acceleration Z' },
      { field: 'x_gyro', header: 'Gyroscope X' },
      { field: 'y_gyro', header: 'Gyroscope Y' },
      { field: 'z_gyro', header: 'Gyroscope Z' },
      { field: 'x_mag', header: 'Magnetic Field X' },
      { field: 'y_mag', header: 'Magnetic Field Y' },
      { field: 'z_mag', header: 'Magnetic Field Z' },
      { field: 'ambient_pressure', header: 'Ambient Pressure' },
      { field: 'roll', header: 'Roll' },
      { field: 'pitch', header: 'Pitch' },
      { field: 'yaw', header: 'Yaw' },
      { field: 'quaternion_q0', header: 'Quaternion Q0' },
      { field: 'quaternion_q1', header: 'Quaternion Q1' },
      { field: 'quaternion_q2', header: 'Quaternion Q2' },
      { field: 'quaternion_q3', header: 'Quaternion Q3' },
      { field: 'imu_gps_correl_timestamp_tow', header: 'IMU-GPS Correlation' },
      { field: 'imu_gps_week_number', header: 'IMU-GPS Week Number' },
      { field: 'imu_timestamp_flags', header: 'IMU Timestamp Flags' },
    ];
    
    this.cols2 = [
      { field: 'aws_id', header: 'AWS ID' },
      { field: 'timestamp', header: 'Timestamp' },
      { field: 'winddir_uc', header: 'Wind Direction (Uncorrected)' },
      { field: 'ws', header: 'Wind Speed' },
      { field: 'winddir_cc', header: 'Wind Direction (Corrected)' },
      { field: 'ws_cc', header: 'Wind Speed (Corrected)' },
      { field: 'bp', header: 'Barometric Pressure' },
      { field: 'rh', header: 'Relative Humidity' },
      { field: 'airtemp', header: 'Air Temperature' },
      { field: 'dp', header: 'Dew Point' },
      { field: 'metsens_volts', header: 'Met Sensor Voltage' },
      { field: 'metsens_status', header: 'Met Sensor Status' },
      { field: 'rain_mm', header: 'Rainfall (mm)' },
      { field: 'sbtempc', header: 'Sensor Box Temperature (°C)' },
      { field: 'targtempc', header: 'Target Temperature (°C)' },
      { field: 'pyr1_w_irr_tc', header: 'Pyranometer 1 Irradiance (W/m²)' },
      { field: 'pyr1_w_bodytemp', header: 'Pyranometer 1 Body Temperature' },
      { field: 'pyr2_w_irr_tc', header: 'Pyranometer 2 Irradiance (W/m²)' },
      { field: 'pyr2_w_bodytemp', header: 'Pyranometer 2 Body Temperature' },
      { field: 'long_rad_tc', header: 'Longwave Radiation (W/m²)' },
      { field: 'gps_lat', header: 'GPS Latitude' },
      { field: 'gps_lon', header: 'GPS Longitude' },
    ];
    

    this.selectedColumns = [...this.cols];
  }
  selectStationoption(type: string) {
    this.selectedColumns = [];
    this.loading = true;
    this.selectedStation = type;
    
    if (this.selectedStation == 'ECFS') {
this.selectedColumns = [...this.cols2]

    } else if (this.selectedStation == 'AWS') {
      this.selectedColumns = [...this.cols]
    }
  }

  onPeriodChange(event: any) {
    // this.selectedPeriod = event.target.value
  }

  getSensors(): Observable<boolean> {
    
    return this.sensorService
      .getSensors('2024-01-04T14:10:00.050Z', '2024-01-04T14:11:59.999Z')
      .pipe(
        map((data: sensors) => {
          this.ecfs = data.ecfs;
          this.aws = data.aws;
          console.log('aws data', this.aws);
          console.log('ecfs data', this.ecfs);
          return this.ecfs.length !== 0;
        }),
        catchError((error) => {
          console.error('Error fetching sensors:', error);
          return of(false); // Return false in case of an error
        })
      );
  }

  private toISTISOString(date: Date): string {
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().slice(0, -1); // Remove 'Z' to avoid UTC indication
  }

  onInitFetch(): void {
    let formattedFromDate: string | null = null;
    let formattedToDate: string | null = null;

    let fromDate = this.fromDate || new Date();
    let toDate = this.toDate || new Date();

    this.fromDate.setHours(0, 0, 0, 0);

    formattedFromDate = this.toISTISOString(fromDate);
    formattedToDate = this.toISTISOString(toDate);
    const fDate = new Date(formattedFromDate);
    const tDate = new Date('2024-01-04T14:11:59.999Z');
     const date =  moment(fDate).toDate();
     const date2 = moment(tDate).toDate();
     console.log('Utc', date.toISOString(), date2.toISOString());
    this.loading = true;
    this.sensorService

      .getSensors('2024-01-04T08:40:00.050Z', '2024-01-04T08:41:59.999Z')
      .subscribe((data: sensors) => {
        this.ecfs = data.ecfs;
        this.aws = data.aws;
        console.log('aws data', this.aws);
        console.log('ecfs data', this.ecfs);
      });
  }

  onSubmit(): void {
    const { formattedFromDate, formattedToDate } = this.periodWise();
    this.sensorService
      .getSensors(formattedFromDate!, formattedToDate!)
      .subscribe((data: sensors) => {
        this.ecfs = data.ecfs;
        this.aws = data.aws;
        // this.loading = false;
        console.log('aws data on submit', this.aws);
        console.log('ecfs data on submit', this.ecfs);
      });
  }

  periodWise(): {
    formattedFromDate: string | null;
    formattedToDate: string | null;
  } {
    let formattedFromDate: string | null = null;
    let formattedToDate: string | null = null;

    let fromDate = this.fromDate || new Date();
    let toDate = this.toDate || new Date();

    switch (this.selectedPeriod) {
      case 'dateRange':
        formattedFromDate = this.fromDate
          ? this.toISTISOString(this.fromDate)
          : this.toISTISOString(fromDate);
        formattedToDate = this.toDate
          ? this.toISTISOString(this.toDate)
          : this.toISTISOString(toDate);
        break;

      case 'weekRange':
        const startOfWeek = new Date(this.selectedWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        formattedFromDate = this.toISTISOString(startOfWeek);

        const endofWeek = this.endOfWeek(this.selectedWeek);
        formattedToDate = this.toISTISOString(endofWeek);
        break;

      case 'monthRange':
        formattedFromDate = this.selectedMonth
          ? `${this.selectedMonth.getFullYear()}-${(
              this.selectedMonth.getMonth() + 1
            )
              .toString()
              .padStart(2, '0')}-01T00:00:00`
          : null;

        const monthEndDate = new Date(
          this.selectedMonth.getFullYear(),
          this.selectedMonth.getMonth() + 1,
          0
        );
        formattedToDate = monthEndDate
          ? `${monthEndDate.toISOString().split('T')[0]}T23:59:59`
          : null;
        break;

      case 'yearRange':
        const year = this.selectedYear.getFullYear();

        formattedFromDate = `${year}-01-01T00:00:00.000Z`;
        formattedToDate = `${year}-12-31T23:59:59.000Z`;
        break;
      default:
        break;
    }
    return { formattedFromDate, formattedToDate };
  }

  endOfWeek(startDate: Date): Date {
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  }

  // getSensordata() {
  //   this.ser.getEcfsData().subscribe((data: EcfsData[]) => {
  //     this.ecfs = data;
  //     console.log('ECFS data', this.ecfs);
  //     if (this.ecfs.length > 0) {
  //       this.cols = Object.keys(this.ecfs[0]).map((key) => ({
  //         field: key,
  //         header: this.formatHeader(key),
  //       }));

  //       this.selectedColumns = [...this.cols];
  //     }
  //   });
  // }

  // formatHeader(key: string): string {
  //   return key
  //     .replace(/_/g, ' ')
  //     .replace(/\b\w/g, (char) => char.toUpperCase());
  // }
}
