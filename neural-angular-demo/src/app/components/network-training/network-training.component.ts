import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, interval } from 'rxjs';
import { switchMap, takeWhile, finalize } from 'rxjs/operators';
import { NeuralNetworkService } from '../../services/neural-network.service';

@Component({
  selector: 'app-network-training',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network-training.component.html',
  styleUrls: ['./network-training.component.css']
})
export class NetworkTrainingComponent implements OnDestroy {
  @Input() networkId: string = '';
  @Output() trainingStatusChanged = new EventEmitter<boolean>();
  @Output() showExamplesRequested = new EventEmitter<void>();
  
  epochs: number = 10;
  miniBatchSize: number = 10;
  learningRate: number = 3.0;
  
  loading: boolean = false;
  error: string | null = null;
  
  trainingStarted: boolean = false;
  trainingComplete: boolean = false;
  trainingProgress: number = 0;
  currentAccuracy: number | null = null;
  finalAccuracy: number | null = null;
  
  jobId: string = '';
  trainingSubscription: Subscription | null = null;
  
  constructor(private neuralNetworkService: NeuralNetworkService) {}
  
  ngOnDestroy(): void {
    if (this.trainingSubscription) {
      this.trainingSubscription.unsubscribe();
    }
  }
  
  startTraining(): void {
    this.loading = true;
    this.error = null;
    
    this.neuralNetworkService.trainNetwork(
      this.networkId,
      this.epochs,
      this.miniBatchSize,
      this.learningRate
    ).subscribe({
      next: (response) => {
        this.loading = false;
        this.trainingStarted = true;
        this.jobId = response.job_id;
        this.trainingStatusChanged.emit(true);
        
        // Start polling for training status
        this.pollTrainingStatus();
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to start training. Please try again.';
        console.error('Error starting training:', error);
      }
    });
  }
  
  pollTrainingStatus(): void {
    const pollingInterval = 2000; // Poll every 2 seconds
    
    this.trainingSubscription = interval(pollingInterval)
      .pipe(
        switchMap(() => this.neuralNetworkService.getTrainingStatus(this.jobId)),
        takeWhile((response) => response.status !== 'completed' && response.status !== 'failed', true),
        finalize(() => {
          if (this.trainingProgress < 100) {
            this.trainingProgress = 100;
          }
        })
      )
      .subscribe({
        next: (response) => {
          this.trainingProgress = response.progress || 0;
          this.currentAccuracy = response.accuracy;
          
          if (response.status === 'completed') {
            this.trainingComplete = true;
            this.finalAccuracy = response.accuracy;
            this.trainingStatusChanged.emit(false);
          } else if (response.status === 'failed') {
            this.error = 'Training failed. Please try again.';
            this.trainingStarted = false;
            this.trainingStatusChanged.emit(false);
          }
        },
        error: (error) => {
          this.error = 'Error checking training status. Please refresh the page.';
          console.error('Error polling training status:', error);
        }
      });
  }
  
  showExamples(): void {
    this.showExamplesRequested.emit();
  }
}
