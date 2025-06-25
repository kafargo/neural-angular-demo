import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NeuralNetworkService } from '../../services/neural-network.service';

interface NetworkExample {
  example_index: number;
  predicted_digit: number;
  actual_digit: number;
  image_data: string | SafeUrl;
  originalImageData?: string; // Store original image data from API
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
  imageLoaded: boolean = true;
  
  constructor(
    private neuralNetworkService: NeuralNetworkService,
    private sanitizer: DomSanitizer
  ) {}
  
  // Safely handle image data to ensure it has proper data URI format
  private sanitizeImageData(imageData: string | null): SafeUrl | string {
    console.log('Sanitizing image data');
    
    if (!imageData) {
      console.error('No image data provided');
      return '';
    }
    
    try {
      // Handle undefined or null case
      if (typeof imageData !== 'string') {
        console.error('Image data is not a string:', typeof imageData);
        return '';
      }

      // Log a sample of the received data for debugging
      console.log('Raw image data sample:', imageData.substring(0, 100));
      
      // If already a data URI, sanitize and return
      if (imageData.startsWith('data:image/')) {
        console.log('Image already has data URI prefix');
        return this.sanitizer.bypassSecurityTrustUrl(imageData);
      }
      
      // Sometimes the API returns the whole JSON structure as a string
      if (imageData.includes('"image_data"')) {
        try {
          const jsonData = JSON.parse(imageData);
          if (jsonData.image_data) {
            console.log('Extracted image data from JSON string');
            return this.sanitizeImageData(jsonData.image_data);
          }
        } catch (e) {
          console.log('Failed to parse as JSON');
        }
      }
      
      // Try to detect if the string is base64 encoded
      const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
      const trimmedData = imageData.trim();
      
      if (base64Regex.test(trimmedData)) {
        console.log('Adding data URI prefix to base64 data');
        const dataUri = `data:image/png;base64,${trimmedData}`;
        return this.sanitizer.bypassSecurityTrustUrl(dataUri);
      }
      
      // If it's an absolute URL to a PNG file
      if (imageData.match(/^https?:\/\/.+\.(?:png|jpg|jpeg|gif)$/i)) {
        console.log('Using absolute URL for image');
        return this.sanitizer.bypassSecurityTrustUrl(imageData);
      }
      
      // Last resort: assume it's a base64 string that might have whitespace or line breaks
      // First, clean it up by removing non-base64 characters
      const cleanedBase64 = imageData.replace(/[^A-Za-z0-9+/=]/g, '');
      if (cleanedBase64.length > 0) {
        console.log('Using cleaned base64 data');
        const dataUri = `data:image/png;base64,${cleanedBase64}`;
        return this.sanitizer.bypassSecurityTrustUrl(dataUri);
      }
      
      console.error('Invalid image data format:', imageData.substring(0, 50));
      return '';
    } catch (error) {
      console.error('Error sanitizing image data:', error);
      return '';
    }
  }
  
  loadSuccessfulExample(): void {
    this.loadingExample = true;
    this.error = null;
    
    this.neuralNetworkService.getSuccessfulExample(this.networkId).subscribe({
      next: (response) => {
        console.log('Successful example response:', response);
        console.log('Image data type:', typeof response.image_data);
        console.log('Image data starts with:', response.image_data ? response.image_data.substring(0, 50) : 'undefined');
        
        this.loadingExample = false;
        this.imageLoaded = true;
        
        // Store the sanitized image and original data
        const sanitizedImageData = this.sanitizeImageData(response.image_data);
        
        this.currentExample = {
          example_index: response.example_index,
          predicted_digit: response.predicted_digit,
          actual_digit: response.actual_digit,
          image_data: sanitizedImageData,
          originalImageData: response.image_data, // Store original for potential recovery
          network_output: response.network_output,
          correct: response.predicted_digit === response.actual_digit
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
    this.loadingExample = true;
    this.error = null;
    
    this.neuralNetworkService.getUnsuccessfulExample(this.networkId).subscribe({
      next: (response) => {
        console.log('Unsuccessful example response:', response);
        console.log('Image data type:', typeof response.image_data);
        console.log('Image data starts with:', response.image_data ? response.image_data.substring(0, 50) : 'undefined');
        
        this.loadingExample = false;
        this.imageLoaded = true;
        
        // Store the sanitized image and original data
        const sanitizedImageData = this.sanitizeImageData(response.image_data);
        
        this.currentExample = {
          example_index: response.example_index,
          predicted_digit: response.predicted_digit,
          actual_digit: response.actual_digit,
          image_data: sanitizedImageData,
          originalImageData: response.image_data, // Store original for potential recovery
          network_output: response.network_output,
          correct: response.predicted_digit === response.actual_digit
        };
      },
      error: (error) => {
        this.loadingExample = false;
        this.error = 'Failed to load unsuccessful example. Please try again.';
        console.error('Error loading unsuccessful example:', error);
      }
    });
  }
  
  handleImageError(event: any): void {
    console.error('Error loading image:', event);
    this.imageLoaded = false;
    
    // If we have currentExample but image failed to load, try to fix the image data
    if (this.currentExample) {
      console.log('Attempting to recover image data');
      
      // If the current example image_data is not a string, it might be a SafeUrl that failed
      // Try to re-sanitize the original image data from the API response
      if (typeof this.currentExample.image_data !== 'string' && this.currentExample.originalImageData) {
        console.log('Trying with original image data');
        this.currentExample.image_data = this.sanitizeImageData(this.currentExample.originalImageData);
      }
    }
  }
}
