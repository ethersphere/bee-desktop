import { readFileSync } from 'fs'
import { join } from 'path'
import { readConfigYaml } from './config-yaml'
import { isBeeAssetReady } from './downloader'
import { checkPath, getPath } from './path'

interface Status {
  status: 0 | 1 | 2
  address: string | null
  config: Record<string, any>
  assetsReady: boolean
}

export function getStatus() {
  const statusObject: Status = {
    status: 0,
    address: null,
    config: null,
    assetsReady: isBeeAssetReady(),
  }

  if (!checkPath('config.yaml') || !checkPath('data-dir')) {
    return statusObject
  }
  statusObject.config = readConfigYaml()
  const { address } = JSON.parse(readFileSync(getPath(join('data-dir', 'keys', 'swarm.key'))).toString())
  statusObject.address = address

  if (!statusObject.config['block-hash']) {
    statusObject.status = 1

    return statusObject
  }
  statusObject.status = 2

  return statusObject
}
