import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import Header from './components/Header'
import './App.css'
import Todos from './pages/Todos'

function App() {


  return (
    <BrowserRouter>
    <Header />
    <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/todos' element={<Todos />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
