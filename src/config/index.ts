import dotenv from 'dotenv'

dotenv.config()

const env = process.env

export const config = {
  domain: '',
  prefix: '',
  endpoint: env.S3_ENDPOINT || '',
  region: env.S3_REGION || '',
  bucket: env.S3_BUCKET || '',
  accessKeyId: env.S3_ACCESS_KEY_ID || '',
  accessKeySecret: env.S3_ACCESS_KEY_SECRECT || '',
  debug: !!(env.DEBUG && env.DEBUG === 'true'),
}

export const updateConfig = (_config: Partial<typeof config>) => {
  Object.assign(config, _config)
}
