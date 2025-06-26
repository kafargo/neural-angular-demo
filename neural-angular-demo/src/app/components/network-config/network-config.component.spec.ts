import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { NetworkConfigComponent } from './network-config.component';
import { NeuralNetworkService } from '../../services/neural-network.service';

describe('NetworkConfigComponent', () => {
  let component: NetworkConfigComponent;
  let fixture: ComponentFixture<NetworkConfigComponent>;
  let neuralNetworkServiceSpy: jasmine.SpyObj<NeuralNetworkService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NeuralNetworkService', ['createNetwork']);
    
    await TestBed.configureTestingModule({
      imports: [NetworkConfigComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: NeuralNetworkService, useValue: spy }
      ]
    }).compileComponents();

    neuralNetworkServiceSpy = TestBed.inject(NeuralNetworkService) as jasmine.SpyObj<NeuralNetworkService>;
    fixture = TestBed.createComponent(NetworkConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default configuration', () => {
    expect(component.config.hiddenLayer1).toBe(128);
    expect(component.config.hiddenLayer2).toBe(64);
    expect(component.config.useSecondLayer).toBe(true);
    expect(component.config.layerSizes).toEqual([784, 128, 64, 10]);
  });

  it('should update layer sizes when config changes', () => {
    component.config.hiddenLayer1 = 256;
    component.config.useSecondLayer = false;
    component.onConfigChange();
    
    expect(component.config.layerSizes).toEqual([784, 256, 10]);
  });

  it('should create network successfully', () => {
    const mockResponse = { network_id: 'test-network-id' };
    neuralNetworkServiceSpy.createNetwork.and.returnValue(of(mockResponse));
    
    spyOn(component.networkCreated, 'emit');
    spyOn(component.continueToTrain, 'emit');
    
    component.createNetwork();
    
    expect(component.loading).toBe(false);
    expect(component.networkCreated.emit).toHaveBeenCalledWith('test-network-id');
    expect(component.continueToTrain.emit).toHaveBeenCalled();
    expect(component.error).toBeNull();
  });

  it('should handle network creation error', () => {
    neuralNetworkServiceSpy.createNetwork.and.returnValue(throwError(() => new Error('API Error')));
    
    component.createNetwork();
    
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Failed to create network. Please try again.');
  });

  it('should emit config change when configuration is updated', () => {
    spyOn(component.configChange, 'emit');
    
    component.onConfigChange();
    
    expect(component.configChange.emit).toHaveBeenCalledWith(component.config);
  });
});
