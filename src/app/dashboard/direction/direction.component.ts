import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-direction',
  standalone: true,
  imports: [],
  templateUrl: './direction.component.html',
  styleUrl: './direction.component.css',
})
export class DirectionComponent {
  @Input() compassValue!: number;
}
