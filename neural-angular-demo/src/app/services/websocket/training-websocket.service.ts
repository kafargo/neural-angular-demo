import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../logger.service';

export interface TrainingUpdate {
  job_id: string;
  network_id: string;
  epoch: number;
  total_epochs: number;
  accuracy: number | null;
  elapsed_time: number;
  progress: number;
  correct?: number;
  total?: number;
}

export interface ConnectionStatus {
  connected: boolean;
  socketId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrainingWebSocketService implements OnDestroy {
  private socket!: Socket; // Non-null assertion as it will be initialized in initializeConnection
  private connectionStatus = new BehaviorSubject<ConnectionStatus>({
    connected: false
  });
  private trainingUpdates = new BehaviorSubject<TrainingUpdate | null>(null);
  
  // Production server URL based on the documentation
  private serverUrl = environment.websocketUrl;

  constructor(private logger: LoggerService) {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      this.logger.log('Connected to training WebSocket:', this.socket.id);
      this.connectionStatus.next({
        connected: true,
        socketId: this.socket.id
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.logger.log('Disconnected from training WebSocket:', reason);
      this.connectionStatus.next({ connected: false });
    });

    this.socket.on('connect_error', (error) => {
      this.logger.error('WebSocket connection error:', error);
      this.connectionStatus.next({ connected: false });
    });

    // Training update handler
    this.socket.on('training_update', (data: TrainingUpdate) => {
      this.logger.log('Training update received via WebSocket:', data);
      this.trainingUpdates.next(data);
    });
  }

  // Observable for connection status
  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatus.asObservable();
  }

  // Observable for training updates
  getTrainingUpdates(): Observable<TrainingUpdate | null> {
    return this.trainingUpdates.asObservable();
  }

  // Filter training updates for a specific job ID
  getTrainingUpdatesForJob(jobId: string): Observable<TrainingUpdate | null> {
    return new Observable<TrainingUpdate | null>(observer => {
      const subscription = this.trainingUpdates.subscribe(update => {
        if (!update || update.job_id === jobId) {
          observer.next(update);
        }
      });
      
      return () => subscription.unsubscribe();
    });
  }

  // Check if currently connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Manually reconnect
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Cleanup on service destroy
  ngOnDestroy(): void {
    this.disconnect();
  }
}
