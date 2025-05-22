import {
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { readFile } from 'fs/promises'

import { Uploader } from '.'
import { config } from '../config'
import { logger } from '../util/log'

export class S3Uploader implements Uploader {
  private client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.accessKeySecret,
    },
  })

  constructor() {
    logger.debug('s3 uploader created')
  }

  public async exists(remotePath: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: remotePath,
    })
    try {
      await this.client.send(command)
      return true
    } catch (err) {
      if (err instanceof NotFound) {
        return false
      }

      throw err
    }
  }

  public async upload(localPath: string, remotePath: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: remotePath,
      Body: await readFile(localPath),
    })
    await this.client.send(command)
  }
}
