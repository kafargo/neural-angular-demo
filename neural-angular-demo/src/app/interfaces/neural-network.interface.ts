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
