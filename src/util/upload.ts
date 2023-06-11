import { logger } from './log'
import { convertToSlash, relative } from './path'
import { getCdnClient } from '../cdn'

let CACHE: Map<string, string> | null = null

const getFileUrlCache = async () => {
  const cdnClient = getCdnClient()
  if (CACHE) {
    return CACHE
  }
  logger.debug('create new file url cache')
  const fileList = await cdnClient.getFileList()
  const newCache = new Map<string, string>()
  fileList.forEach(file => {
    newCache.set(file.name, file.url)
  })
  CACHE = newCache
  return newCache
}

export const getFileUrl = async (filePath: string) => {
  const cdnClient = getCdnClient()
  const imageCache = await getFileUrlCache()
  const nameInCdn = cdnClient.getFinalNameByFilePath(filePath)
  let url = imageCache.get(nameInCdn)
  if (!url) {
    logger.info(`${convertToSlash(relative(filePath))}: uploaded`)
    url = await cdnClient.uploadFile(filePath)
    imageCache.set(nameInCdn, url)
  } else {
    logger.debug(`${convertToSlash(relative(filePath))}: cached`)
  }
  return url
}
