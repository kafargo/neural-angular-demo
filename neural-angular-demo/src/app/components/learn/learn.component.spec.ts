import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LearnComponent } from './learn.component';
import { AppStateService } from '../../services/app-state.service';

describe('LearnComponent', () => {
  let component: LearnComponent;
  let fixture: ComponentFixture<LearnComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let appStateSpy: jasmine.SpyObj<AppStateService>;

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const appStateSpyObj = jasmine.createSpyObj('AppStateService', ['setActiveSection']);

    await TestBed.configureTestingModule({
      imports: [LearnComponent],
      providers: [
        { provide: Router, useValue: routerSpyObj },
        { provide: AppStateService, useValue: appStateSpyObj }
      ]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    appStateSpy = TestBed.inject(AppStateService) as jasmine.SpyObj<AppStateService>;
    fixture = TestBed.createComponent(LearnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to create section when continue is clicked', () => {
    component.onContinue();
    expect(appStateSpy.setActiveSection).toHaveBeenCalledWith('create');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/create']);
  });
});
