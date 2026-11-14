import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  const [code, setCode] = useState('')
  const [iterations, setIterations] = useState(5)
  const [delay, setDelay] = useState(1)
  const [isRunning, setIsRunning] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsRunning(true)

    // Simulate joining games (won't actually join in web mode)
    console.log(`Would join ${iterations} times with code ${code} and ${delay}s delay`)

    setTimeout(() => {
      setIsRunning(false)
      alert(`Simulated joining ${iterations} games with code ${code}\n\nNote: This is a web demo. To actually join games, you need the Electron version.`)
    }, 2000)
  }

  return (
    <div className="container">
      <h1>FastLoadBlooket (Web Demo)</h1>
      <p style={{textAlign: 'center', color: '#666'}}>
        This is a web demo. For full functionality, use the Electron version.
      </p>
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
          <label>Number of Joins (max 50):</label>
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
