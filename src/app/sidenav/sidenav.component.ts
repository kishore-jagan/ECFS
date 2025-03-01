import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { HomePageComponent } from '../home-page/home-page.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent implements OnInit{
  constructor(private layout: LayoutComponent, private router: Router) {}
  currentPage!:string;
  isPageSelected(name: string): boolean {
    // return this.layout.page === name;
    const currentUrlPage = this.router.url.split('/').pop();
    // console.log('url', currentUrlPage, name, name.toLowerCase()===this.currentPage.toLowerCase());
    // //console.log('pagename', page);
 
    return name.toLowerCase() === currentUrlPage;
  }
ngOnInit(): void {
    this.currentPage =  this.layout.page;
     console.log(this.currentPage);
}
  onPageChange(name: string) {
    this.layout.page = name;
    this.currentPage = name;
    console.log(name)
    if(name === 'Reports'){
      this.router.navigate(['/base', name.toLowerCase()]);
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    }else if(name === 'Analytics'){
      this.router.navigate(['/base', name.toLowerCase()]);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
    
    else{
      this.router.navigate(['/base', name.toLowerCase()]);
    }
    

  }
}
