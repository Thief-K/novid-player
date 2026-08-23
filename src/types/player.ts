export interface TrackInfo {
  id: number | string;
  type: "video" | "audio" | "sub";
  title?: string;
  lang?: string;
  codec?: string;
  selected: boolean;
  external?: boolean;
  "external-filename"?: string;
  "audio-channels"?: number;
  "demux-samplerate"?: number;
}

export type ActivePanel = "playlist" | "track" | "speed" | "videoAdjust" | "settings" | null;

export interface PlaylistItem {
  id: string;
  title: string;
  path: string;
  duration?: number;
  addedAt: number;
}

export interface PlayHistoryItem {
  id: string;
  title: string;
  path: string;
  lastPosition: number;
  duration: number;
  lastPlayedAt: number;
}

export interface VideoAdjustments {
  brightness: number; // -100 to 100, default 0
  contrast: number; // -100 to 100, default 0
  saturation: number; // -100 to 100, default 0
  gamma: number; // -100 to 100, default 0
  aspectRatio: string; // 'original' | '16:9' | '4:3' | '21:9' | '1:1'
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
}
