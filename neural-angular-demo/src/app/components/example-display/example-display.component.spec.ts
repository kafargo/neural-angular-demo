import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExampleDisplayComponent } from './example-display.component';
import { NetworkExample } from '../../interfaces/neural-network.interface';

describe('ExampleDisplayComponent', () => {
  let component: ExampleDisplayComponent;
  let fixture: ComponentFixture<ExampleDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return 0 confidence when no example', () => {
    component.example = null;
    expect(component.getMaxConfidence()).toBe(0);
  });

  it('should calculate max confidence correctly', () => {
    const mockExample: NetworkExample = {
      image_data: 'test-data',
      actual_digit: 7,
      predicted_digit: 7,
      correct: true,
      network_output: [0.1, 0.2, 0.8, 0.3, 0.1, 0.0, 0.0, 0.9, 0.2, 0.1]
    };
    
    component.example = mockExample;
    expect(component.getMaxConfidence()).toBe(90); // 0.9 * 100
  });

  it('should detect correct predictions', () => {
    const mockExample: NetworkExample = {
      image_data: 'test-data',
      actual_digit: 7,
      predicted_digit: 7,
      correct: true,
      network_output: [0.1, 0.2, 0.8, 0.3, 0.1, 0.0, 0.0, 0.9, 0.2, 0.1]
    };
    
    component.example = mockExample;
    expect(component.isCorrectPrediction()).toBe(true);
  });

  it('should detect incorrect predictions', () => {
    const mockExample: NetworkExample = {
      image_data: 'test-data',
      actual_digit: 7,
      predicted_digit: 4,
      correct: false,
      network_output: [0.1, 0.2, 0.8, 0.3, 0.9, 0.0, 0.0, 0.3, 0.2, 0.1]
    };
    
    component.example = mockExample;
    expect(component.isCorrectPrediction()).toBe(false);
  });

  it('should handle image error', () => {
    const mockEvent = { target: { src: 'test-src' } };
    spyOn(console, 'error');
    
    component.handleImageError(mockEvent);
    
    expect(console.error).toHaveBeenCalled();
    expect(component.imageLoaded).toBe(false);
  });

  it('should sanitize image data correctly', () => {
    const dataUri = 'data:image/png;base64,test-data';
    const result = component.sanitizeImageData(dataUri);
    expect(result).toBeDefined();
  });
});
