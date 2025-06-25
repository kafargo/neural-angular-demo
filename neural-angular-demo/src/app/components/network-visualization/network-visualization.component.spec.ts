import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { NetworkVisualizationComponent } from './network-visualization.component';

describe('NetworkVisualizationComponent', () => {
  let component: NetworkVisualizationComponent;
  let fixture: ComponentFixture<NetworkVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default layer sizes', () => {
    expect(component.layerSizes).toEqual([784, 128, 64, 10]);
  });

  it('should determine if all nodes should be rendered', () => {
    // Output layer (index 3) should render all nodes since it has 10 nodes
    expect(component.shouldRenderAllNodes(3)).toBe(true);
    // Input layer (index 0) should not render all nodes since it has 784 nodes
    expect(component.shouldRenderAllNodes(0)).toBe(false);
  });

  it('should get connection style for layers', () => {
    const style = component.getConnectionStyle(0);
    expect(style.left).toBeDefined();
    expect(style.width).toBe('30px');
  });

  it('should return a subset of nodes for large layers', () => {
    const visibleNodes = component.getVisibleNodesArray(0);
    expect(visibleNodes.length).toBe(5);
  });
});
