import { Routes } from '@angular/router';
import { LearnComponent } from './components/learn/learn.component';
import { NetworkConfigComponent } from './components/network-config/network-config.component';
import { NetworkTrainingComponent } from './components/network-training/network-training.component';
import { NetworkTestComponent } from './components/network-test/network-test.component';

export const routes: Routes = [
  { path: '', redirectTo: '/learn', pathMatch: 'full' },
  { path: 'learn', component: LearnComponent },
  { path: 'create', component: NetworkConfigComponent },
  { path: 'train', component: NetworkTrainingComponent },
  { path: 'test', component: NetworkTestComponent },
  { path: '**', redirectTo: '/learn' } // Wildcard route for 404 pages
];
