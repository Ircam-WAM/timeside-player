// This file was generated from the API response with
// http://json2ts.com/

export interface IdMetadata {
  id: string;
  name: string;
  unit: string;
  description: string;
  date: string;
  version: string;
  author: string;
  proc_uuid: string;
}

export interface Value {
  numpyArray: number[];
  dtype: string;
}

export interface FrameMetadata {
  samplerate: number;
  blocksize: number;
  stepsize: number;
}

export interface DataObject {
  value: Value;
  y_value: Value;
  frame_metadata: FrameMetadata;
}

export interface AudioMetadata {
  uri: string;
  start: number;
  duration: number;
  is_segment: boolean;
  sha1: string;
  channels: number;
  channelsManagement: string;
}

export interface OnsetDetectionParameters {
  input_blocksize: number;
  input_stepsize: number;
}

export interface AubioPitchParameters {
  blocksize_s: number;
  stepsize_s: number;
}

export type Parameters = OnsetDetectionParameters | AubioPitchParameters;

export interface HDF5 {
  id_metadata: IdMetadata;
  data_object: DataObject;
  audio_metadata: AudioMetadata;
  parameters: Parameters;
  data_mode: string;
  time_mode: string;
}
