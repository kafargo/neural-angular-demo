import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import {
  NetworkCreateResponse,
  TrainResponse,
  NetworkExample
} from '../interfaces/neural-network.interface';

@Injectable({
  providedIn: 'root'
})
export class NeuralNetworkService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}
  
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred
      this.logger.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code
      this.logger.error(
        `Backend returned code ${error.status}, body was: `, error.error);
      
      // Special handling for 500 errors on example endpoints
      if (error.status === 500) {
        this.logger.warn('Server error (500). This might be because the network is not properly trained or initialized.');
      }
    }
    // Return an observable with a user-facing error message
    const errorMessage = error.error?.message || 'Something went wrong; please try again later.';
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Create a new neural network with specified layer sizes
   * Used by: NetworkConfigComponent
   */
  createNetwork(layerSizes: number[] = [784, 128, 64, 10]): Observable<NetworkCreateResponse> {
    return this.http.post<NetworkCreateResponse>(`${this.apiUrl}/networks`, {
      layer_sizes: layerSizes,
    })
    .pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Train a network with specified configuration
   * Used by: NetworkTrainingComponent
   */
  trainNetwork(
    networkId: string,
    trainingConfig: {
      epochs: number;
      mini_batch_size: number;
      learning_rate: number;
    }
  ): Observable<TrainResponse> {
    return this.http.post<TrainResponse>(`${this.apiUrl}/networks/${networkId}/train`, trainingConfig)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get a successfully classified example
   * Used by: NetworkTestComponent
   */
  private getSuccessfulExample(networkId: string): Observable<NetworkExample> {
    return this.http.get<NetworkExample>(`${this.apiUrl}/networks/${networkId}/successful_example`, {
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get an unsuccessfully classified example
   * Used by: NetworkTestComponent
   */
  private getUnsuccessfulExample(networkId: string): Observable<NetworkExample> {
    return this.http.get<NetworkExample>(`${this.apiUrl}/networks/${networkId}/unsuccessful_example`, {
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get either successful or unsuccessful examples based on parameter
   * Used by: NetworkTestComponent
   */
  getExamples(networkId: string, successful: boolean): Observable<NetworkExample> {
    if (successful) {
      return this.getSuccessfulExample(networkId);
    } else {
      return this.getUnsuccessfulExample(networkId);
    }
  }
}
