import { load } from 'cheerio'
import fs from 'fs'
import path from 'path'

import './config'
import { initCdnClient } from './cdn'
import { updateConfig } from './config'
import { logger } from './util/log'
import { getFileUrl } from './util/upload'

hexo.extend.filter.register('after_post_render', async function (data) {
  // @ts-ignore
  const { config } = this
  const { image_upload } = config
  const { sso } = image_upload || {}
  const { type, prefix } = sso || {}
  if (!type) {
    throw new Error('cdn type can not be empty')
  }
  updateConfig({
    ssoType: type,
    ssoPrefix: prefix || '',
  })
  initCdnClient()

  const { source } = data || {}
  if (!source || path.extname(source) !== '.md') {
    return
  }
  let areaKey = ['excerpt', 'more', 'content']
  for (const key of areaKey) {
    const area = data[key]
    let $ = load(area, {
      xmlMode: false,
      lowerCaseTags: false,
      decodeEntities: false,
    })

    const handleResult = $('img').map(async (_index, element) => {
      if (element.type === 'tag') {
        let src = element.attribs['src']
        if (src && !src.startsWith('http')) {
          const cleanSrc = src
            .split('/')
            .filter(seg => !/^[\s\.\/]*$/.test(seg))
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
