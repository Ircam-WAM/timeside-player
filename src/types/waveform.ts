export interface WaveformSegment {
  time: number;
  max: number;
  min: number;
}

export type Waveform = WaveformSegment[]
