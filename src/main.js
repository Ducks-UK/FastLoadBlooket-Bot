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

      // Navigate to Blooket join page
      await page.goto(`https://blooket.com/play/${code}`, {
        waitUntil: 'networkidle2'
      })

      // Wait for the join form to load
      await page.waitForSelector('input[name="name"]', { timeout: 5000 })

      // Generate random name and blook
      const randomName = `Player${Math.floor(Math.random() * 1000)}`
      const blooks = ['chicken', 'cow', 'pig', 'sheep', 'duck', 'frog']
      const randomBlook = blooks[Math.floor(Math.random() * blooks.length)]

      // Fill in the form
      await page.type('input[name="name"]', randomName)
      await page.click(`button[data-blook="${randomBlook}"]`)

      // Submit the form
      await page.click('button[type="submit"]')

      // Wait for the specified delay before next iteration
      await new Promise(resolve => setTimeout(resolve, delay * 1000))
    }
  } finally {
    await browser.close()
  }
})

ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    iterations: 5,
    delay: 2,
    lastCode: ''
  })
})

ipcMain.handle('save-settings', (event, settings) => {
  store.set('settings', settings)
})
