export interface NetworkExample {
  image_data: string;
  actual_digit: number;
  predicted_digit: number;
  correct: boolean;
  network_output: number[];
}

export interface TrainingUpdate {
  job_id: string;
  network_id: string;
  epoch: number;
  total_epochs: number;
  accuracy: number;
  elapsed_time: number;
  progress: number;
  correct: number;
  total: number;
}

export interface NetworkConfig {
  hiddenLayer1: number;
  hiddenLayer2: number;
  useSecondLayer: boolean;
  layerSizes: number[];
}

export interface TrainingConfig {
  epochs: number;
  miniBatchSize: number;
  learningRate: number;
}

export type AppSection = 'learn' | 'create' | 'train' | 'test';

// API Response Interfaces
export interface ApiStatus {
  status: string;
  active_networks: number;
  active_training_jobs: number;
}

export interface NetworkCreateResponse {
  network_id: string;
  layer_sizes: number[];
  message: string;
}

export interface NetworkListResponse {
  networks: Array<{
    network_id: string;
    layer_sizes: number[];
  }>;
}

export interface TrainResponse {
  job_id: string;
  network_id: string;
  message: string;
}

export interface TrainingStatusResponse {
  job_id: string;
  network_id: string;
  status: string;
  epoch: number;
  total_epochs: number;
  accuracy: number | null;
  elapsed_time: number;
  progress: number;
}

export interface NetworkStatsResponse {
  network_id: string;
  accuracy: number;
  total_tested: number;
  correct_predictions: number;
}

export interface PredictResponse {
  network_id: string;
  predicted_digit: number;
  actual_digit: number;
  confidence: number;
  all_outputs: number[];
}

export interface NetworkVisualization {
  layers: Array<{
    size: number;
    weights?: number[][];
    biases?: number[];
  }>;
}
