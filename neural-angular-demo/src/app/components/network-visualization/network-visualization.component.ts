import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-network-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './network-visualization.component.html',
  styleUrls: ['./network-visualization.component.css'],
  animations: [
    trigger('trainingPulse', [
      state('inactive', style({
        opacity: 1
      })),
      state('active', style({
        opacity: 0.7,
        transform: 'scale(1.05)'
      })),
      transition('inactive => active', animate('0.5s ease-in')),
      transition('active => inactive', animate('0.5s ease-out'))
    ])
  ]
})
export class NetworkVisualizationComponent implements OnChanges {
  @Input() layerSizes: number[] = [784, 128, 64, 10]; // Default network architecture
  @Input() isTraining: boolean = false; // Whether the network is currently training
  
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['layerSizes'] && !changes['layerSizes'].firstChange) {
      console.log('Layer sizes updated:', this.layerSizes);
      // Any additional visualization updates can be done here
    }
    
    if (changes['isTraining']) {
      console.log('Training status changed:', this.isTraining);
    }
  }
  
  // Helper method to create an array of nodes
  getNodesArray(count: number): number[] {
    return Array(count).fill(0).map((_, i) => i);
  }
  
  // Returns true if we should render all nodes in this layer
  shouldRenderAllNodes(layerIndex: number): boolean {
    const size = this.layerSizes[layerIndex];
    // Only render all nodes for output layer (10 nodes) or very small layers
    return size <= 10;
  }
  
  // Returns a subset of nodes to visualize for large layers
  getVisibleNodesArray(layerIndex: number): number[] {
    // Always show 5 nodes for large layers
    return Array(5).fill(0).map((_, i) => i);
  }
  
  // Get style for connection lines between layers
  getConnectionStyle(layerIndex: number): any {
    if (layerIndex >= this.layerSizes.length - 1) {
      return { display: 'none' };
    }
    
    // Calculate position
    const left = (layerIndex + 0.5) * 100 + (layerIndex * 20);
    
    return {
      left: `${left}px`,
      width: '30px'  // Width of connection
    };
  }
}
