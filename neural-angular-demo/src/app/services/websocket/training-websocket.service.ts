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

export interface TrainingComplete {
  job_id: string;
  network_id: string;
  status: string;
  accuracy: number;
  message: string;
}

export interface TrainingError {
  job_id: string;
  network_id: string;
  status: string;
  error: string;
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
  private trainingComplete = new BehaviorSubject<TrainingComplete | null>(null);
  private trainingError = new BehaviorSubject<TrainingError | null>(null);
  
  // Production server URL based on the documentation
  private serverUrl = environment.websocketUrl;

  constructor(private logger: LoggerService) {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.logger.log('Attempting to connect to WebSocket:', this.serverUrl);
    
    this.socket = io(this.serverUrl, {
      transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
      timeout: 60000, // Increase timeout to 60 seconds
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      path: '/socket.io/',
      autoConnect: true,
      forceNew: false,
      multiplex: true,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      this.logger.log('✅ Connected to training WebSocket:', this.socket.id);
      this.connectionStatus.next({
        connected: true,
        socketId: this.socket.id
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.logger.log('⚠️ Disconnected from training WebSocket:', reason);
      this.connectionStatus.next({ connected: false });
    });

    this.socket.on('connect_error', (error) => {
      this.logger.error('❌ WebSocket connection error:', error);
      this.logger.error('Server URL:', this.serverUrl);
      this.logger.error('Transports:', this.socket.io.opts.transports);
      this.connectionStatus.next({ connected: false });
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      this.logger.log(`🔄 Reconnection attempt ${attempt}...`);
    });

    this.socket.on('reconnect_failed', () => {
      this.logger.error('❌ Reconnection failed after all attempts');
    });

    // Training update handler
    this.socket.on('training_update', (data: TrainingUpdate) => {
      this.logger.log('Training update received via WebSocket:', data);
      this.trainingUpdates.next(data);
    });

    // Training completion handler
    this.socket.on('training_complete', (data: TrainingComplete) => {
      this.logger.log('Training completed via WebSocket:', data);
      this.trainingComplete.next(data);
    });

    // Training error handler
    this.socket.on('training_error', (data: TrainingError) => {
      this.logger.error('Training error received via WebSocket:', data);
      this.trainingError.next(data);
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

  // Observable for training completion
  getTrainingComplete(): Observable<TrainingComplete | null> {
    return this.trainingComplete.asObservable();
  }

  // Observable for training errors
  getTrainingError(): Observable<TrainingError | null> {
    return this.trainingError.asObservable();
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

  // Filter training completion for a specific job ID
  getTrainingCompleteForJob(jobId: string): Observable<TrainingComplete | null> {
    return new Observable<TrainingComplete | null>(observer => {
      const subscription = this.trainingComplete.subscribe(complete => {
        if (!complete || complete.job_id === jobId) {
          observer.next(complete);
        }
      });
      
      return () => subscription.unsubscribe();
    });
  }

  // Filter training errors for a specific job ID
  getTrainingErrorForJob(jobId: string): Observable<TrainingError | null> {
    return new Observable<TrainingError | null>(observer => {
      const subscription = this.trainingError.subscribe(error => {
        if (!error || error.job_id === jobId) {
          observer.next(error);
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
