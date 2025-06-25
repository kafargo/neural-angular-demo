import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NeuralNetworkService {
  private apiUrl = 'https://neural-network-intro-production.up.railway.app/api';

  constructor(private http: HttpClient) {}
  
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  // Get API status
  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Create a new network
  createNetwork(layerSizes: number[] = [784, 128, 64, 10]): Observable<any> {
    return this.http.post(`${this.apiUrl}/networks`, {
      layer_sizes: layerSizes,
    })
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // List all networks
  listNetworks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/networks`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Train a network
  trainNetwork(
    networkId: string,
    epochs: number = 10,
    miniBatchSize: number = 10,
    learningRate: number = 3.0
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/networks/${networkId}/train`, {
      epochs,
      mini_batch_size: miniBatchSize,
      learning_rate: learningRate,
    })
    .pipe(
      catchError(this.handleError)
    );
  }

  // Get training status
  getTrainingStatus(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/training/${jobId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get network statistics
  getNetworkStats(networkId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/networks/${networkId}/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Predict a single example
  predict(networkId: string, exampleIndex: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/networks/${networkId}/predict`, {
      example_index: exampleIndex,
    })
    .pipe(
      catchError(this.handleError)
    );
  }

  // Get network visualization
  getVisualization(networkId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/networks/${networkId}/visualize`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get misclassified examples
  getMisclassifiedExamples(
    networkId: string,
    maxCount: number = 10,
    maxCheck: number = 500
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/networks/${networkId}/misclassified?max_count=${maxCount}&max_check=${maxCheck}`
    )
    .pipe(
      catchError(this.handleError)
    );
  }

  // Get successful example
  getSuccessfulExample(networkId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/networks/${networkId}/successful_example`, {
      responseType: 'json',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Get unsuccessful example
  getUnsuccessfulExample(networkId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/networks/${networkId}/unsuccessful_example`, {
      responseType: 'json',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
}
