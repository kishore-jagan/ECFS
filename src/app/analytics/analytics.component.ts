import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as echarts from 'echarts';
import {
  EcfsReportData,
  ReportService,
  sensors,
} from '../services/report.service';
import { EcfsData } from '../models/ecfs_model';
import { DataService } from '../services/service.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
  providers: [],
})
export class AnalyticsComponent implements OnInit {
  selectedStation: string = 'ECFS';

  ecfs: EcfsData[] = [];

  selectedChart: string = 'line';
  chartOptions = [
    { label: 'Line Plot', value: 'line' },
    // { label: 'Scatter Series', value: 'scatter' },
    { label: 'Bar Plot', value: 'bar' },
    { label: 'Polar plot', value: 'currentSpeed' },
  ];
  loading: boolean = false;

  constructor(
    private analyticsService: ReportService,
    private ser: DataService
  ) {}

  selectStationoption(type: string) {
    this.selectedStation = type;

    if (this.selectedStation == 'ECFS') {
    } else if (this.selectedStation == 'AWS') {
    }
  }

  ngOnInit(): void {
    this.getSensordata();
  }

  // getSensordata() {
  //   this.analyticsService.getSensors().subscribe((data: sensors) => {
  //     this.ecfs = data.ecfs;
  //     console.log('ECFS data', this.ecfs);
  //   });
  // }

  getSensordata() {
    this.ser.getEcfsData().subscribe((data: EcfsData[]) => {
      this.ecfs = data;
      console.log('ECFS data', this.ecfs);
      this.Tide();
    });
  }

  realTimeH2OData = [
    ['2025-02-18', 18.6],
    ['2025-02-19', 19.2],
    ['2025-02-20', 20.1],
    ['2025-02-21', 21.4],
    ['2025-02-22', 19.8],
    ['2025-02-23', 18.9],
    ['2025-02-24', 20.5],
    ['2025-02-25', 22.3],
    ['2025-02-26', 21.8],
    ['2025-02-27', 19.7],
    ['2025-02-28', 20.2],
    ['2025-02-29', 18.4],
    ['2025-03-01', 19.9],
    ['2025-03-02', 20.7],
    ['2025-03-03', 22.0],
    ['2025-03-04', 21.1],
    ['2025-03-05', 19.3],
    ['2025-03-06', 20.8],
    ['2025-03-07', 18.6],
    ['2025-03-08', 19.5],
    ['2025-03-09', 21.7],
    ['2025-03-10', 22.4],
    ['2025-03-11', 20.9],
    ['2025-03-12', 19.1],
    ['2025-03-13', 18.8],
    ['2025-03-14', 20.3],
    ['2025-03-15', 21.5],
    ['2025-03-16', 22.1],
    ['2025-03-17', 20.6],
    ['2025-03-18', 19.0],
  ];
  Tide(): void {
    const chartType = this.selectedChart;
    this.loading = true;
    const tide = document.getElementById('tide');

    const computedStyle = getComputedStyle(document.body);
    const bgColor = computedStyle
      .getPropertyValue('--secbackground-color')
      .trim();
    const mainText = computedStyle.getPropertyValue('--chart-maintext').trim();
    const subText = computedStyle.getPropertyValue('--main-text').trim();

    const chartData = this.ecfs.map((item) => [
      new Date(item.timestamp).toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3, // Ensures milliseconds are shown
      }),
      item.co2_molar_li,
    ]);

    console.log('chart', chartData);

    if (tide) {
      const existingInstance = echarts.getInstanceByDom(tide);
      if (existingInstance) {
        existingInstance.dispose();
      }
      const tideLevel = echarts.init(tide);

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
          text: 'H20 Molar',
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
          name: 'Date', // X-axis legend (title)
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
          name: `h20`, // Y-axis legend (title)
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
            name: 'h2o',
            // data: dates.map((date, index) => ({
            //   value: [date, waterLevels[index]],
            // })),
            // data: this.sampleDataTide.map(item => [item.date, item.level]),
            data: chartData.map((item) => [item[0], item[1]]),
            type: chartType === 'bar' ? 'bar' : chartType,
            smooth: chartType === 'line',
            lineStyle:
              chartType === 'line' ? { color: '#1ee1ff' } : { color: 'orange' },
            barWidth: chartType === 'bar' ? '50%' : undefined,

            itemStyle: {
              color: '#1ee1ff',
            },
            showSymbol: false,
            label: {
              show: false,
              fontSize: 12, // Optional: Set font size for the data points (if labels are enabled)
            },
          },
        ],
      };

      // Set options for the chart
      tideLevel.setOption(option);
      this.loading = false;
      window.addEventListener('resize', () => {
        tideLevel.resize();
      });
    } else {
      this.loading = false;
    }
  }
}
