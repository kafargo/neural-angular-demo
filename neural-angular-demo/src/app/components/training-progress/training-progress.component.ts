import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingUpdate } from '../../interfaces/neural-network.interface';

@Component({
  selector: 'app-training-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-progress.component.html',
  styleUrls: ['./training-progress.component.css']
})
export class TrainingProgressComponent {
  @Input() currentTraining: TrainingUpdate | null = null;
  @Input() trainingProgress = 0;
  @Input() trainingComplete = false;
  @Input() finalAccuracy: number | null = null;

  getAccuracyPercentage(): number {
    return this.currentTraining ? this.currentTraining.accuracy * 100 : 0;
  }

  getElapsedTime(): string {
    return this.currentTraining ? this.currentTraining.elapsed_time.toFixed(1) : '0.0';
  }
}
