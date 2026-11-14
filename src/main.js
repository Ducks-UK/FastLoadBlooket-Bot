const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const puppeteer = require('puppeteer')
const Store = require('electron-store')

const store = new Store()

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile('index.html')

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('join-games', async (event, { code, iterations, delay }) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    for (let i = 0; i < iterations; i++) {
      const page = await browser.newPage()
      await page.goto(`https://blooket.com/play/${code}`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      })

      await page.waitForSelector('input[name="name"]', { timeout: 5000 })

      const randomName = `Player${Math.floor(Math.random() * 10000)}`
      const blooks = ['chicken', 'cow', 'pig', 'sheep', 'duck', 'frog']
      const randomBlook = blooks[Math.floor(Math.random() * blooks.length)]

      await page.type('input[name="name"]', randomName)
      await page.click(`button[data-blook="${randomBlook}"]`)
      await page.click('button[type="submit"]')

      await new Promise(resolve => setTimeout(resolve, 2000))
      await page.close()

      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000))
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await browser.close()
  }
})

ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    iterations: 5,
    delay: 1,
    lastCode: ''
  })
})

ipcMain.handle('save-settings', (event, settings) => {
  store.set('settings', settings)
})
