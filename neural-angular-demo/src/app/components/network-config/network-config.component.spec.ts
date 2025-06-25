import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
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
      imports: [HttpClientTestingModule, FormsModule],
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

  it('should preview network structure on init', () => {
    spyOn(component.layerSizesChanged, 'emit');
    component.ngOnInit();
    expect(component.layerSizesChanged.emit).toHaveBeenCalledWith([784, 128, 64, 10]);
  });

  it('should create network successfully', () => {
    const mockResponse = { network_id: '12345', architecture: [784, 128, 64, 10], status: 'created' };
    neuralNetworkServiceSpy.createNetwork.and.returnValue(of(mockResponse));
    
    spyOn(component.networkCreated, 'emit');
    component.createNetwork();
    
    expect(neuralNetworkServiceSpy.createNetwork).toHaveBeenCalledWith([784, 128, 64, 10]);
    expect(component.isNetworkCreated).toBeTruthy();
    expect(component.networkId).toBe('12345');
    expect(component.networkCreated.emit).toHaveBeenCalledWith('12345');
  });

  it('should handle network creation error', () => {
    neuralNetworkServiceSpy.createNetwork.and.returnValue(throwError(() => new Error('Network error')));
    
    component.createNetwork();
    
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Failed to create network. Please try again.');
  });
});
