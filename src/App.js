// src/App.js
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DataUpload from './components/DataUpload'
import DataAnalysis from './components/DataAnalysis'
import './App.css'

function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/' element={<DataUpload />} />
          <Route path='/data-analysis' element={<DataAnalysis />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
