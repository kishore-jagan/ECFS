import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HomePageComponent } from '../home-page/home-page.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { ReportsComponent } from '../reports/reports.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    SidenavComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  page: string = '';
  tappedStation:string = '';
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    //  this.route.paramMap.subscribe((params) => {
    //  this.page = params.get('page') || 'Home';
    //  });

    setTimeout(() => {
      this.page = 'Reports';
    }, 2);
  }
}
