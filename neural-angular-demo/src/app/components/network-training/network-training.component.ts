import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { AppStateService } from '../../services/app-state.service';
import { LoggerService } from '../../services/logger.service';
import { TrainingWebSocketService } from '../../services/websocket/training-websocket.service';
import { TrainingProgressComponent } from '../training-progress/training-progress.component';
import { TrainingConfig, TrainingUpdate } from '../../interfaces/neural-network.interface';

@Component({
  selector: 'app-network-training',
  standalone: true,
  imports: [CommonModule, FormsModule, TrainingProgressComponent],
  templateUrl: './network-training.component.html',
  styleUrls: ['./network-training.component.css']
})
export class NetworkTrainingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private currentJobId: string | null = null;
  
  networkId = '';
  trainingConfig: TrainingConfig = {
    epochs: 10,
    miniBatchSize: 10,
    learningRate: 3.0
  };

  trainingLoading = false;
  trainingStarted = false;
  trainingProgress = 0;
  isTraining = false;
  finalAccuracy: number | null = null;
  currentTraining: TrainingUpdate | null = null;
  error: string | null = null;

  constructor(
    private router: Router,
    private neuralNetworkService: NeuralNetworkService,
    private appState: AppStateService,
    private logger: LoggerService,
    private websocketService: TrainingWebSocketService
  ) {}

  ngOnInit(): void {
    // Load state from the service
    this.networkId = this.appState.networkId;
    this.trainingConfig = { ...this.appState.trainingConfig };
    this.finalAccuracy = this.appState.finalAccuracy;

    // Subscribe to training updates
    this.websocketService.getTrainingUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        if (update && this.currentJobId && update.job_id === this.currentJobId) {
          this.handleTrainingUpdate(update);
        }
      });

    // Subscribe to training completion
    this.websocketService.getTrainingComplete()
      .pipe(takeUntil(this.destroy$))
      .subscribe(completion => {
        if (completion && this.currentJobId && completion.job_id === this.currentJobId) {
          this.handleTrainingComplete(completion);
        }
      });

    // Subscribe to training errors
    this.websocketService.getTrainingError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error && this.currentJobId && error.job_id === this.currentJobId) {
          this.handleTrainingError(error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onConfigChange(): void {
    this.appState.setTrainingConfig(this.trainingConfig);
  }

  startTraining(): void {
    if (!this.networkId) {
      this.error = 'No network available for training';
      return;
    }

    this.trainingLoading = true;
    this.error = null;
    this.finalAccuracy = null;
    this.currentTraining = null;
    this.trainingProgress = 0;
    
    const config = {
      epochs: this.trainingConfig.epochs,
      mini_batch_size: this.trainingConfig.miniBatchSize,
      learning_rate: this.trainingConfig.learningRate
    };
    
    this.neuralNetworkService.trainNetwork(this.networkId, config)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentJobId = response.job_id;
          this.trainingStarted = true;
          this.isTraining = true;
          this.trainingLoading = false;
          this.logger.log('Training started with job ID:', this.currentJobId);
        },
        error: (error) => {
          this.logger.error('Error starting training:', error);
          this.trainingLoading = false;
          this.error = 'Failed to start training. Please try again.';
        }
      });
  }

  private handleTrainingUpdate(update: TrainingUpdate): void {
    this.logger.log('Handling training update:', update);
    this.currentTraining = update;
    this.trainingProgress = update.progress;
    
    // DO NOT set isTraining = false here!
    // Wait for the training_complete event
  }

  private handleTrainingComplete(completion: any): void {
    this.logger.log('Training completed:', completion);
    
    // Now we can safely mark training as complete
    this.isTraining = false;
    this.trainingStarted = false;
    this.finalAccuracy = completion.accuracy;
    this.trainingProgress = 100;
    
    // Update app state
    this.appState.setTrainingComplete(true);
    this.appState.setFinalAccuracy(this.finalAccuracy);
    
    // Clear the job ID
    this.currentJobId = null;
  }

  private handleTrainingError(error: any): void {
    this.logger.error('Training error:', error);
    
    // Mark training as stopped
    this.isTraining = false;
    this.trainingStarted = false;
    this.error = error.error || 'Training failed. Please try again.';
    
    // Clear the job ID
    this.currentJobId = null;
  }

  onContinueToTest(): void {
    this.appState.setActiveSection('test');
    this.router.navigate(['/test']);
  }
}
