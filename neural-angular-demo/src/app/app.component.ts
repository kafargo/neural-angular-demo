import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NeuralNetworkService } from './services/neural-network.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // UI state
  title = 'Neural Network Demo';
  activeSection: 'learn' | 'create' | 'train' | 'test' = 'learn';
  loading: boolean = false;
  loadingExample: boolean = false;
  error: string | null = null;
  showExamples: boolean = false;
  imageLoaded: boolean = true;
  showInfoSection: boolean = false; // Added property for info section toggle
  
  // Training related properties
  trainingLoading: boolean = false;
  trainingStarted: boolean = false;
  trainingProgress: number = 0;
  finalAccuracy: number | null = null;
  currentTraining: any = null;
  
  // Current example data
  currentExample: any = null;
  
  // Network state
  networkId: string = '';
  trainingComplete: boolean = false;
  isTraining: boolean = false;
  
  // Network configuration
  hiddenLayer1: number = 128;
  hiddenLayer2: number = 64;
  useSecondLayer: boolean = true;
  layerSizes: number[] = [784, 128, 64, 10];
  
  // Training parameters
  epochs: number = 10;
  miniBatchSize: number = 10;
  learningRate: number = 3.0;
  
  // Success/failure examples
  successExamples: any[] = [];
  failureExamples: any[] = [];
  
  constructor(
    private neuralNetworkService: NeuralNetworkService,
    private sanitizer: DomSanitizer
  ) {}
  
  ngOnInit(): void {
    // Initialize with default network structure preview
    this.previewNetworkStructure();
  }
  
  // Info Section Toggle
  toggleInfoSection(): void {
    this.showInfoSection = !this.showInfoSection;
  }
  
  // Navigation Methods
  switchSection(section: 'learn' | 'create' | 'train' | 'test'): void {
    this.activeSection = section;
  }

  // Navigation progression methods
  continueToCreate(): void {
    this.switchSection('create');
  }

  continueToTrain(): void {
    this.switchSection('train');
  }

  continueToTest(): void {
    this.switchSection('test');
  }

  // Check if user can navigate to a section
  canNavigateToSection(section: 'learn' | 'create' | 'train' | 'test'): boolean {
    switch (section) {
      case 'learn':
        return true;
      case 'create':
        return true;
      case 'train':
        return !!this.networkId;
      case 'test':
        return !!this.networkId && this.trainingComplete;
      default:
        return false;
    }
  }
  
  // Network Configuration Methods
  updateLayerSizes(sizes: number[]): void {
    this.layerSizes = sizes;
  }
  
  previewNetworkStructure(): void {
    const layers = [784];
    layers.push(this.hiddenLayer1);
    if (this.useSecondLayer) {
      layers.push(this.hiddenLayer2);
    }
    layers.push(10);
    this.updateLayerSizes(layers);
  }
  
  createNetwork(): void {
    this.loading = true;
    
    // Reset all subsequent steps
    this.trainingStarted = false;
    this.trainingComplete = false;
    this.isTraining = false;
    this.trainingProgress = 0;
    this.finalAccuracy = null;
    this.currentTraining = null;
    this.currentExample = null;
    this.successExamples = [];
    this.failureExamples = [];
    this.showExamples = false;
    this.networkId = '';
    
    // Build layer sizes array with required input (784) and output (10) sizes
    const layerConfig = [784, this.hiddenLayer1];
    if (this.useSecondLayer) {
      layerConfig.push(this.hiddenLayer2);
    }
    // Add the required output size
    layerConfig.push(10);
    
    console.log('Creating network with layer sizes:', layerConfig);
    this.neuralNetworkService.createNetwork(layerConfig).subscribe({
      next: (response) => {
        this.networkId = response.network_id;
        this.loading = false;
        this.continueToTrain();
      },
      error: (error) => {
        console.error('Error creating network:', error);
        this.loading = false;
      }
    });
  }
  
  setNetworkId(id: string): void {
    this.networkId = id;
  }
  
  // Training Methods
  startTraining(): void {
    this.trainingLoading = true;
    
    const trainingConfig = {
      epochs: this.epochs,
      mini_batch_size: this.miniBatchSize,
      learning_rate: this.learningRate
    };
    
    this.neuralNetworkService.trainNetwork(this.networkId, trainingConfig).subscribe({
      next: (response) => {
        this.trainingStarted = true;
        this.isTraining = true;
        this.trainingLoading = false;
        this.monitorTrainingProgress();
      },
      error: (error) => {
        console.error('Error starting training:', error);
        this.trainingLoading = false;
      }
    });
  }
  
  monitorTrainingProgress(): void {
    // This is a placeholder - actual implementation would depend on your training service
    // You would typically poll the server or use websockets to get updates
    
    // For demo purposes, we'll simulate progress with realistic data
    // matching exactly the format of the real training events
    let progress = 0;
    let currentEpoch = 1;
    
    const interval = setInterval(() => {
      // Increment progress by the percentage completion of one epoch
      const progressPerEpoch = 100 / this.epochs;
      progress = Math.min(currentEpoch * progressPerEpoch, 100);
      this.trainingProgress = progress;
      
      // Calculate an accuracy that improves with each epoch (starting at 0.8369 like example)
      // Use values from the sample event data
      const baseAccuracy = 0.8369;
      const accuracyGain = (0.92 - baseAccuracy) * ((currentEpoch - 1) / this.epochs);
      const currentAccuracy = baseAccuracy + accuracyGain;
      
      // Simulate training data using the exact format from the event
      this.currentTraining = {
        job_id: "a82c53d7-e99d-470d-ae1e-8575e42e1926",
        network_id: this.networkId,
        epoch: currentEpoch,
        total_epochs: this.epochs,
        accuracy: currentAccuracy,
        elapsed_time: 2.65 + (currentEpoch - 1) * 0.5, // Increase time slightly per epoch
        progress: progress,
        correct: Math.floor(10000 * currentAccuracy),
        total: 10000
      };
      
      // Check if we've completed all epochs
      if (currentEpoch >= this.epochs) {
        clearInterval(interval);
        this.trainingComplete = true;
        this.isTraining = false;
        this.finalAccuracy = this.currentTraining.accuracy;
        this.loadExamplesForDisplay(); // Load examples when training completes
      } else {
        // Increment the epoch for the next update
        currentEpoch++;
      }
    }, 1000); // Update every second to make it more visible
  }
  
  onTrainingStatusChanged(training: boolean): void {
    this.isTraining = training;
  }
  
  // Example Methods
  loadSuccessfulExample(): void {
    this.loadingExample = true;
    console.log('Loading successful example for network:', this.networkId);
    
    // First check if the network is properly trained
    this.neuralNetworkService.getNetworkStats(this.networkId).subscribe({
      next: (stats) => {
        if (stats && stats.trained) {
          // Network is confirmed trained, now load examples
          this.loadExampleWithRetry(true);
        } else {
          console.warn('Network may not be fully trained yet:', stats);
          // Try anyway but with retry logic
          this.loadExampleWithRetry(true);
        }
      },
      error: (error) => {
        console.error('Error checking network stats:', error);
        this.loadingExample = false;
        // Create a fallback example for testing UI
        this.createFallbackExample(true);
      }
    });
  }
  
  // Helper to load examples with retry logic
  loadExampleWithRetry(successful: boolean, retryCount: number = 0): void {
    this.neuralNetworkService.getExamples(this.networkId, successful).subscribe({
      next: (example) => {
        console.log(`${successful ? 'Successful' : 'Unsuccessful'} example loaded:`, example);
        
        // Explicitly set the correct property based on the endpoint type
        this.currentExample = {
          ...example,
          correct: successful // Successful examples are correct, unsuccessful are not
        };
        
        this.imageLoaded = false; // Start with false, let the image load event set it to true
        this.loadingExample = false;
        // Ensure we're in the test section
        this.activeSection = 'test';
      },
      error: (error) => {
        console.error(`Error loading ${successful ? 'successful' : 'unsuccessful'} example:`, error);
        
        if (retryCount < 2) {
          console.log(`Retrying... attempt ${retryCount + 1}`);
          // Wait a moment and retry
          setTimeout(() => this.loadExampleWithRetry(successful, retryCount + 1), 1000);
        } else {
          this.loadingExample = false;
          // Create a fallback example for testing UI
          this.createFallbackExample(successful);
        }
      }
    });
  }
  
  loadUnsuccessfulExample(): void {
    this.loadingExample = true;
    console.log('Loading unsuccessful example for network:', this.networkId);
    
    // First check if the network is properly trained
    this.neuralNetworkService.getNetworkStats(this.networkId).subscribe({
      next: (stats) => {
        if (stats && stats.trained) {
          // Network is confirmed trained, now load examples
          this.loadExampleWithRetry(false);
        } else {
          console.warn('Network may not be fully trained yet:', stats);
          // Try anyway but with retry logic
          this.loadExampleWithRetry(false);
        }
      },
      error: (error) => {
        console.error('Error checking network stats:', error);
        this.loadingExample = false;
        // Create a fallback example for testing UI
        this.createFallbackExample(false);
      }
    });
  }
  
  // Get a random example (either successful or unsuccessful)
  getRandomExample(): void {
    const isSuccessful = Math.random() > 0.5; // 50/50 chance
    if (isSuccessful) {
      this.loadSuccessfulExample();
    } else {
      this.loadUnsuccessfulExample();
    }
  }

  // Helper method to create a fallback example if the API fails
  createFallbackExample(isSuccessful: boolean): void {
    console.log('Creating fallback example');
    const actual = isSuccessful ? 7 : 9;
    const predicted = isSuccessful ? 7 : 4;
    
    this.currentExample = {
      image_data: 'assets/fallback-digit.png', // You may need to create this fallback image
      actual_digit: actual,
      predicted_digit: predicted,
      correct: isSuccessful,
      network_output: Array(10).fill(0.05).map((v, i) => {
        if (i === predicted) return 0.8;
        return v;
      })
    };
    
    this.imageLoaded = false; // Will show the fallback digit
    this.activeSection = 'test';
  }
  
  handleImageError(event: any): void {
    console.error('Image failed to load:', event);
    console.error('Current image src:', event.target?.src);
    console.error('Current example image_data:', this.currentExample?.image_data);
    this.imageLoaded = false;
    
    // If the current image failed to load, try to re-sanitize the data
    if (this.currentExample && this.currentExample.image_data) {
      console.log('Attempting to fix image data...');
      const originalData = this.currentExample.image_data;
      
      // Try different approaches to fix the image data
      if (typeof originalData === 'string') {
        // If it looks like base64 without prefix, add it
        if (!originalData.startsWith('data:') && !originalData.startsWith('http')) {
          console.log('Adding base64 prefix...');
          const fixedSrc = `data:image/png;base64,${originalData}`;
          event.target.src = fixedSrc;
        }
      }
    }
  }
  
  onShowExamplesRequested(): void {
    this.showExamples = true;
    this.switchSection('test');
  }
  
  // Load success and failure examples for display
  loadExamplesForDisplay(): void {
    if (this.networkId && this.trainingComplete) {
      // Load 3 successful examples
      this.neuralNetworkService.getExamples(this.networkId, true).subscribe({
        next: (examples) => {
          if (Array.isArray(examples)) {
            this.successExamples = examples.slice(0, 3);
          } else {
            this.successExamples = [examples];
          }
        },
        error: (error) => console.error('Error loading success examples:', error)
      });

      // Load 3 failure examples
      this.neuralNetworkService.getExamples(this.networkId, false).subscribe({
        next: (examples) => {
          if (Array.isArray(examples)) {
            this.failureExamples = examples.slice(0, 3);
          } else {
            this.failureExamples = [examples];
          }
        },
        error: (error) => console.error('Error loading failure examples:', error)
      });
    }
  }

  // Sanitize image data for safe display in the browser
  sanitizeImageData(imageData: string): SafeResourceUrl {
    if (!imageData) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    
    // If already a data URI, sanitize and return
    if (imageData.startsWith('data:image/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(imageData);
    }
    
    // If it's a relative or absolute URL, return as is
    if (imageData.startsWith('http') || imageData.startsWith('assets/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(imageData);
    }
    
    // Assume it's base64 data and add the data URI prefix
    const dataUri = `data:image/png;base64,${imageData}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(dataUri);
  }

  // Calculate the maximum confidence from network output
  getMaxConfidence(networkOutput: number[]): string {
    if (!networkOutput || !Array.isArray(networkOutput)) {
      return '0.0';
    }
    const maxConfidence = Math.max(...networkOutput);
    return (maxConfidence * 100).toFixed(1);
  }
}
