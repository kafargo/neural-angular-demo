import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { NetworkConfig } from '../../interfaces/neural-network.interface';

@Component({
  selector: 'app-network-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network-config.component.html',
  styleUrls: ['./network-config.component.css']
})
export class NetworkConfigComponent {
  @Input() config: NetworkConfig = {
    hiddenLayer1: 128,
    hiddenLayer2: 64,
    useSecondLayer: true,
    layerSizes: [784, 128, 64, 10]
  };
  
  @Output() configChange = new EventEmitter<NetworkConfig>();
  @Output() networkCreated = new EventEmitter<string>();
  @Output() continueToTrain = new EventEmitter<void>();

  loading = false;
  error: string | null = null;

  constructor(private neuralNetworkService: NeuralNetworkService) {}

  onConfigChange(): void {
    this.updateLayerSizes();
    this.configChange.emit(this.config);
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
        this.networkCreated.emit(response.network_id);
        this.continueToTrain.emit();
      },
      error: (error) => {
        console.error('Error creating network:', error);
        this.loading = false;
        this.error = 'Failed to create network. Please try again.';
      }
    });
  }
}
