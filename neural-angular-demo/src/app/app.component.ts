import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NeuralNetworkService } from './services/neural-network.service';
import { AppStateService } from './services/app-state.service';

// Import new components
import { NavigationComponent } from './components/navigation/navigation.component';

// Import interfaces
import { AppSection, NetworkConfig, TrainingConfig } from './interfaces/neural-network.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Neural Network Demo';
  private readonly NAVIGATION_FLAG = 'app_navigation_active';

  constructor(
    private router: Router,
    private neuralNetworkService: NeuralNetworkService,
    public appState: AppStateService
  ) {
    // Set flag before unload to distinguish navigation from refresh
    window.addEventListener('beforeunload', () => {
      sessionStorage.removeItem(this.NAVIGATION_FLAG);
    });
  }

  ngOnInit(): void {
    // Check if this is a page refresh (not a normal navigation)
    const isNavigation = sessionStorage.getItem(this.NAVIGATION_FLAG);
    
    if (!isNavigation) {
      // This is a page refresh - clear all state and redirect to landing page
      this.appState.clearAllState();
      this.router.navigate(['/learn']);
    }
    
    // Set flag for subsequent navigations
    sessionStorage.setItem(this.NAVIGATION_FLAG, 'true');
  }

  // Navigation Methods
  onSectionChange(section: AppSection): void {
    sessionStorage.setItem(this.NAVIGATION_FLAG, 'true');
    this.appState.setActiveSection(section);
    this.router.navigate([`/${section}`]);
  }

  // Network configuration events
  onNetworkConfigChange(config: NetworkConfig): void {
    this.appState.setNetworkConfig(config);
  }

  onNetworkCreated(networkId: string): void {
    this.appState.setNetworkId(networkId);
  }

  onContinueToCreate(): void {
    sessionStorage.setItem(this.NAVIGATION_FLAG, 'true');
    this.appState.setActiveSection('create');
    this.router.navigate(['/create']);
  }

  onContinueToTrain(): void {
    sessionStorage.setItem(this.NAVIGATION_FLAG, 'true');
    this.appState.setActiveSection('train');
    this.router.navigate(['/train']);
  }

  // Training events
  onTrainingConfigChange(config: TrainingConfig): void {
    this.appState.setTrainingConfig(config);
  }

  onTrainingComplete(accuracy: number): void {
    this.appState.setTrainingComplete(true);
    this.appState.setFinalAccuracy(accuracy);
  }

  onContinueToTest(): void {
    sessionStorage.setItem(this.NAVIGATION_FLAG, 'true');
    this.appState.setActiveSection('test');
    this.router.navigate(['/test']);
  }
}
