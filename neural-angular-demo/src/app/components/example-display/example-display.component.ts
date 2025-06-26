import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NeuralNetworkService } from '../../services/neural-network.service';

interface NetworkExample {
  example_index: number;
  predicted_digit: number;
  actual_digit: number;
  image_data: string | SafeUrl;
  network_output: number[];
  correct: boolean;
}

@Component({
  selector: 'app-example-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example-display.component.html',
  styleUrls: ['./example-display.component.css']
})
export class ExampleDisplayComponent {
  @Input() networkId: string = '';
  
  currentExample: NetworkExample | null = null;
  loadingExample: boolean = false;
  error: string | null = null;
  
  constructor(
    private neuralNetworkService: NeuralNetworkService,
    private sanitizer: DomSanitizer
  ) {}
  
  // Safely handle image data to ensure it has proper data URI format
  private sanitizeImageData(imageData: string): SafeUrl {
    if (!imageData) {
      console.error('No image data provided');
      return this.sanitizer.bypassSecurityTrustUrl('');
    }
    
    // If already a data URI, sanitize and return
    if (imageData.startsWith('data:image/')) {
      return this.sanitizer.bypassSecurityTrustUrl(imageData);
    }
    
    // Assume it's base64 data and add the data URI prefix
    const dataUri = `data:image/png;base64,${imageData}`;
    return this.sanitizer.bypassSecurityTrustUrl(dataUri);
  }
  
  loadSuccessfulExample(): void {
    if (this.loadingExample) return; // Prevent multiple simultaneous requests
    
    this.loadingExample = true;
    this.error = null;
    
    this.neuralNetworkService.getSuccessfulExample(this.networkId).subscribe({
      next: (response) => {
        console.log('Successful example response:', response);
        this.loadingExample = false;
        
        this.currentExample = {
          example_index: response.example_index,
          predicted_digit: response.predicted_digit,
          actual_digit: response.actual_digit,
          image_data: this.sanitizeImageData(response.image_data),
          network_output: response.network_output,
          correct: true // This is a successful example, so it's always correct
        };
      },
      error: (error) => {
        this.loadingExample = false;
        this.error = 'Failed to load successful example. Please try again.';
        console.error('Error loading successful example:', error);
      }
    });
  }
  
  loadUnsuccessfulExample(): void {
    if (this.loadingExample) return; // Prevent multiple simultaneous requests
    
    this.loadingExample = true;
    this.error = null;
    
    this.neuralNetworkService.getUnsuccessfulExample(this.networkId).subscribe({
      next: (response) => {
        console.log('Unsuccessful example response:', response);
        this.loadingExample = false;
        
        this.currentExample = {
          example_index: response.example_index,
          predicted_digit: response.predicted_digit,
          actual_digit: response.actual_digit,
          image_data: this.sanitizeImageData(response.image_data),
          network_output: response.network_output,
          correct: false // This is an unsuccessful example, so it's always incorrect
        };
      },
      error: (error) => {
        this.loadingExample = false;
        this.error = 'Failed to load unsuccessful example. Please try again.';
        console.error('Error loading unsuccessful example:', error);
      }
    });
  }
}
