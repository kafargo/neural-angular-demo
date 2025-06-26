import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSection } from '../../interfaces/neural-network.interface';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  @Input() activeSection: AppSection = 'learn';
  @Input() networkId: string = '';
  @Input() trainingComplete: boolean = false;
  
  @Output() sectionChange = new EventEmitter<AppSection>();

  switchSection(section: AppSection): void {
    if (this.canNavigateToSection(section)) {
      this.sectionChange.emit(section);
    }
  }

  canNavigateToSection(section: AppSection): boolean {
    switch (section) {
      case 'learn':
        return true;
      case 'create':
        return true;
      case 'train':
        return !!this.networkId;
      case 'test':
        return !!this.networkId && this.trainingComplete;
      default:
        return false;
    }
  }
}
