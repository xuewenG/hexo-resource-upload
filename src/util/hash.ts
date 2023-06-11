import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export const getMd5ByFilePath = (filePath: string) => {
  const buffer = fs.readFileSync(path.join(filePath))
  const hash = crypto.createHash('md5')
  hash.update(buffer)
  return hash.digest('hex').toLocaleLowerCase()
}
