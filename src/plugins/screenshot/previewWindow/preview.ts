import { BrowserWindow, app } from 'electron/main'
import path from 'node:path'
import { logger } from '../../..//logger'
import { captureWindow } from '../screenCaptureWindow/capture'
import { getScreenSize } from '../utils'

let previewWindow: BrowserWindow

function createPreviewWindow(imgDataURL: string) {
  const { defaultScreenSize } = getScreenSize()

  previewWindow = new BrowserWindow({
    width: defaultScreenSize.width,
    height: defaultScreenSize.height,
    webPreferences: {
      preload: path.join(__dirname, 'previewPreload.js'),
    },
  })

  const previewFilePath = path.join(app.getAppPath(), 'src', 'plugins', 'screenshot', 'previewWindow', 'preview.html')
  previewWindow.loadFile(previewFilePath).catch(err => {
    logger.error('Failed to load preview.html: ', err.message)
  })

  previewWindow.webContents.openDevTools()
  previewWindow.webContents.on('did-finish-load', () => {
    previewWindow.webContents.send('image-data-url', imgDataURL)
  })

  previewWindow.on('close', () => {
    captureWindow.close()
  })

  return previewWindow
}

export { createPreviewWindow, previewWindow }
