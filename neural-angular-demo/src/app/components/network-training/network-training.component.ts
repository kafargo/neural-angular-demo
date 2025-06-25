import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, interval } from 'rxjs';
import { switchMap, takeWhile, finalize } from 'rxjs/operators';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { TrainingWebSocketService, TrainingUpdate, ConnectionStatus } from '../../services/websocket/training-websocket.service';

@Component({
  selector: 'app-network-training',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network-training.component.html',
  styleUrls: ['./network-training.component.css']
})
export class NetworkTrainingComponent implements OnInit, OnDestroy {
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
  websocketSubscription: Subscription | null = null;
  
  // WebSocket related properties
  connectionStatus: ConnectionStatus = { connected: false };
  currentTraining: TrainingUpdate | null = null;
  useWebsocket: boolean = true; // Flag to enable/disable WebSocket usage
  
  constructor(
    private neuralNetworkService: NeuralNetworkService,
    private trainingWebSocketService: TrainingWebSocketService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to WebSocket connection status
    this.websocketSubscription = this.trainingWebSocketService
      .getConnectionStatus()
      .subscribe(status => {
        console.log('WebSocket connection status changed:', status);
        this.connectionStatus = status;
      });
  }
  
  ngOnDestroy(): void {
    if (this.trainingSubscription) {
      this.trainingSubscription.unsubscribe();
    }
    
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }
  
  startTraining(): void {
    this.loading = true;
    this.error = null;
    this.trainingComplete = false;
    
    // Reset previous training data
    if (this.trainingSubscription) {
      this.trainingSubscription.unsubscribe();
      this.trainingSubscription = null;
    }
    
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
        console.log('Training started, job ID:', this.jobId);
        
        // Use WebSocket for real-time updates if connected, otherwise fallback to polling
        if (this.useWebsocket && this.connectionStatus.connected) {
          console.log('Using WebSocket for training updates');
          this.subscribeToWebSocketUpdates();
        } else {
          console.log('WebSocket not connected, falling back to polling');
          this.pollTrainingStatus();
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to start training. Please try again.';
        console.error('Error starting training:', error);
      }
    });
  }
  
  subscribeToWebSocketUpdates(): void {
    // Subscribe to WebSocket updates specifically for this job
    this.trainingSubscription = this.trainingWebSocketService
      .getTrainingUpdatesForJob(this.jobId)
      .subscribe({
        next: (update) => {
          if (!update) return;
          
          console.log('WebSocket training update received for job', this.jobId, update);
          
          // Update component state with real-time information
          this.currentTraining = update;
          this.trainingProgress = update.progress;
          this.currentAccuracy = update.accuracy;
          
          // Check if training is complete (last epoch received)
          if (update.epoch === update.total_epochs) {
            this.trainingComplete = true;
            this.finalAccuracy = update.accuracy;
            this.trainingStatusChanged.emit(false);
            console.log('Training complete via WebSocket');
            
            // Unsubscribe since training is complete
            if (this.trainingSubscription) {
              this.trainingSubscription.unsubscribe();
              this.trainingSubscription = null;
            }
          }
        },
        error: (error) => {
          console.error('Error with WebSocket subscription:', error);
          // Fallback to polling if WebSocket fails
          this.pollTrainingStatus();
        }
      });
  }
  
  pollTrainingStatus(): void {
    const pollingInterval = 2000; // Poll every 2 seconds
    console.log('Starting polling for job', this.jobId);
    
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
          console.log('Polling training status:', response);
          this.trainingProgress = response.progress || 0;
          this.currentAccuracy = response.accuracy;
          
          if (response.status === 'completed') {
            this.trainingComplete = true;
            this.finalAccuracy = response.accuracy;
            this.trainingStatusChanged.emit(false);
            console.log('Training complete via polling');
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
  
  reconnectWebSocket(): void {
    this.trainingWebSocketService.reconnect();
  }

  showExamples(): void {
    this.showExamplesRequested.emit();
  }
}
