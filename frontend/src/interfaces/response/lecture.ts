export interface LectureResponse {
  id: number;
  date: string;

  group?: string;
  lector?: string;
  platform?: string;
  unit?: string;
  location?: string;
  url?: string;
  shortUrl?: string;
  streamKey?: string;
  description?: string;
  admin?: string;
  start?: string;
  end?: string;
  abnormalTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LecturesResponse = LectureResponse[];
