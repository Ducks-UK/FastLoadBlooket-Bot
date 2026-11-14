import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  const [code, setCode] = useState('')
  const [iterations, setIterations] = useState(5)
  const [delay, setDelay] = useState(1)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    window.electronAPI.getSettings().then(settings => {
      setCode(settings.lastCode)
      setIterations(settings.iterations)
      setDelay(settings.delay)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsRunning(true)

    await window.electronAPI.joinGames({
      code,
      iterations,
      delay
    })

    setIsRunning(false)
    window.electronAPI.saveSettings({
      lastCode: code,
      iterations,
      delay
    })
  }

  return (
    <div className="container">
      <h1>FastLoadBlooket</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Blooket Game Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Enter game code"
          />
        </div>

        <div className="form-group">
          <label>Number of Joins:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label>Delay Between Joins (seconds):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            required
          />
        </div>

        <button type="submit" disabled={isRunning}>
          {isRunning ? 'Running...' : 'Start Joining'}
        </button>
      </form>
    </div>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
