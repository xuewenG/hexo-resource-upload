import OSS from 'ali-oss'
import path from 'path'

import { CdnClient, FileEntry } from '.'
import { config } from '../config'
import { logger } from '../util/log'
import { convertToShortPath, convertToSlash } from '../util/path'
import { convertToHttps } from '../util/url'

export class AliCdnClient implements CdnClient {
  private client: OSS = new OSS({
    region: config.ossAliRegion,
    bucket: config.ossAliBucket,
    accessKeyId: config.ossAliAccessKeyId,
    accessKeySecret: config.ossAliAccessKeySecrect,
  })

  constructor() {
    logger.debug('ali cdn client created')
  }

  public async getFileList() {
    let fileList: FileEntry[] = []
    let nextMarker = ''
    while (1) {
      const result = await this.client.list(
        {
          prefix: config.ossPrefix,
          'max-keys': 500,
          marker: nextMarker,
        },
        {},
      )
      fileList = fileList.concat(
        result.objects.map(object => ({
          name: object.name,
          url: convertToHttps(object.url),
        })),
      )
      nextMarker = result.nextMarker
      if (!nextMarker) {
        break
      }
    }
    return fileList
  }

  public getFinalNameByFilePath(filePath: string) {
    return convertToSlash(
      path.join(config.ossPrefix, convertToShortPath(filePath)),
    )
  }

  public async uploadFile(filePath: string) {
    const name = this.getFinalNameByFilePath(filePath)
    const result = await this.client.put(name, filePath)
    return convertToHttps(result.url)
  }
}
