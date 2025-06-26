import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should allow navigation to learn section', () => {
    expect(component.canNavigateToSection('learn')).toBe(true);
  });

  it('should allow navigation to create section', () => {
    expect(component.canNavigateToSection('create')).toBe(true);
  });

  it('should not allow navigation to train section without networkId', () => {
    component.networkId = '';
    expect(component.canNavigateToSection('train')).toBe(false);
  });

  it('should allow navigation to train section with networkId', () => {
    component.networkId = 'test-id';
    expect(component.canNavigateToSection('train')).toBe(true);
  });

  it('should not allow navigation to test section without completed training', () => {
    component.networkId = 'test-id';
    component.trainingComplete = false;
    expect(component.canNavigateToSection('test')).toBe(false);
  });

  it('should allow navigation to test section with completed training', () => {
    component.networkId = 'test-id';
    component.trainingComplete = true;
    expect(component.canNavigateToSection('test')).toBe(true);
  });

  it('should emit section change when switching sections', () => {
    spyOn(component.sectionChange, 'emit');
    component.switchSection('create');
    expect(component.sectionChange.emit).toHaveBeenCalledWith('create');
  });
});
