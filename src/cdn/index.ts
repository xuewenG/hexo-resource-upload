import { AliCdnClient } from './ali'
import { config } from '../config'

export interface FileEntry {
  name: string
  url: string
}

export enum CdnType {
  ALI = 'ali',
}

export interface CdnClient {
  getFileList(): Promise<FileEntry[]>
  getFinalNameByFilePath(filePath: string): string
  uploadFile(filePath: string): Promise<string>
}

let cdnClient: CdnClient | null = null

const getCdnType = (cdnType: string): CdnType => {
  if (!Object.values(CdnType).includes(cdnType as any)) {
    throw new Error('cdn type invalid')
  }
  return cdnType as CdnType
}

export const initCdnClient = () => {
  if (cdnClient) {
    return
  }
  const cdnType = getCdnType(config.ossType)
  switch (cdnType) {
    case CdnType.ALI:
      cdnClient = new AliCdnClient()
      break
  }
}

export const getCdnClient = () => {
  if (!cdnClient) {
    throw new Error('no cdn client')
  }
  return cdnClient
}
