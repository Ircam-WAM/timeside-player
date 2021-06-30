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

export interface Label {
    numpyArray: number[];
    dtype: string;
}

export interface Label2 {
    1: string;
}

export interface LabelMetadata {
    label: Label2;
    label_type: string;
}

export interface Time {
    numpyArray: number[];
    dtype: string;
}

export interface DataObject {
    label: Label;
    label_metadata: LabelMetadata;
    time: Time;
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

export interface HDF5 {
    id_metadata: IdMetadata;
    data_object: DataObject;
    audio_metadata: AudioMetadata;
    data_mode: string;
    time_mode: string;
}
