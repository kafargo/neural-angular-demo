import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
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
      {
        epochs: this.epochs,
        mini_batch_size: this.miniBatchSize,
        learning_rate: this.learningRate
      }
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
          
          // Use the exact values from the update object without modification
          this.currentTraining = update;
          
          // Directly use the progress value from the event
          this.trainingProgress = update.progress;
          
          // Directly use the accuracy value from the event
          this.currentAccuracy = update.accuracy;
          
          // All other values (correct, total, elapsed_time, etc.) will be accessed
          // directly from the currentTraining object in the template
          
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
            
            // Verify network stats before allowing example loading
            // Add a slight delay to ensure the training has fully completed on the server
            setTimeout(() => this.checkNetworkStats(), 1000);
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
          
          // Format the response from polling to match the TrainingUpdate interface
          this.currentTraining = {
            job_id: this.jobId,
            network_id: this.networkId,
            epoch: response.current_epoch || 0,
            total_epochs: this.epochs,
            accuracy: response.accuracy,
            elapsed_time: response.elapsed_time || 0,
            progress: response.progress || 0,
            correct: response.correct || 0,
            total: response.total || 0
          };
          
          // Use values directly from the response
          this.trainingProgress = this.currentTraining.progress;
          this.currentAccuracy = this.currentTraining.accuracy;
          
          if (response.status === 'completed') {
            this.trainingComplete = true;
            this.finalAccuracy = this.currentTraining.accuracy;
            this.trainingStatusChanged.emit(false);
            console.log('Training complete via polling');
            
            // Verify network stats before allowing example loading
            // Add a slight delay to ensure the training has fully completed on the server
            setTimeout(() => this.checkNetworkStats(), 1000);
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
  
  // Check network status after training completion
  checkNetworkStats(): void {
    console.log('Verifying network status after training...');
    this.neuralNetworkService.getNetworkStats(this.networkId).subscribe({
      next: (stats) => {
        console.log('Network stats retrieved:', stats);
        // Emit an event with network stats to notify parent components
        if (stats && stats.accuracy) {
          this.finalAccuracy = stats.accuracy;
          this.showExamplesRequested.emit();
        } else {
          console.warn('Network stats retrieved but no accuracy data found');
        }
      },
      error: (error) => {
        console.error('Error getting network stats:', error);
        this.error = 'Failed to verify network status. Examples may not load correctly.';
      }
    });
  }
}
