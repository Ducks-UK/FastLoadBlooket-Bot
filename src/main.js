const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const puppeteer = require('puppeteer')
const Store = require('electron-store')
const fs = require('fs')

const store = new Store()

let mainWindow

// Load words from file
const words = fs.readFileSync(path.join(__dirname, 'assets/words.txt'), 'utf-8')
  .split('\n')
  .filter(word => word.trim().length > 0)

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

function generateRandomName() {
  const word1 = words[Math.floor(Math.random() * words.length)]
  const word2 = words[Math.floor(Math.random() * words.length)]
  return `${word1}${word2}`
}

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
        waitUntil: 'networkidle2',
        timeout: 10000
      })

      // Wait for the join form to load
      await page.waitForSelector('input[name="name"]', { timeout: 5000 }).catch(() => {
        console.log('Join form not found, trying again...')
        return
      })

      // Generate random name and blook
      const randomName = generateRandomName()
      const blooks = ['chicken', 'cow', 'pig', 'sheep', 'duck', 'frog']
      const randomBlook = blooks[Math.floor(Math.random() * blooks.length)]

      // Fill in the form
      await page.type('input[name="name"]', randomName)
      await page.click(`button[data-blook="${randomBlook}"]`)

      // Submit the form
      await page.click('button[type="submit"]')

      // Close the tab after a short delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      await page.close()

      // Respect the delay between joins (minimum 1 second)
      if (i < iterations - 1) {
        const waitTime = Math.max(delay * 1000, 1000)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  } catch (error) {
    console.error('Error during joining:', error)
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
