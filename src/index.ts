import { load } from 'cheerio'
import fs from 'fs'
import path from 'path'

import './config'
import { config, updateConfig } from './config'
import { logger } from './util/log'
import { getMd5ByFilePath } from './util/hash'
import { getUploader } from './uploader'

interface Data {
  source: string
  photos?: string[]
  excerpt?: string
  more?: string
  content?: string
}

const srcToLocalPath = (source: string, src: string) =>
  path.resolve('source', path.dirname(source), src).replace(/\\/g, '/')

const localPathToRemotePath = async (localPath: string) => {
  const md5 = await getMd5ByFilePath(localPath)

  const fileName = path.basename(localPath)
  const extname = path.extname(fileName)

  const reg = new RegExp(`${extname}$`)
  const fileNameWithoutExtname = fileName.replace(reg, '')

  const md5_0_1 = md5.slice(0, 1)
  const md5_0_9 = md5.slice(0, 9)
  const shortName = `${md5_0_1}/${fileNameWithoutExtname}.${md5_0_9}${extname}`

  return path.join(config.prefix, shortName).replace(/\\/g, '/')
}

const convertSrc = async (source: string, src: string) => {
  if (!src || src.startsWith('http')) {
    return src
  }

  logger.debug(`convert src: ${src}`)

  const cleanSrc = src
    .split('/')
    .filter(seg => !/^[\s./]*$/.test(seg))
    .join('/')
  logger.debug(`src: ${src}, cleanSrc: ${cleanSrc}`)

  const localPath = srcToLocalPath(source, cleanSrc)
  logger.debug(`src: ${src}, localPath: ${localPath}`)

  if (!fs.existsSync(localPath)) {
    logger.error(`file not found, src: ${src}`)
    return src
  }

  const uploader = getUploader()
  const remotePath = await localPathToRemotePath(localPath)
  logger.debug(`src: ${src}, remotePath: ${remotePath}`)

  const exists = await uploader.exists(remotePath)
  logger.debug(`check exists, src: ${src}, result: ${exists}`)

  if (!exists) {
    await uploader.upload(localPath, remotePath)
    logger.debug(`uploaded, localPath: ${localPath}, remotePath: ${remotePath}`)
  }

  return `${config.domain}/${remotePath}`
}

hexo.extend.filter.register('after_post_render', async (data: Data) => {
  const { config } = hexo
  const { resource_upload } = config
  const { domain, prefix } = resource_upload || {}

  logger.debug('resource_upload config: ', resource_upload)
  updateConfig({
    domain,
    prefix,
  })

  const { source } = data || {}
  if (!source || path.extname(source) !== '.md') {
    return
  }

  logger.debug(`process source: ${source}`)
  if (Array.isArray(data.photos)) {
    data.photos = await Promise.all(
      data.photos.map(src => convertSrc(source, src)),
    )
  }

  const areaKey = ['excerpt', 'more', 'content'] as const
  for (const key of areaKey) {
    const area = data[key]
    if (!area) {
      continue
    }

    const $ = load(area)
    const imgPromises = $('img').map(async (_, element) => {
      const src = element.attribs['src']
      element.attribs['src'] = await convertSrc(source, src)
    })

    await Promise.all(imgPromises)
    data[key] = $.html()
  }
})
