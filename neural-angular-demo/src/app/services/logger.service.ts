import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  
  log(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.log(message, ...optionalParams);
    }
  }

  warn(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.warn(message, ...optionalParams);
    }
  }

  error(message: string, ...optionalParams: any[]): void {
    // Always log errors, even in production, but you could send to a monitoring service here
    console.error(message, ...optionalParams);
    // TODO: In production, send to error monitoring service (e.g., Sentry, LogRocket)
  }

  debug(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.debug(message, ...optionalParams);
    }
  }
}
