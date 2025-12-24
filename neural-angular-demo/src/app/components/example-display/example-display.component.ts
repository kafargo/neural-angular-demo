import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NetworkExample } from '../../interfaces/neural-network.interface';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-example-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example-display.component.html',
  styleUrls: ['./example-display.component.css']
})
export class ExampleDisplayComponent {
  @Input() example: NetworkExample | null = null;
  @Input() showConfidenceBreakdown = true;
  @Input() isCompact = false;

  imageLoaded = true;

  constructor(
    private sanitizer: DomSanitizer,
    private logger: LoggerService
  ) {}

  sanitizeImageData(imageData: string): SafeResourceUrl {
    if (!imageData) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    
    if (imageData.startsWith('data:image/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(imageData);
    }
    
    if (imageData.startsWith('http') || imageData.startsWith('assets/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(imageData);
    }
    
    const dataUri = `data:image/png;base64,${imageData}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(dataUri);
  }

  getMaxConfidence(): number {
    if (!this.example?.network_output || !Array.isArray(this.example.network_output)) {
      return 0;
    }
    return Math.max(...this.example.network_output) * 100;
  }

  isCorrectPrediction(): boolean {
    return this.example?.predicted_digit === this.example?.actual_digit;
  }

  handleImageError(event: any): void {
    this.logger.error('Image failed to load:', event);
    this.imageLoaded = false;
  }
}
