import { readFileSync } from 'fs'
import { join } from 'path'
import { isBeeAssetReady } from './downloader'
import { checkPath, getPath } from './path'
import { readConfigYaml } from './config'

interface Status {
  address?: string
  config?: Record<string, any>
  assetsReady: boolean
}

export function getStatus() {
  const status: Status = {
    assetsReady: isBeeAssetReady(),
  }

  if (!checkPath('config.yaml')) {
    return status
  }

  status.config = readConfigYaml()

  if (!checkPath(status.config['data-dir'])) {
    return status
  }

  status.address = readEthereumAddress(status.config['data-dir'])

  return status
}

function readEthereumAddress(dataDir = 'data-dir') {
  const path = getPath(join(dataDir, 'keys', 'swarm.key'))
  const swarmKeyFile = readFileSync(path, 'utf-8')
  const v3 = JSON.parse(swarmKeyFile)

  return v3.address
}
