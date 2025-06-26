import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppSection, NetworkConfig, TrainingConfig } from '../interfaces/neural-network.interface';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  // State subjects
  private activeSectionSubject = new BehaviorSubject<AppSection>('learn');
  private networkIdSubject = new BehaviorSubject<string>('');
  private networkConfigSubject = new BehaviorSubject<NetworkConfig>({
    hiddenLayer1: 128,
    hiddenLayer2: 64,
    useSecondLayer: true,
    layerSizes: [784, 128, 64, 10]
  });
  private trainingConfigSubject = new BehaviorSubject<TrainingConfig>({
    epochs: 10,
    miniBatchSize: 10,
    learningRate: 3.0
  });
  private trainingCompleteSubject = new BehaviorSubject<boolean>(false);
  private finalAccuracySubject = new BehaviorSubject<number | null>(null);

  // Public observables
  activeSection$ = this.activeSectionSubject.asObservable();
  networkId$ = this.networkIdSubject.asObservable();
  networkConfig$ = this.networkConfigSubject.asObservable();
  trainingConfig$ = this.trainingConfigSubject.asObservable();
  trainingComplete$ = this.trainingCompleteSubject.asObservable();
  finalAccuracy$ = this.finalAccuracySubject.asObservable();

  // Getters for current values
  get activeSection(): AppSection {
    return this.activeSectionSubject.value;
  }

  get networkId(): string {
    return this.networkIdSubject.value;
  }

  get networkConfig(): NetworkConfig {
    return this.networkConfigSubject.value;
  }

  get trainingConfig(): TrainingConfig {
    return this.trainingConfigSubject.value;
  }

  get trainingComplete(): boolean {
    return this.trainingCompleteSubject.value;
  }

  get finalAccuracy(): number | null {
    return this.finalAccuracySubject.value;
  }

  // Setters
  setActiveSection(section: AppSection): void {
    this.activeSectionSubject.next(section);
  }

  setNetworkId(id: string): void {
    this.networkIdSubject.next(id);
  }

  setNetworkConfig(config: NetworkConfig): void {
    this.networkConfigSubject.next(config);
  }

  setTrainingConfig(config: TrainingConfig): void {
    this.trainingConfigSubject.next(config);
  }

  setTrainingComplete(complete: boolean): void {
    this.trainingCompleteSubject.next(complete);
  }

  setFinalAccuracy(accuracy: number | null): void {
    this.finalAccuracySubject.next(accuracy);
  }
}
