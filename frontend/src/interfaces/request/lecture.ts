export interface LectureCreateRequest {
  date: string; // обязательное поле, ISO дата-время

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
  start?: string; // время начала
  end?: string; // время окончания
  abnormalTime?: string; // например, "Перерыв 15 минут"
}

export interface LectureUpdateRequest {
  date?: string;
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
  start?: string; // время начала
  end?: string; // время окончания
  abnormalTime?: string; // например, "Перерыв 15 минут"
}

export interface LectureCreateAdvancedRequest {
  lectures: LectureCreateRequest[];
}

export interface LectureUpdateLinksRequest {
  groupName: string;
  url: string;
}
