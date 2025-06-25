import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { NetworkTrainingComponent } from './network-training.component';
import { NeuralNetworkService } from '../../services/neural-network.service';

describe('NetworkTrainingComponent', () => {
  let component: NetworkTrainingComponent;
  let fixture: ComponentFixture<NetworkTrainingComponent>;
  let neuralNetworkServiceSpy: jasmine.SpyObj<NeuralNetworkService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NeuralNetworkService', [
      'trainNetwork', 
      'getTrainingStatus'
    ]);
    
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      providers: [
        { provide: NeuralNetworkService, useValue: spy }
      ]
    }).compileComponents();

    neuralNetworkServiceSpy = TestBed.inject(NeuralNetworkService) as jasmine.SpyObj<NeuralNetworkService>;
    fixture = TestBed.createComponent(NetworkTrainingComponent);
    component = fixture.componentInstance;
    component.networkId = 'test-network-id';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start training successfully', () => {
    const mockResponse = { job_id: 'test-job-id' };
    neuralNetworkServiceSpy.trainNetwork.and.returnValue(of(mockResponse));
    
    spyOn(component.trainingStatusChanged, 'emit');
    spyOn(component, 'pollTrainingStatus');
    
    component.startTraining();
    
    expect(neuralNetworkServiceSpy.trainNetwork).toHaveBeenCalledWith(
      'test-network-id',
      10,
      10,
      3.0
    );
    expect(component.trainingStarted).toBe(true);
    expect(component.jobId).toBe('test-job-id');
    expect(component.trainingStatusChanged.emit).toHaveBeenCalledWith(true);
    expect(component.pollTrainingStatus).toHaveBeenCalled();
  });

  it('should handle training error', () => {
    neuralNetworkServiceSpy.trainNetwork.and.returnValue(throwError(() => new Error('Training error')));
    
    component.startTraining();
    
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Failed to start training. Please try again.');
  });

  it('should emit event when requesting to show examples', () => {
    spyOn(component.showExamplesRequested, 'emit');
    component.showExamples();
    expect(component.showExamplesRequested.emit).toHaveBeenCalled();
  });
});
