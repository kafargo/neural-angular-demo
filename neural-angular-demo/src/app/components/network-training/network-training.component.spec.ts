import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { NetworkTrainingComponent } from './network-training.component';
import { NeuralNetworkService } from '../../services/neural-network.service';

describe('NetworkTrainingComponent', () => {
  let component: NetworkTrainingComponent;
  let fixture: ComponentFixture<NetworkTrainingComponent>;
  let neuralNetworkServiceSpy: jasmine.SpyObj<NeuralNetworkService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NeuralNetworkService', ['trainNetwork']);
    
    await TestBed.configureTestingModule({
      imports: [NetworkTrainingComponent, FormsModule, HttpClientTestingModule],
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

  it('should have default training configuration', () => {
    expect(component.trainingConfig.epochs).toBe(10);
    expect(component.trainingConfig.miniBatchSize).toBe(10);
    expect(component.trainingConfig.learningRate).toBe(3.0);
  });

  it('should emit config change when configuration is updated', () => {
    spyOn(component.trainingConfigChange, 'emit');
    
    component.onConfigChange();
    
    expect(component.trainingConfigChange.emit).toHaveBeenCalledWith(component.trainingConfig);
  });

  it('should start training successfully', () => {
    const mockResponse = { job_id: 'test-job-id' };
    neuralNetworkServiceSpy.trainNetwork.and.returnValue(of(mockResponse));
    
    component.startTraining();
    
    expect(component.trainingStarted).toBe(true);
    expect(component.isTraining).toBe(true);
    expect(component.trainingLoading).toBe(false);
  });

  it('should handle training start error', () => {
    neuralNetworkServiceSpy.trainNetwork.and.returnValue(throwError(() => new Error('API Error')));
    
    component.startTraining();
    
    expect(component.trainingLoading).toBe(false);
    expect(component.error).toBe('Failed to start training. Please try again.');
  });

  it('should not start training without network ID', () => {
    component.networkId = '';
    
    component.startTraining();
    
    expect(component.error).toBe('No network available for training');
  });

  it('should emit continue to test when continue is clicked', () => {
    spyOn(component.continueToTest, 'emit');
    
    component.onContinueToTest();
    
    expect(component.continueToTest.emit).toHaveBeenCalled();
  });
});
