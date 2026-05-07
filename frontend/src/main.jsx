import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Main.jsx: Starting React app render')

const root = document.getElementById('root')
console.log('Main.jsx: Root element:', root)

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('Main.jsx: React app rendered')
