import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NetworkConfigComponent } from './components/network-config/network-config.component';
import { NetworkVisualizationComponent } from './components/network-visualization/network-visualization.component';
import { NetworkTrainingComponent } from './components/network-training/network-training.component';
import { ExampleDisplayComponent } from './components/example-display/example-display.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NetworkConfigComponent,
    NetworkVisualizationComponent,
    NetworkTrainingComponent,
    ExampleDisplayComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Neural Network Demo';
  layerSizes: number[] = [784, 128, 64, 10];
  networkId: string = '';
  isTraining: boolean = false;
  showExamples: boolean = false;
  
  updateLayerSizes(sizes: number[]): void {
    console.log('Updating layer sizes:', sizes);
    this.layerSizes = sizes;
  }
  
  setNetworkId(id: string): void {
    console.log('Setting network ID:', id);
    this.networkId = id;
  }
  
  onTrainingStatusChanged(training: boolean): void {
    this.isTraining = training;
  }
  
  onShowExamplesRequested(): void {
    this.showExamples = true;
  }
}
