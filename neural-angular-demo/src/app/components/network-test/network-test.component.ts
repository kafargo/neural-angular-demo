import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { ExampleDisplayComponent } from '../example-display/example-display.component';
import { NetworkExample } from '../../interfaces/neural-network.interface';

@Component({
  selector: 'app-network-test',
  standalone: true,
  imports: [CommonModule, ExampleDisplayComponent],
  templateUrl: './network-test.component.html',
  styleUrls: ['./network-test.component.css']
})
export class NetworkTestComponent {
  @Input() networkId = '';

  currentExample: NetworkExample | null = null;
  successExamples: NetworkExample[] = [];
  failureExamples: NetworkExample[] = [];
  loadingExample = false;
  showExamples = false;
  error: string | null = null;

  constructor(private neuralNetworkService: NeuralNetworkService) {}

  loadRandomExample(): void {
    const isSuccessful = Math.random() > 0.5;
    if (isSuccessful) {
      this.loadSuccessfulExample();
    } else {
      this.loadUnsuccessfulExample();
    }
  }

  loadSuccessfulExample(): void {
    if (!this.networkId) {
      this.error = 'No trained network available';
      return;
    }

    this.loadingExample = true;
    this.error = null;
    
    this.neuralNetworkService.getExamples(this.networkId, true).subscribe({
      next: (example) => {
        this.currentExample = {
          ...example,
          correct: true
        };
        this.loadingExample = false;
      },
      error: (error) => {
        console.error('Error loading successful example:', error);
        this.loadingExample = false;
        this.createFallbackExample(true);
      }
    });
  }

  loadUnsuccessfulExample(): void {
    if (!this.networkId) {
      this.error = 'No trained network available';
      return;
    }

    this.loadingExample = true;
    this.error = null;
    
    this.neuralNetworkService.getExamples(this.networkId, false).subscribe({
      next: (example) => {
        this.currentExample = {
          ...example,
          correct: false
        };
        this.loadingExample = false;
      },
      error: (error) => {
        console.error('Error loading unsuccessful example:', error);
        this.loadingExample = false;
        this.createFallbackExample(false);
      }
    });
  }

  generateExamples(): void {
    if (!this.networkId) {
      this.error = 'No trained network available';
      return;
    }

    this.loadExamplesForDisplay();
    this.showExamples = true;
  }

  private loadExamplesForDisplay(): void {
    // Load success examples
    this.neuralNetworkService.getExamples(this.networkId, true).subscribe({
      next: (examples) => {
        if (Array.isArray(examples)) {
          this.successExamples = examples.slice(0, 3).map(ex => ({ ...ex, correct: true }));
        } else {
          this.successExamples = [{ ...examples, correct: true }];
        }
      },
      error: (error) => {
        console.error('Error loading success examples:', error);
        this.successExamples = this.createFallbackExamples(true, 3);
      }
    });

    // Load failure examples
    this.neuralNetworkService.getExamples(this.networkId, false).subscribe({
      next: (examples) => {
        if (Array.isArray(examples)) {
          this.failureExamples = examples.slice(0, 3).map(ex => ({ ...ex, correct: false }));
        } else {
          this.failureExamples = [{ ...examples, correct: false }];
        }
      },
      error: (error) => {
        console.error('Error loading failure examples:', error);
        this.failureExamples = this.createFallbackExamples(false, 3);
      }
    });
  }

  private createFallbackExample(isSuccessful: boolean): void {
    const actual = isSuccessful ? 7 : 9;
    const predicted = isSuccessful ? 7 : 4;
    
    this.currentExample = {
      image_data: 'assets/fallback-digit.png',
      actual_digit: actual,
      predicted_digit: predicted,
      correct: isSuccessful,
      network_output: Array(10).fill(0.05).map((v, i) => {
        if (i === predicted) return 0.8;
        return v;
      })
    };
  }

  private createFallbackExamples(isSuccessful: boolean, count: number): NetworkExample[] {
    const examples: NetworkExample[] = [];
    
    for (let i = 0; i < count; i++) {
      const actual = isSuccessful ? i + 1 : i + 6;
      const predicted = isSuccessful ? actual : (actual + 2) % 10;
      
      examples.push({
        image_data: 'assets/fallback-digit.png',
        actual_digit: actual,
        predicted_digit: predicted,
        correct: isSuccessful,
        network_output: Array(10).fill(0.05).map((v, j) => {
          if (j === predicted) return 0.7 + (i * 0.1);
          return v;
        })
      });
    }
    
    return examples;
  }
}
