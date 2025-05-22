import crypto from 'crypto'
import fs from 'fs'

export const getMd5ByFilePath = (filePath: string) =>
  new Promise<string>(resolve => {
    const stream = fs.createReadStream(filePath)
    const hash = crypto.createHash('md5')
    stream.on('data', chunk => {
      hash.update(chunk)
    })
    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })
  })
