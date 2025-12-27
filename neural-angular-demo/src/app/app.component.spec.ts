import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';

// Create a dummy component for routing
@Component({ selector: 'app-dummy', template: '' })
class DummyComponent {}

describe('AppComponent', () => {
  let originalBeforeUnload: any;
  
  beforeEach(async () => {
    // Save and mock beforeunload to prevent test interference
    originalBeforeUnload = window.onbeforeunload;
    window.onbeforeunload = null;
    
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLocationMocks(),
        provideRouter([
          { path: '**', component: DummyComponent }
        ])
      ]
    }).compileComponents();
  });
  
  afterEach(() => {
    // Restore beforeunload
    window.onbeforeunload = originalBeforeUnload;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Neural Network Demo' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Neural Network Demo');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Neural Network Demo');
  });
});
