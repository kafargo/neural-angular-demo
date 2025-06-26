import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeuralNetworkService } from './services/neural-network.service';

// Import new components
import { NavigationComponent } from './components/navigation/navigation.component';
import { LearnComponent } from './components/learn/learn.component';
import { NetworkConfigComponent } from './components/network-config/network-config.component';
import { NetworkTrainingComponent } from './components/network-training/network-training.component';
import { NetworkTestComponent } from './components/network-test/network-test.component';

// Import interfaces
import { AppSection, NetworkConfig, TrainingConfig } from './interfaces/neural-network.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavigationComponent,
    LearnComponent,
    NetworkConfigComponent,
    NetworkTrainingComponent,
    NetworkTestComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Neural Network Demo';
  activeSection: AppSection = 'learn';
  
  // Network state
  networkId = '';
  networkConfig: NetworkConfig = {
    hiddenLayer1: 128,
    hiddenLayer2: 64,
    useSecondLayer: true,
    layerSizes: [784, 128, 64, 10]
  };
  
  // Training state
  trainingConfig: TrainingConfig = {
    epochs: 10,
    miniBatchSize: 10,
    learningRate: 3.0
  };
  
  trainingComplete = false;
  finalAccuracy: number | null = null;

  constructor(
    private neuralNetworkService: NeuralNetworkService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  // Navigation Methods
  onSectionChange(section: AppSection): void {
    this.activeSection = section;
  }

  // Network configuration events
  onNetworkConfigChange(config: NetworkConfig): void {
    this.networkConfig = config;
  }

  onNetworkCreated(networkId: string): void {
    this.networkId = networkId;
  }

  onContinueToCreate(): void {
    this.activeSection = 'create';
  }

  onContinueToTrain(): void {
    this.activeSection = 'train';
  }

  // Training events
  onTrainingConfigChange(config: TrainingConfig): void {
    this.trainingConfig = config;
  }

  onTrainingComplete(accuracy: number): void {
    this.trainingComplete = true;
    this.finalAccuracy = accuracy;
  }

  onContinueToTest(): void {
    this.activeSection = 'test';
  }
}
