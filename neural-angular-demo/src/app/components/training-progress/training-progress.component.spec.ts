import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainingProgressComponent } from './training-progress.component';
import { TrainingUpdate } from '../../interfaces/neural-network.interface';

describe('TrainingProgressComponent', () => {
  let component: TrainingProgressComponent;
  let fixture: ComponentFixture<TrainingProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingProgressComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return 0 accuracy when no training data', () => {
    component.currentTraining = null;
    expect(component.getAccuracyPercentage()).toBe(0);
  });

  it('should calculate accuracy percentage correctly', () => {
    const mockTraining: TrainingUpdate = {
      job_id: 'test',
      network_id: 'test',
      epoch: 1,
      total_epochs: 10,
      accuracy: 0.85,
      elapsed_time: 5.5,
      progress: 10,
      correct: 8500,
      total: 10000
    };
    
    component.currentTraining = mockTraining;
    expect(component.getAccuracyPercentage()).toBe(85);
  });

  it('should format elapsed time correctly', () => {
    const mockTraining: TrainingUpdate = {
      job_id: 'test',
      network_id: 'test',
      epoch: 1,
      total_epochs: 10,
      accuracy: 0.85,
      elapsed_time: 5.567,
      progress: 10,
      correct: 8500,
      total: 10000
    };
    
    component.currentTraining = mockTraining;
    expect(component.getElapsedTime()).toBe('5.6');
  });

  it('should return 0.0 elapsed time when no training data', () => {
    component.currentTraining = null;
    expect(component.getElapsedTime()).toBe('0.0');
  });
});
