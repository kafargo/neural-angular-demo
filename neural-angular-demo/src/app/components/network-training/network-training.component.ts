import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { AppStateService } from '../../services/app-state.service';
import { LoggerService } from '../../services/logger.service';
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
  private trainingInterval?: ReturnType<typeof setInterval>;
  
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
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    // Load state from the service
    this.networkId = this.appState.networkId;
    this.trainingConfig = { ...this.appState.trainingConfig };
    this.finalAccuracy = this.appState.finalAccuracy;
  }

  ngOnDestroy(): void {
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
    }
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
    
    const config = {
      epochs: this.trainingConfig.epochs,
      mini_batch_size: this.trainingConfig.miniBatchSize,
      learning_rate: this.trainingConfig.learningRate
    };
    
    this.neuralNetworkService.trainNetwork(this.networkId, config)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.trainingStarted = true;
          this.isTraining = true;
          this.trainingLoading = false;
          this.monitorTrainingProgress();
        },
        error: (error) => {
          this.logger.error('Error starting training:', error);
          this.trainingLoading = false;
          this.error = 'Failed to start training. Please try again.';
        }
      });
  }

  private monitorTrainingProgress(): void {
    // Simulate training progress for demo purposes
    let progress = 0;
    let currentEpoch = 1;
    
    this.trainingInterval = setInterval(() => {
      const progressPerEpoch = 100 / this.trainingConfig.epochs;
      progress = Math.min(currentEpoch * progressPerEpoch, 100);
      this.trainingProgress = progress;
      
      // Calculate improving accuracy
      const baseAccuracy = 0.8369;
      const accuracyGain = (0.92 - baseAccuracy) * ((currentEpoch - 1) / this.trainingConfig.epochs);
      const currentAccuracy = baseAccuracy + accuracyGain;
      
      this.currentTraining = {
        job_id: "training-job",
        network_id: this.networkId,
        epoch: currentEpoch,
        total_epochs: this.trainingConfig.epochs,
        accuracy: currentAccuracy,
        elapsed_time: 2.65 + (currentEpoch - 1) * 0.5,
        progress: progress,
        correct: Math.floor(10000 * currentAccuracy),
        total: 10000
      };
      
      if (currentEpoch >= this.trainingConfig.epochs) {
        if (this.trainingInterval) {
          clearInterval(this.trainingInterval);
        }
        this.completeTraining();
      } else {
        currentEpoch++;
      }
    }, 1000);
  }

  private completeTraining(): void {
    this.trainingStarted = false;
    this.isTraining = false;
    this.finalAccuracy = this.currentTraining?.accuracy || 0;
    this.appState.setTrainingComplete(true);
    this.appState.setFinalAccuracy(this.finalAccuracy);
  }

  onContinueToTest(): void {
    this.appState.setActiveSection('test');
    this.router.navigate(['/test']);
  }
}
