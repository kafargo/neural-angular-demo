import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { NetworkConfigComponent } from './network-config.component';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { AppStateService } from '../../services/app-state.service';
import { LoggerService } from '../../services/logger.service';
import { NetworkCreateResponse } from '../../interfaces/neural-network.interface';

describe('NetworkConfigComponent', () => {
  let component: NetworkConfigComponent;
  let fixture: ComponentFixture<NetworkConfigComponent>;
  let neuralNetworkServiceSpy: jasmine.SpyObj<NeuralNetworkService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let appStateSpy: jasmine.SpyObj<AppStateService>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(async () => {
    const networkSpy = jasmine.createSpyObj('NeuralNetworkService', ['createNetwork']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const appStateSpyObj = jasmine.createSpyObj('AppStateService', ['setNetworkId', 'setActiveSection', 'setNetworkConfig', 'networkConfig']);
    const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error']);
    
    Object.defineProperty(appStateSpyObj, 'networkConfig', {
      get: () => ({ hiddenLayer1: 128, hiddenLayer2: 64, useSecondLayer: true, layerSizes: [784, 128, 64, 10] })
    });
    
    await TestBed.configureTestingModule({
      imports: [NetworkConfigComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: NeuralNetworkService, useValue: networkSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: AppStateService, useValue: appStateSpyObj },
        { provide: LoggerService, useValue: loggerSpyObj }
      ]
    }).compileComponents();

    neuralNetworkServiceSpy = TestBed.inject(NeuralNetworkService) as jasmine.SpyObj<NeuralNetworkService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    appStateSpy = TestBed.inject(AppStateService) as jasmine.SpyObj<AppStateService>;
    loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
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
    expect(appStateSpy.setNetworkConfig).toHaveBeenCalledWith(component.config);
  });

  it('should create network successfully', () => {
    const mockResponse: NetworkCreateResponse = { 
      network_id: 'test-network-id',
      layer_sizes: [784, 128, 64, 10],
      message: 'Network created successfully'
    };
    neuralNetworkServiceSpy.createNetwork.and.returnValue(of(mockResponse));
    
    component.createNetwork();
    
    expect(component.loading).toBe(false);
    expect(appStateSpy.setNetworkId).toHaveBeenCalledWith('test-network-id');
    expect(appStateSpy.setActiveSection).toHaveBeenCalledWith('train');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/train']);
    expect(component.error).toBeNull();
  });

  it('should handle network creation error', () => {
    neuralNetworkServiceSpy.createNetwork.and.returnValue(throwError(() => new Error('API Error')));
    
    component.createNetwork();
    
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Failed to create network. Please try again.');
    expect(loggerSpy.error).toHaveBeenCalled();
  });

  it('should update app state when configuration is updated', () => {
    component.onConfigChange();
    
    expect(appStateSpy.setNetworkConfig).toHaveBeenCalledWith(component.config);
  });
});
