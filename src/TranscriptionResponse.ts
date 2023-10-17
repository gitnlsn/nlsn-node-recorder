type TranscriptionStatus =
  | "transcribed"
  | "busy"
  | "exceeded-file-size"
  | "internal-server-error";

interface Speech {
  time: number;
  duration: number;
  text: string;
}

export interface TranscriptionResponse {
  status: TranscriptionStatus;

  speeches: Speech[];
}
