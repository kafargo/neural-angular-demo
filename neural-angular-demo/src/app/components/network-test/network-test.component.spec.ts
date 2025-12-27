import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { NetworkTestComponent } from './network-test.component';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { AppStateService } from '../../services/app-state.service';
import { LoggerService } from '../../services/logger.service';
import { NetworkExample } from '../../interfaces/neural-network.interface';

describe('NetworkTestComponent', () => {
  let component: NetworkTestComponent;
  let fixture: ComponentFixture<NetworkTestComponent>;
  let neuralNetworkServiceSpy: jasmine.SpyObj<NeuralNetworkService>;
  let appStateSpy: jasmine.SpyObj<AppStateService>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(async () => {
    const networkSpy = jasmine.createSpyObj('NeuralNetworkService', ['getExamples']);
    const appStateSpyObj = jasmine.createSpyObj('AppStateService', ['networkId']);
    const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error', 'log']);
    
    Object.defineProperty(appStateSpyObj, 'networkId', {
      get: () => 'test-network-id'
    });
    
    await TestBed.configureTestingModule({
      imports: [NetworkTestComponent, HttpClientTestingModule],
      providers: [
        { provide: NeuralNetworkService, useValue: networkSpy },
        { provide: AppStateService, useValue: appStateSpyObj },
        { provide: LoggerService, useValue: loggerSpyObj }
      ]
    }).compileComponents();

    neuralNetworkServiceSpy = TestBed.inject(NeuralNetworkService) as jasmine.SpyObj<NeuralNetworkService>;
    appStateSpy = TestBed.inject(AppStateService) as jasmine.SpyObj<AppStateService>;
    loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    fixture = TestBed.createComponent(NetworkTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load successful example', fakeAsync(() => {
    const mockExample: NetworkExample = {
      image_data: 'test-data',
      actual_digit: 7,
      predicted_digit: 7,
      correct: true,
      network_output: [0.1, 0.2, 0.8, 0.3, 0.1, 0.0, 0.0, 0.9, 0.2, 0.1]
    };
    
    neuralNetworkServiceSpy.getExamples.and.returnValue(of(mockExample));
    
    component.loadSuccessfulExample();
    tick();
    
    expect(component.currentExample).toEqual(jasmine.objectContaining({
      actual_digit: 7,
      predicted_digit: 7,
      correct: true
    }));
    expect(component.loadingExample).toBe(false);
  }));

  it('should load unsuccessful example', fakeAsync(() => {
    const mockExample: NetworkExample = {
      image_data: 'test-data',
      actual_digit: 7,
      predicted_digit: 4,
      correct: false,
      network_output: [0.1, 0.2, 0.8, 0.3, 0.9, 0.0, 0.0, 0.3, 0.2, 0.1]
    };
    
    neuralNetworkServiceSpy.getExamples.and.returnValue(of(mockExample));
    
    component.loadUnsuccessfulExample();
    tick();
    
    expect(component.currentExample).toEqual(jasmine.objectContaining({
      actual_digit: 7,
      predicted_digit: 4,
      correct: false
    }));
    expect(component.loadingExample).toBe(false);
  }));

  it('should handle successful example loading error with fallback', fakeAsync(() => {
    neuralNetworkServiceSpy.getExamples.and.returnValue(throwError(() => new Error('API Error')));
    
    component.loadSuccessfulExample();
    tick();
    
    expect(component.currentExample).toBeDefined();
    expect(component.currentExample?.correct).toBe(true);
    expect(component.loadingExample).toBe(false);
  }));

  it('should handle unsuccessful example loading error with fallback', fakeAsync(() => {
    neuralNetworkServiceSpy.getExamples.and.returnValue(throwError(() => new Error('API Error')));
    
    component.loadUnsuccessfulExample();
    tick();
    
    expect(component.currentExample).toBeDefined();
    expect(component.currentExample?.correct).toBe(false);
    expect(component.loadingExample).toBe(false);
  }));

  it('should set error when no network ID for successful example', () => {
    component.networkId = '';
    
    component.loadSuccessfulExample();
    
    expect(component.error).toBe('No trained network available');
  });

  it('should set error when no network ID for unsuccessful example', () => {
    component.networkId = '';
    
    component.loadUnsuccessfulExample();
    
    expect(component.error).toBe('No trained network available');
  });

  it('should generate examples and show them', fakeAsync(() => {
    const mockExample: NetworkExample = {
      image_data: 'test-data-1',
      actual_digit: 1,
      predicted_digit: 1,
      correct: true,
      network_output: [0.1, 0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    };
    
    neuralNetworkServiceSpy.getExamples.and.returnValue(of(mockExample));
    
    component.generateExamples();
    tick();
    
    expect(component.showExamples).toBe(true);
  }));
});
