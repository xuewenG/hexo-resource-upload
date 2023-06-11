export const convertToHttps = (url: string) => {
  return url.replace(/^http:\/\//, 'https://')
}
