import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NeuralNetworkService } from '../../services/neural-network.service';

@Component({
  selector: 'app-network-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network-config.component.html',
  styleUrls: ['./network-config.component.css']
})
export class NetworkConfigComponent implements OnInit {
  @Output() layerSizesChanged = new EventEmitter<number[]>();
  @Output() networkCreated = new EventEmitter<string>();
  
  hiddenLayer1: number = 128;
  hiddenLayer2: number = 64;
  useSecondLayer: boolean = true;
  
  loading: boolean = false;
  error: string | null = null;
  isNetworkCreated: boolean = false;
  networkId: string = '';
  
  constructor(private neuralNetworkService: NeuralNetworkService) {}
  
  ngOnInit(): void {
    // Initialize with a preview of the default network structure
    this.previewNetworkStructure();
  }
  
  // Preview network structure without creating a network
  previewNetworkStructure(): void {
    // Build layer sizes array
    const layerSizes: number[] = [784];
    
    // Add hidden layers
    layerSizes.push(this.hiddenLayer1);
    if (this.useSecondLayer) {
      layerSizes.push(this.hiddenLayer2);
    }
    
    // Add output layer
    layerSizes.push(10);
    
    // Emit the updated layer sizes for preview
    this.layerSizesChanged.emit(layerSizes);
  }
  
  createNetwork(): void {
    this.loading = true;
    this.error = null;
    this.isNetworkCreated = false;
    
    // Build layer sizes array
    const layerSizes: number[] = [784];
    
    // Add hidden layers
    layerSizes.push(this.hiddenLayer1);
    if (this.useSecondLayer) {
      layerSizes.push(this.hiddenLayer2);
    }
    
    // Add output layer
    layerSizes.push(10);
    
    // Emit the updated layer sizes
    this.layerSizesChanged.emit(layerSizes);
    
    console.log('Creating network with layer sizes:', layerSizes);
    
    // Call service to create network
    this.neuralNetworkService.createNetwork(layerSizes).subscribe({
      next: (response) => {
        console.log('Network created successfully:', response);
        this.loading = false;
        this.isNetworkCreated = true;
        this.networkId = response.network_id;
        console.log('Emitting network ID:', this.networkId);
        this.networkCreated.emit(response.network_id);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to create network. Please try again.';
        console.error('Error creating network:', error);
      }
    });
  }
}
