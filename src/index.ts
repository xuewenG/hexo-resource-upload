import { load } from 'cheerio'
import fs from 'fs'
import path from 'path'

import './config'
import { initCdnClient } from './cdn'
import { updateConfig } from './config'
import { logger } from './util/log'
import { getFileUrl } from './util/upload'

hexo.extend.filter.register('after_post_render', async function (data) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { config } = this
  const { image_upload } = config
  const { oss } = image_upload || {}
  const { type, prefix } = oss || {}
  if (!type) {
    throw new Error('cdn type can not be empty')
  }
  updateConfig({
    ossType: type,
    ossPrefix: prefix || '',
  })
  initCdnClient()

  const { source } = data || {}
  if (!source || path.extname(source) !== '.md') {
    return
  }
  const areaKey = ['excerpt', 'more', 'content']
  for (const key of areaKey) {
    const area = data[key]
    const $ = load(area, {
      xmlMode: false,
      lowerCaseTags: false,
      decodeEntities: false,
    })

    const handleResult = $('img').map(async (_index, element) => {
      if (element.type === 'tag') {
        const src = element.attribs['src']
        if (src && !src.startsWith('http')) {
          const cleanSrc = src
            .split('/')
            .filter(seg => !/^[\s./]*$/.test(seg))
            .join('/')
          const imageFilePath = path.resolve(
            'source',
            path.dirname(source),
            cleanSrc,
          )
          if (!fs.existsSync(imageFilePath)) {
            logger.error(`${cleanSrc} is not a valid link`)
            return
          }
          const url = await getFileUrl(imageFilePath)
          if (!url) {
            logger.error(`${cleanSrc}, get url failed`)
            return
          }
          element.attribs['src'] = url
        }
      }
    })
    await Promise.all(handleResult)
    data[key] = $.html()
  }
})
