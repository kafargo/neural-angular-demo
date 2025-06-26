import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { NetworkTestComponent } from './network-test.component';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { NetworkExample } from '../../interfaces/neural-network.interface';

describe('NetworkTestComponent', () => {
  let component: NetworkTestComponent;
  let fixture: ComponentFixture<NetworkTestComponent>;
  let neuralNetworkServiceSpy: jasmine.SpyObj<NeuralNetworkService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NeuralNetworkService', ['getExamples']);
    
    await TestBed.configureTestingModule({
      imports: [NetworkTestComponent, HttpClientTestingModule],
      providers: [
        { provide: NeuralNetworkService, useValue: spy }
      ]
    }).compileComponents();

    neuralNetworkServiceSpy = TestBed.inject(NeuralNetworkService) as jasmine.SpyObj<NeuralNetworkService>;
    fixture = TestBed.createComponent(NetworkTestComponent);
    component = fixture.componentInstance;
    component.networkId = 'test-network-id';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load successful example', () => {
    const mockExample: NetworkExample = {
      image_data: 'test-data',
      actual_digit: 7,
      predicted_digit: 7,
      correct: true,
      network_output: [0.1, 0.2, 0.8, 0.3, 0.1, 0.0, 0.0, 0.9, 0.2, 0.1]
    };
    
    neuralNetworkServiceSpy.getExamples.and.returnValue(of(mockExample));
    
    component.loadSuccessfulExample();
    
    expect(component.currentExample).toEqual(jasmine.objectContaining({
      actual_digit: 7,
      predicted_digit: 7,
      correct: true
    }));
    expect(component.loadingExample).toBe(false);
  });

  it('should load unsuccessful example', () => {
    const mockExample: NetworkExample = {
      image_data: 'test-data',
      actual_digit: 7,
      predicted_digit: 4,
      correct: false,
      network_output: [0.1, 0.2, 0.8, 0.3, 0.9, 0.0, 0.0, 0.3, 0.2, 0.1]
    };
    
    neuralNetworkServiceSpy.getExamples.and.returnValue(of(mockExample));
    
    component.loadUnsuccessfulExample();
    
    expect(component.currentExample).toEqual(jasmine.objectContaining({
      actual_digit: 7,
      predicted_digit: 4,
      correct: false
    }));
    expect(component.loadingExample).toBe(false);
  });

  it('should handle successful example loading error with fallback', () => {
    neuralNetworkServiceSpy.getExamples.and.returnValue(throwError(() => new Error('API Error')));
    
    component.loadSuccessfulExample();
    
    expect(component.currentExample).toBeDefined();
    expect(component.currentExample?.correct).toBe(true);
    expect(component.loadingExample).toBe(false);
  });

  it('should handle unsuccessful example loading error with fallback', () => {
    neuralNetworkServiceSpy.getExamples.and.returnValue(throwError(() => new Error('API Error')));
    
    component.loadUnsuccessfulExample();
    
    expect(component.currentExample).toBeDefined();
    expect(component.currentExample?.correct).toBe(false);
    expect(component.loadingExample).toBe(false);
  });

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

  it('should generate examples and show them', () => {
    const mockExamples: NetworkExample[] = [
      {
        image_data: 'test-data-1',
        actual_digit: 1,
        predicted_digit: 1,
        correct: true,
        network_output: [0.1, 0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      }
    ];
    
    neuralNetworkServiceSpy.getExamples.and.returnValue(of(mockExamples));
    
    component.generateExamples();
    
    expect(component.showExamples).toBe(true);
  });
});
