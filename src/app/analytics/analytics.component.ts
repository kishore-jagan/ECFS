import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as echarts from 'echarts';
import {
  AwsReportData,
  EcfsReportData,
  ReportService,
  sensors,
} from '../services/report.service';
import { EcfsData } from '../models/ecfs_model';
import { DataService } from '../services/service.service';
import { catchError, map, Observable, of } from 'rxjs';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePicker, Select],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
  providers: [ReportService],
})
export class AnalyticsComponent implements OnInit {
  loading: boolean = false;

  selectedStation: string = 'ECFS';

  selectedPeriod: string = 'dateRange';
  periodOptions = [
    { label: 'Daily', value: 'dateRange' },
    { label: 'Weekly', value: 'weekRange' },
    { label: 'Monthly', value: 'monthRange' },
    { label: 'Yearly', value: 'yearRange' },
  ];

  selectedChart: string = 'line';
  chartOptions = [
    { label: 'Line Plot', value: 'line' },
    { label: 'Scatter Series', value: 'scatter' },
    { label: 'Bar Plot', value: 'bar' },
    { label: 'Polar plot', value: 'currentSpeed' },
  ];

  // ecfs: EcfsData[] = [];
  ecfs1: EcfsReportData[] = [];
  aws: AwsReportData[] = [];

  fromDate = new Date();
  toDate = new Date();
  selectedWeek = new Date();
  selectedMonth = new Date();
  selectedYear = new Date();

  constructor(
    private analyticsService: ReportService,
    private ser: DataService
  ) {}

  ngOnInit(): void {
    // this.getSensordata();
    this.onInitFetch();
  }

  // getSensordata() {
  //   this.analyticsService.getSensors().subscribe((data: sensors) => {
  //     this.ecfs = data.ecfs;
  //     console.log('ECFS data', this.ecfs);
  //   });
  // }

  selectStationoption(type: string) {
    this.selectedStation = type;

    if (this.selectedStation == 'ECFS') {
      this.Tide2();
    } else if (this.selectedStation == 'AWS') {
      this.Tide();
      this.bottompolar();
    }
  }

  onPeriodChange(event: any) {
    // this.selectedPeriod = event.target.value
  }

  // getSensordata() {
  //   this.ser.getEcfsData().subscribe((data: EcfsData[]) => {
  //     this.ecfs = data;
  //     console.log('ECFS data', this.ecfs);
  //     this.Tide();
  //   });
  // }

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

