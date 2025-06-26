import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.css']
})
export class LearnComponent {
  constructor(
    private router: Router,
    private appState: AppStateService
  ) {}

  onContinue(): void {
    this.appState.setActiveSection('create');
    this.router.navigate(['/create']);
  }
}
