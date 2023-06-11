import path from 'path'

import { getMd5ByFilePath } from './hash'

export const relative = (filePath: string) =>
  path.relative(process.cwd(), filePath)

export const convertToSlash = (filePath: string) => filePath.replace(/\\/g, '/')

export const convertToShortPath = (filePath: string) => {
  const md5 = getMd5ByFilePath(filePath)

  const fileName = path.basename(filePath)
  const extname = path.extname(fileName)

  const reg = new RegExp(`${extname}$`)
  const fileNameWithoutExtname = fileName.replace(reg, '')

  return `${md5.slice(0, 1)}/${fileNameWithoutExtname}.${md5.slice(
    0,
    9,
  )}${extname}`
}
