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

  constructor(
    private router: Router,
    private neuralNetworkService: NeuralNetworkService,
    public appState: AppStateService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  // Navigation Methods
  onSectionChange(section: AppSection): void {
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
    this.appState.setActiveSection('create');
    this.router.navigate(['/create']);
  }

  onContinueToTrain(): void {
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
    this.appState.setActiveSection('test');
    this.router.navigate(['/test']);
  }
}
