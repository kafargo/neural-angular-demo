import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ExampleDisplayComponent } from './example-display.component';
import { NeuralNetworkService } from '../../services/neural-network.service';

describe('ExampleDisplayComponent', () => {
  let component: ExampleDisplayComponent;
  let fixture: ComponentFixture<ExampleDisplayComponent>;
  let neuralNetworkServiceSpy: jasmine.SpyObj<NeuralNetworkService>;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    const networkSpy = jasmine.createSpyObj('NeuralNetworkService', [
      'getSuccessfulExample', 
      'getUnsuccessfulExample'
    ]);
    
    const domSpy = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustUrl'
    ]);
    
    domSpy.bypassSecurityTrustUrl.and.callFake((url: string) => url);
    
    await TestBed.configureTestingModule({
      providers: [
        { provide: NeuralNetworkService, useValue: networkSpy },
        { provide: DomSanitizer, useValue: domSpy }
      ]
    }).compileComponents();

    neuralNetworkServiceSpy = TestBed.inject(NeuralNetworkService) as jasmine.SpyObj<NeuralNetworkService>;
    sanitizerSpy = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
    
    fixture = TestBed.createComponent(ExampleDisplayComponent);
    component = fixture.componentInstance;
    component.networkId = 'test-network-id';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a successful example', () => {
    const mockResponse = {
      example_index: 123,
      predicted_digit: 7,
      actual_digit: 7,
      image_data: 'data:image/png;base64,testbase64data',
      network_output: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3, 0.0, 0.0]
    };
    
    neuralNetworkServiceSpy.getSuccessfulExample.and.returnValue(of(mockResponse));
    
    component.loadSuccessfulExample();
    
    expect(neuralNetworkServiceSpy.getSuccessfulExample).toHaveBeenCalledWith('test-network-id');
    expect(component.loadingExample).toBe(false);
    expect(component.currentExample?.predicted_digit).toBe(7);
    expect(component.currentExample?.actual_digit).toBe(7);
    expect(component.currentExample?.correct).toBe(true);
  });

  it('should load an unsuccessful example', () => {
    const mockResponse = {
      example_index: 456,
      predicted_digit: 3,
      actual_digit: 5,
      image_data: 'data:image/png;base64,testbase64data',
      network_output: [0.1, 0.1, 0.1, 0.3, 0.1, 0.2, 0.1, 0.0, 0.0, 0.0]
    };
    
    neuralNetworkServiceSpy.getUnsuccessfulExample.and.returnValue(of(mockResponse));
    
    component.loadUnsuccessfulExample();
    
    expect(neuralNetworkServiceSpy.getUnsuccessfulExample).toHaveBeenCalledWith('test-network-id');
    expect(component.loadingExample).toBe(false);
    expect(component.currentExample?.predicted_digit).toBe(3);
    expect(component.currentExample?.actual_digit).toBe(5);
    expect(component.currentExample?.correct).toBe(false);
  });

  it('should handle image error', () => {
    component.currentExample = {
      example_index: 123,
      predicted_digit: 7,
      actual_digit: 7,
      image_data: 'invalid-data',
      originalImageData: 'base64data',
      network_output: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3, 0.0, 0.0],
      correct: true
    };
    
    component.handleImageError({});
    
    expect(component.imageLoaded).toBe(false);
  });
});
