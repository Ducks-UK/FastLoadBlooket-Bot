import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { generateRandomName } from './utils/randomNames.js'

function App() {
  const [code, setCode] = useState('')
  const [iterations, setIterations] = useState(5)
  const [delay, setDelay] = useState(1)
  const [isRunning, setIsRunning] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsRunning(true)

    // Generate random names for simulation
    const names = Array(iterations).fill().map(() => generateRandomName())

    console.log(`Would join ${iterations} times with code ${code}`)
    console.log('Random names:', names.join(', '))

    setTimeout(() => {
      setIsRunning(false)
      alert(`Simulated joining ${iterations} games with code ${code}\n\nRandom names used: ${names.join(', ')}`)
    }, 2000)
  }

  return (
    <div className="container">
      <h1>FastLoadBlooket (Web Demo)</h1>
      <form onSubmit={handleSubmit}>
        {/* ... rest of your form code remains the same ... */}
      </form>
    </div>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
