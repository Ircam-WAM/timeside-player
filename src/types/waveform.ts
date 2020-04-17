export interface WaveformSegment {
  time: number;
  max: number;
  min: number;
}

export interface Waveform {
  data: WaveformSegment[];
  meta: {
    minVal: number;
    maxVal: number;
  };
}