    this.loading = true;
    this.analyticsService
      // .getSensors('2024-01-04T03:10:00.050Z', '2024-12-31T23:59:59.999Z')
      .getSensors(
        '2024-01-04T01:40:00.050+05:30',
        '2024-07-04T08:43:00.050+05:30'
      )
      .subscribe((data: sensors) => {
        this.ecfs1 = data.ecfs;
        this.aws = data.aws;
        if (this.selectedStation == 'ECFS') {
          // this.bottompolar();
          this.Tide2();
        } else if (this.selectedStation == 'AWS') {
          this.Tide();
          this.bottompolar();
        }
        console.log('aws data', this.aws);
        console.log('ecfs data', this.ecfs1);
      });
  }

  onSubmit(): void {
    const { formattedFromDate, formattedToDate } = this.periodWise();
    this.analyticsService
      .getSensors(formattedFromDate!, formattedToDate!)
      .subscribe((data: sensors) => {
        this.ecfs1 = data.ecfs;
        this.aws = data.aws;
        this.Tide();
        this.bottompolar();
        this.Tide2();
        // this.loading = false;
        console.log('aws data on submit', this.aws);
        console.log('ecfs data on submit', this.ecfs1);
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

  Tide(): void {
    const chartType = this.selectedChart;
    this.loading = true;
    // const tide = document.getElementById('tide');

    const computedStyle = getComputedStyle(document.body);
    const bgColor = computedStyle
      .getPropertyValue('--secbackground-color')
      .trim();
    const mainText = computedStyle.getPropertyValue('--chart-maintext').trim();
    const subText = computedStyle.getPropertyValue('--main-text').trim();

    const parameterKeys = [
      'winddir_uc',
      'ws',
      'winddir_cc',
      'ws_cc',
      'bp',
      'rh',
      'airtemp',
      'dp',
      'metsens_volts',
      'metsens_status',
      'rain_mm',
      'sbtempc',
      'targtempc',
      'pyr1_w_irr_tc',
      'pyr1_w_bodytemp',
      'pyr2_w_irr_tc',
      'pyr2_w_bodytemp',
      'long_rad_tc',
    ];

    const parameterTitles: {
      [key: string]: { title: string; series: string };
    } = {
      winddir_uc: { title: 'Wind Direction UC', series: 'Direction (°)' },
      ws: { title: 'Wind Speed UC', series: 'Wind Speed (m/s)' },
      winddir_cc: { title: 'Wind Direction', series: 'Direction (°)' },
      ws_cc: { title: 'Wind Speed', series: 'Wind Speed (m/s)' },
      bp: { title: 'Barometric Pressure', series: 'Pressure (hPa)' },
      rh: { title: 'Relative Humidity', series: 'Humidity (%)' },
      airtemp: { title: 'Air Temperature', series: 'Temperature (°C)' },
      dp: { title: 'Dew Point Temperature', series: 'Dew Point (°C)' },
      metsens_volts: {
        title: 'Meteorological Sensor Voltage',
        series: 'Voltage (V)',
      },
      metsens_status: {
        title: 'Meteorological Sensor Status',
        series: 'Status',
      },
      rain_mm: { title: 'Rainfall', series: 'Rainfall (mm)' },
      sbtempc: { title: 'Sensor Body Temperature', series: 'Temperature (°C)' },
      targtempc: { title: 'Target Temperature', series: 'Temperature (°C)' },
      pyr1_w_irr_tc: {
        title: 'Pyranometer 1 Irradiance',
        series: 'Irradiance (W/m²)',
      },
      pyr1_w_bodytemp: {
        title: 'Pyranometer 1 Body Temp',
        series: 'Temperature (°C)',
      },
      pyr2_w_irr_tc: {
        title: 'Pyranometer 2 Irradiance',
        series: 'Irradiance (W/m²)',
      },
      pyr2_w_bodytemp: {
        title: 'Pyranometer 2 Body Temp',
        series: 'Temperature (°C)',
      },
      long_rad_tc: { title: 'Longwave Radiation', series: 'Radiation (W/m²)' },
    };

    parameterKeys.forEach((key) => {
      const chartContainer = document.getElementById(`chart-${key}`);
      if (!chartContainer) return;

      const existingInstance = echarts.getInstanceByDom(chartContainer);
      if (existingInstance) {
        existingInstance.dispose();
      }

      const chartData = this.aws.map((item) => [
        new Date(item.timestamp).toLocaleString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3,
        }),
        (item as Record<string, any>)[key] ?? null,
      ]);

      console.log('chart', chartData);

      const chartInstance = echarts.init(chartContainer);

      // const waterLevels =
      //   this.selectedStation === 'cwprs01'
      //     ? this.cwprs01.map((item) => item.S1_RelativeWaterLevel)
      //     : this.selectedStation === 'cwprs02'
      //     ? this.cwprs02.map((item) => item.S1_RelativeWaterLevel)
      //     : [];

      // const dates =
      //   this.selectedStation === 'cwprs01'
      //     ? this.cwprs01.map(
      //         (item) =>
      //           `${item.Date?.split('T')[0]} ${
      //             item.Time?.split('T')[1]?.split('.')[0]
      //           }`
      //       )
      //     : this.selectedStation === 'cwprs02'
      //     ? this.cwprs02.map(
      //         (item) =>
      //           `${item.Date?.split('T')[0]} ${
      //             item.Time?.split('T')[1]?.split('.')[0]
      //           }`
      //       )
      //     : [];

      //Without model and fetch with date and time

      // const dates = this.cwprs01.map(item =>`${item.Date?.split('T')[0]}`);
      //Without model and fetch with date only

      // Retrieve theme variables

      const option = {
        title: {
          text: parameterTitles[key].title
            ? parameterTitles[key].title
            : key.toUpperCase(),
          left: '1%',
          textStyle: {
            color: mainText,
            fontSize: 20,
          },
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          // top: '50%',
          left: '7%',
          // right: '10%',
          bottom: '30%',
          // containLabel: true
        },
        xAxis: {
          type: 'category',
          name: 'Time', // X-axis legend (title)
          nameLocation: 'middle',
          // data: chartData.map((d) => d[0]),
          nameTextStyle: {
            color: mainText,
            padding: [35, 0, 0, 0],
            fontSize: 16,
          },
          // data: dates,
          axisLabel: {
            color: subText, // Set x-axis label color to white
            rotate: 45,
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: false, // Hide x-axis grid lines
          },
        },

        yAxis: {
          name: parameterTitles[key].series
            ? parameterTitles[key].series
            : key.toLowerCase(),
          nameLocation: 'middle',
          // data: chartData.map((d) => d[1]),
          nameTextStyle: {
            color: mainText,
            padding: [0, 0, 30, 0],
            fontSize: 16,
          },
          // type: 'value'
          axisLabel: {
            color: subText, // Set y-axis label color to white
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: true, // Hide x-axis grid lines
            lineStyle: {
              color: subText,
              type: 'dashed',
            },
          },
        },

        legend: {
          // type: 'scroll',
          orient: 'vertical', // Orient the legend vertically
          right: '15%',
          top: '2%',
          // top: 'middle',
          textStyle: {
            color: subText, // Set legend text color to white
            fontSize: 14,
          },
        },

        toolbox: {
          // right: 10,
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
              title: {
                zoom: 'Zoom',
                back: 'Reset Zoom',
              },
            },
            restore: {},
            saveAsImage: {
              backgroundColor: bgColor,
              pixelRatio: 2,
            },
          },
          iconStyle: {
            borderColor: mainText,
          },
        },

        dataZoom: [
          {
            type: 'slider',
            // bottom: 15,
            height: 20,
            start: 0, // You can adjust to define how much of the chart is visible initially
            end: 100, // Set the percentage of the range initially visible
          },
          {
            type: 'inside',
            start: 0,
            end: 100, // Can be modified based on your dataset's initial view preference
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
          },
        ],

        series: [
          {
            name: parameterTitles[key].series
              ? parameterTitles[key].series
              : key.toLowerCase(),
            data: chartData,
            type: 'line', // Change to 'bar' or 'scatter' dynamically if needed
            smooth: true,
            lineStyle: { color: '#1ee1ff' },
            itemStyle: { color: '#1ee1ff' },
            showSymbol: false,
          },
        ],
      };

      chartInstance.setOption(option);
      window.addEventListener('resize', () => chartInstance.resize());
    });

    this.loading = false;
  }

  Tide2(): void {
    const chartType = this.selectedChart;
    this.loading = true;
    // const tide = document.getElementById('tide');

    const computedStyle = getComputedStyle(document.body);
    const bgColor = computedStyle
      .getPropertyValue('--secbackground-color')
      .trim();
    const mainText = computedStyle.getPropertyValue('--chart-maintext').trim();
    const subText = computedStyle.getPropertyValue('--main-text').trim();

    const parameterKeys = [
      'co2_molar_li',
      'h2o_molar_li',
      'co2_ab_li',
      'h2o_ab_li',
      'press_li',
      'temp_li',
      'aux_li',
      'cooler_volt_li',
      'diagval_li',
      'out_bw_li',
      'pg_delay_li',
      'ux',
      'uy',
      'uz',
      'ts',
      'x_accel',
      'y_accel',
      'z_accel',
      'x_gyro',
      'y_gyro',
      'z_gyro',
      'x_mag',
      'y_mag',
      'z_mag',
      'ambient_pressure',
      'roll',
      'pitch',
      'yaw',
      'quaternion_q0',
      'quaternion_q1',
      'quaternion_q2',
      'quaternion_q3',
      'imu_gps_correl_timestamp_tow',
      'imu_gps_week_number',
      'imu_timestamp_flags',
    ];

    const parameterTitles: {
      [key: string]: { title: string; series: string };
    } = {
      co2_molar_li: {
        title: 'CO2 Molar Concentration',
        series: 'CO2 Molar (ppm)',
      },
      h2o_molar_li: {
        title: 'H2O Molar Concentration',
        series: 'H2O Molar (ppt)',
      },
      co2_ab_li: { title: 'CO2 Absorption', series: 'CO2 Abs (ppm)' },
      h2o_ab_li: { title: 'H2O Absorption', series: 'H2O Abs (ppt)' },
      press_li: { title: 'Pressure', series: 'P (hPa)' },
      temp_li: { title: 'Temperature', series: 'T (°C)' },
      aux_li: { title: 'Auxiliary Data', series: 'Aux (V)' },
      cooler_volt_li: { title: 'Cooler Voltage', series: 'Voltage (V)' },
      diagval_li: { title: 'Diagnostic Value', series: 'Diag' },
      out_bw_li: { title: 'Output Bandwidth', series: 'BW (Hz)' },
      pg_delay_li: {
        title: 'Pressure Gradient Delay',
        series: 'PG Delay (s)',
      },
      ux: { title: 'Wind Velocity X-Direction', series: 'Uₓ (m/s)' },
      uy: { title: 'Wind Velocity Y-Direction', series: 'Uᵧ (m/s)' },
      uz: { title: 'Wind Velocity Z-Direction', series: 'U𝓏 (m/s)' },
      ts: { title: 'Speed of sound', series: 'Tₛ (m/s)' },
      x_accel: { title: 'Acceleration X-Direction', series: 'Aₓ (m/s²)' },
      y_accel: { title: 'Acceleration Y-Direction', series: 'Aᵧ (m/s²)' },
      z_accel: { title: 'Acceleration Z-Direction', series: 'A𝓏 (m/s²)' },
      x_gyro: { title: 'Gyroscope Measurement X-Axis', series: 'Gyroₓ (°/s)' },
      y_gyro: { title: 'Gyroscope Measurement Y-Axis', series: 'Gyroᵧ (°/s)' },
      z_gyro: { title: 'Gyroscope Measurement Z-Axis', series: 'Gyro𝓏 (°/s)' },
      x_mag: { title: 'Magnetic Field X-Direction', series: 'Magₓ (G)' },
      y_mag: { title: 'Magnetic Field Y-Direction', series: 'Magᵧ (G)' },
      z_mag: { title: 'Magnetic Field Z-Direction', series: 'Mag𝓏 (G)' },
      ambient_pressure: { title: 'Ambient Pressure', series: 'Pₐ (hPa)' },
      roll: { title: 'Roll', series: 'Roll (°)' },
      pitch: { title: 'Pitch', series: 'Pitch (°)' },
      yaw: { title: 'Yaw', series: 'Yaw (°)' },
      quaternion_q0: { title: 'Quaternion Component Q0', series: 'Q₀' },
      quaternion_q1: { title: 'Quaternion Component Q1', series: 'Q₁' },
      quaternion_q2: { title: 'Quaternion Component Q2', series: 'Q₂' },
      quaternion_q3: { title: 'Quaternion Component Q3', series: 'Q₃' },
      imu_gps_correl_timestamp_tow: {
        title: 'IMU-GPS-Correl',
        series: 'IMU-GPS (°)',
      },
      imu_gps_week_number: {
        title: 'IMU-GPS Week Number',
        series: 'Week # (unit)',
      },
      imu_timestamp_flags: {
        title: 'IMU Timestamp Flags',
        series: 'Flags (unit)',
      },
    };

    parameterKeys.forEach((key) => {
      const chartContainer = document.getElementById(`chart2-${key}`);
      if (!chartContainer) return;

      const existingInstance = echarts.getInstanceByDom(chartContainer);
      if (existingInstance) {
        existingInstance.dispose();
      }

      const chartData = this.ecfs1.map((item) => [
        new Date(item.timestamp).toLocaleString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3,
        }),
        (item as Record<string, any>)[key] ?? null,
      ]);

      console.log('chart', chartData);

      const chartInstance = echarts.init(chartContainer);

      // const waterLevels =
      //   this.selectedStation === 'cwprs01'
      //     ? this.cwprs01.map((item) => item.S1_RelativeWaterLevel)
      //     : this.selectedStation === 'cwprs02'
      //     ? this.cwprs02.map((item) => item.S1_RelativeWaterLevel)
      //     : [];

      // const dates =
      //   this.selectedStation === 'cwprs01'
      //     ? this.cwprs01.map(
      //         (item) =>
      //           `${item.Date?.split('T')[0]} ${
      //             item.Time?.split('T')[1]?.split('.')[0]
      //           }`
      //       )
      //     : this.selectedStation === 'cwprs02'
      //     ? this.cwprs02.map(
      //         (item) =>
      //           `${item.Date?.split('T')[0]} ${
      //             item.Time?.split('T')[1]?.split('.')[0]
      //           }`
      //       )
      //     : [];

      //Without model and fetch with date and time

      // const dates = this.cwprs01.map(item =>`${item.Date?.split('T')[0]}`);
      //Without model and fetch with date only

      // Retrieve theme variables

      const option = {
        title: {
          text: parameterTitles[key].title
            ? parameterTitles[key].title
            : key.toUpperCase(),
          left: '1%',
          textStyle: {
            color: mainText,
            fontSize: 20,
          },
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          // top: '50%',
          left: '7%',
          // right: '10%',
          bottom: '30%',
          // containLabel: true
        },
        xAxis: {
          type: 'category',
          name: 'Time', // X-axis legend (title)
          nameLocation: 'middle',
          // data: chartData.map((d) => d[0]),
          nameTextStyle: {
            color: mainText,
            padding: [35, 0, 0, 0],
            fontSize: 16,
          },
          // data: dates,
          axisLabel: {
            color: subText, // Set x-axis label color to white
            rotate: 45,
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: false, // Hide x-axis grid lines
          },
        },

        yAxis: {
          name: parameterTitles[key].series
            ? parameterTitles[key].series
            : key.toUpperCase(),
          nameLocation: 'middle',
          // data: chartData.map((d) => d[1]),
          nameTextStyle: {
            color: mainText,
            padding: [0, 0, 30, 0],
            fontSize: 16,
          },
          // type: 'value'
          axisLabel: {
            color: subText, // Set y-axis label color to white
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: true, // Hide x-axis grid lines
            lineStyle: {
              color: subText,
              type: 'dashed',
            },
          },
        },

        legend: {
          // type: 'scroll',
          orient: 'vertical', // Orient the legend vertically
          right: '15%',
          top: '2%',
          // top: 'middle',
          textStyle: {
            color: subText, // Set legend text color to white
            fontSize: 14,
          },
        },

        toolbox: {
          // right: 10,
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
              title: {
                zoom: 'Zoom',
                back: 'Reset Zoom',
              },
            },
            restore: {},
            saveAsImage: {
              backgroundColor: bgColor,
              pixelRatio: 2,
            },
          },
          iconStyle: {
            borderColor: mainText,
          },
        },

        dataZoom: [
          {
            type: 'slider',
            // bottom: 15,
            height: 20,
            start: 0, // You can adjust to define how much of the chart is visible initially
            end: 100, // Set the percentage of the range initially visible
          },
          {
            type: 'inside',
            start: 0,
            end: 100, // Can be modified based on your dataset's initial view preference
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
          },
        ],

        series: [
          {
            name: parameterTitles[key].series
              ? parameterTitles[key].series
              : key.toUpperCase(),
            data: chartData,
            type: 'line', // Change to 'bar' or 'scatter' dynamically if needed
            smooth: true,
            lineStyle: { color: '#1ee1ff' },
            itemStyle: { color: '#1ee1ff' },
            showSymbol: false,
          },
        ],
      };

      chartInstance.setOption(option);
      window.addEventListener('resize', () => chartInstance.resize());
    });

    this.loading = false;
  }

  bottompolar(): void {
    const chartType = this.selectedChart;
    this.loading = true;
    const polar3 = document.getElementById('bottompolar')!;

    const computedStyle = getComputedStyle(document.body);
    const bgColor = computedStyle
      .getPropertyValue('--secbackground-color')
      .trim();
    const mainText = computedStyle.getPropertyValue('--chart-maintext').trim();
    const subText = computedStyle.getPropertyValue('--main-text').trim();
    const text = computedStyle.getPropertyValue('--text-color').trim();

    // Real-time data: Fetch and parse speed and direction
    // const surfaceCurrent = this.selectedStation === 'cwprs01'
    // ? this.cwprs01.map(item => item.Lower_CurrentSpeedDirection)
    // : this.selectedStation === 'cwprs02'
    // ? this.cwprs02.map(item => item.Lower_CurrentSpeedDirection)
    // : [];

    const bottomPolar = this.aws.map((data) => {
      return { speed: data.ws_cc, direction: data.winddir_cc };
    });

    if (polar3) {
      const existingInstance = echarts.getInstanceByDom(polar3);
      if (existingInstance) {
        existingInstance.dispose();
      }
      const windRoseChart1 = echarts.init(polar3);

      const directionLabels = [
        'N',
        'NNE',
        'NE',
        'ENE',
        'E',
        'ESE',
        'SE',
        'SSE',
        'S',
        'SSW',
        'SW',
        'WSW',
        'W',
        'WNW',
        'NW',
        'NNW',
      ];
      const speedCategories = [
        '<0.5',
        '0.5-2',
        '2-4',
        '4-6',
        '6-8',
        '>8',
      ] as const;

      const speedColors = [
        '#0000FF',
        '#3399FF',
        '#66CCFF',
        '#FFFF66',
        '#FF9933',
        '#FF3300',
      ]; // Blue to red gradient

      // Type for speed categories
      type SpeedCategory = (typeof speedCategories)[number];

      // Type for direction bins with each speed category as a key
      type DirectionBin = Record<SpeedCategory, number>;

      // Function to bin speeds
      function categorizeSpeed(speed: number): SpeedCategory {
        if (speed < 0.5) return '<0.5';
        if (speed < 2) return '0.5-2';
        if (speed < 4) return '2-4';
        if (speed < 6) return '4-6';
        if (speed < 8) return '6-8';
        return '>8';
      }

      // Initialize bins
      const dataBins: DirectionBin[] = directionLabels.map(() => ({
        '<0.5': 0,
        '0.5-2': 0,
        '2-4': 0,
        '4-6': 0,
        '6-8': 0,
        '>8': 0,
      }));

      // Map directions to labels and fill dataBins with counts
      bottomPolar.forEach(({ speed, direction }) => {
        const directionIndex = Math.round(direction / 22.5) % 16;
        const speedCategory = categorizeSpeed(speed);
        dataBins[directionIndex][speedCategory] += 1;
      });

      // Extract data for each speed category to use in series
      const seriesData = speedCategories.map((speedCategory, index) => ({
        name: speedCategory,
        type: 'bar',
        stack: 'wind-speed',
        coordinateSystem: 'polar',
        data: dataBins.map((bin) => bin[speedCategory]),
        itemStyle: {
          color: speedColors[index], // Assign color based on speed range
        },
      }));

      // Set up the chart options
      const option = {
        title: {
          text: 'AWS Wind Rose', // Changed from 'Surface' to 'Low'
          // left: '1%',
          // top: '18%',
          textStyle: {
            color: mainText,
            fontSize: 20,
          },
        },
        legend: {
          data: speedCategories,
          top: 10,
          right: 0,
          orient: 'vertical',
          textStyle: {
            color: subText, // White legend text
            fontSize: 12,
          },
        },
        polar: {},
        angleAxis: {
          type: 'category',
          data: directionLabels,
          boundaryGap: true,
          startAngle: 100,
          axisLabel: {
            color: subText,
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(255, 255, 255, 0.1)', 'rgba(200, 200, 200, 0.1)'],
            },
            axisLine: {
              lineStyle: {
                color: subText,
              },
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: subText,
              type: 'solid',
            },
          },
        },
        radiusAxis: {
          min: 0,
          axisLine: {
            lineStyle: {
              color: subText, // White radius axis line
            },
          },
          axisLabel: {
            color: subText,
            formatter: '{value}',
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: text,
              type: 'dashed',
            },
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a}: {c}',
        },
        series: seriesData,
      };

      // Render the chart and handle resizing
      windRoseChart1.setOption(option);

      //console.table(dataBins);

      this.loading = false;
      window.addEventListener('resize', () => windRoseChart1.resize());
    } else {
      //console.error("Element with id 'rose-plot' not found");
      this.loading = false;
    }
  }
}
