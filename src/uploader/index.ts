import { S3Uploader } from './s3'

export interface Uploader {
  exists(remotePath: string): Promise<boolean>
  upload(localPath: string, remotePath: string): Promise<void>
}

let uploader: Uploader | null = null

export const getUploader = () => {
  if (!uploader) {
    uploader = new S3Uploader()
  }

  return uploader
}
