import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { TrainingProgressComponent } from '../training-progress/training-progress.component';
import { TrainingConfig, TrainingUpdate } from '../../interfaces/neural-network.interface';

@Component({
  selector: 'app-network-training',
  standalone: true,
  imports: [CommonModule, FormsModule, TrainingProgressComponent],
  templateUrl: './network-training.component.html',
  styleUrls: ['./network-training.component.css']
})
export class NetworkTrainingComponent {
  @Input() networkId = '';
  @Input() trainingConfig: TrainingConfig = {
    epochs: 10,
    miniBatchSize: 10,
    learningRate: 3.0
  };

  @Output() trainingConfigChange = new EventEmitter<TrainingConfig>();
  @Output() trainingComplete = new EventEmitter<number>();
  @Output() continueToTest = new EventEmitter<void>();

  trainingLoading = false;
  trainingStarted = false;
  trainingProgress = 0;
  isTraining = false;
  finalAccuracy: number | null = null;
  currentTraining: TrainingUpdate | null = null;
  error: string | null = null;

  constructor(private neuralNetworkService: NeuralNetworkService) {}

  onConfigChange(): void {
    this.trainingConfigChange.emit(this.trainingConfig);
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
    
    this.neuralNetworkService.trainNetwork(this.networkId, config).subscribe({
      next: (response) => {
        this.trainingStarted = true;
        this.isTraining = true;
        this.trainingLoading = false;
        this.monitorTrainingProgress();
      },
      error: (error) => {
        console.error('Error starting training:', error);
        this.trainingLoading = false;
        this.error = 'Failed to start training. Please try again.';
      }
    });
  }

  private monitorTrainingProgress(): void {
    // Simulate training progress for demo purposes
    let progress = 0;
    let currentEpoch = 1;
    
    const interval = setInterval(() => {
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
        clearInterval(interval);
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
    this.trainingComplete.emit(this.finalAccuracy);
  }

  onContinueToTest(): void {
    this.continueToTest.emit();
  }
}
