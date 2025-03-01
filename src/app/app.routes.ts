import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportsComponent } from './reports/reports.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { UsersComponent } from './users/users.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'base/home',
  },
  // {
  //     path: 'home',
  //     component: HomePageComponent
  // },
  {
    path: 'base',
    component: LayoutComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'users', component:UsersComponent}
    ],
  },
  { path: '**', redirectTo: 'base', pathMatch: 'full' },
];
