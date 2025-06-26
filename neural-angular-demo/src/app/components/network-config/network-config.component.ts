import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { AppStateService } from '../../services/app-state.service';
import { NetworkConfig } from '../../interfaces/neural-network.interface';

@Component({
  selector: 'app-network-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network-config.component.html',
  styleUrls: ['./network-config.component.css']
})
export class NetworkConfigComponent implements OnInit {
  config: NetworkConfig = {
    hiddenLayer1: 128,
    hiddenLayer2: 64,
    useSecondLayer: true,
    layerSizes: [784, 128, 64, 10]
  };
  
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private neuralNetworkService: NeuralNetworkService,
    private appState: AppStateService
  ) {}

  ngOnInit(): void {
    // Load the current config from the state service
    this.config = { ...this.appState.networkConfig };
  }

  onConfigChange(): void {
    this.updateLayerSizes();
    this.appState.setNetworkConfig(this.config);
  }

  private updateLayerSizes(): void {
    const layers = [784];
    layers.push(this.config.hiddenLayer1);
    if (this.config.useSecondLayer) {
      layers.push(this.config.hiddenLayer2);
    }
    layers.push(10);
    this.config.layerSizes = layers;
  }

  createNetwork(): void {
    this.loading = true;
    this.error = null;
    
    this.updateLayerSizes();
    
    this.neuralNetworkService.createNetwork(this.config.layerSizes).subscribe({
      next: (response) => {
        this.loading = false;
        this.appState.setNetworkId(response.network_id);
        this.appState.setActiveSection('train');
        this.router.navigate(['/train']);
      },
      error: (error) => {
        console.error('Error creating network:', error);
        this.loading = false;
        this.error = 'Failed to create network. Please try again.';
      }
    });
  }
}
