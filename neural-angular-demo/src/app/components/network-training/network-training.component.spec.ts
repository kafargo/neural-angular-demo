import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { NetworkTrainingComponent } from './network-training.component';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { AppStateService } from '../../services/app-state.service';
import { LoggerService } from '../../services/logger.service';
import { TrainingWebSocketService } from '../../services/websocket/training-websocket.service';

describe('NetworkTrainingComponent', () => {
  let component: NetworkTrainingComponent;
  let fixture: ComponentFixture<NetworkTrainingComponent>;
  let neuralNetworkServiceSpy: jasmine.SpyObj<NeuralNetworkService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let appStateSpy: jasmine.SpyObj<AppStateService>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;
  let websocketSpy: jasmine.SpyObj<TrainingWebSocketService>;

  beforeEach(async () => {
    const networkSpy = jasmine.createSpyObj('NeuralNetworkService', ['trainNetwork']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const appStateSpyObj = jasmine.createSpyObj('AppStateService', ['setTrainingConfig', 'setTrainingComplete', 'setActiveSection', 'setFinalAccuracy', 'networkId', 'trainingConfig', 'finalAccuracy']);
    const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error', 'log']);
    const websocketSpyObj = jasmine.createSpyObj('TrainingWebSocketService', ['connect', 'disconnect', 'getTrainingUpdates', 'getTrainingComplete', 'getTrainingError']);
    
    // Mock observables for websocket
    websocketSpyObj.getTrainingUpdates.and.returnValue(of());
    websocketSpyObj.getTrainingComplete.and.returnValue(of());
    websocketSpyObj.getTrainingError.and.returnValue(of());
    
    Object.defineProperty(appStateSpyObj, 'networkId', {
      get: () => 'test-network-id'
    });
    Object.defineProperty(appStateSpyObj, 'trainingConfig', {
      get: () => ({ epochs: 10, miniBatchSize: 10, learningRate: 3.0 })
    });
    Object.defineProperty(appStateSpyObj, 'finalAccuracy', {
      get: () => null
    });
    
    await TestBed.configureTestingModule({
      imports: [NetworkTrainingComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: NeuralNetworkService, useValue: networkSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: AppStateService, useValue: appStateSpyObj },
        { provide: LoggerService, useValue: loggerSpyObj },
        { provide: TrainingWebSocketService, useValue: websocketSpyObj }
      ]
    }).compileComponents();

    neuralNetworkServiceSpy = TestBed.inject(NeuralNetworkService) as jasmine.SpyObj<NeuralNetworkService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    appStateSpy = TestBed.inject(AppStateService) as jasmine.SpyObj<AppStateService>;
    loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    websocketSpy = TestBed.inject(TrainingWebSocketService) as jasmine.SpyObj<TrainingWebSocketService>;
    fixture = TestBed.createComponent(NetworkTrainingComponent);
    component = fixture.componentInstance;
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

  it('should update app state when configuration is updated', () => {
    component.onConfigChange();
    
    expect(appStateSpy.setTrainingConfig).toHaveBeenCalledWith(component.trainingConfig);
  });

  it('should start training successfully', () => {
    const mockResponse = { job_id: 'test-job-id', network_id: 'test-network-id', message: 'Training started' };
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
    // Override the networkId getter for this test
    Object.defineProperty(appStateSpy, 'networkId', {
      get: () => '',
      configurable: true
    });
    component.ngOnInit();
    
    component.startTraining();
    
    expect(component.error).toBe('No network available for training');
  });

  it('should navigate to test section when continue is clicked', () => {
    component.onContinueToTest();
    
    expect(appStateSpy.setActiveSection).toHaveBeenCalledWith('test');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/test']);
  });
});
