export interface WaveformSegment {
  time: number;
  max: number;
  min: number;
}

export interface Waveform {
  data: readonly WaveformSegment[];
  meta: {
    minVal: number;
    maxVal: number;
  };
}
