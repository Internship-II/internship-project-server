export class UploadResponseDto {
  pictureId: string;
  message: string;
}

export class PictureUrlResponseDto {
  url: string;
  pictureId: string;
}

export class PictureDetailsDto {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  cloudUrl: string;
  createdAt: Date;
}

export class PictureSummaryDto {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: Date;
}

export class CloudStorageStatusDto {
  available: boolean;
  provider: string;
  configured: boolean;
} 