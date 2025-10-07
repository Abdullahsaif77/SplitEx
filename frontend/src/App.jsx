import React from 'react'
import {Route , BrowserRouter , Routes} from "react-router-dom"
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from "./pages/Login"
import Dashboard from './pages/Dashboard'
import AcceptInvite from './Components/AcceptInvite'
import { PageProvider } from './apis/Context'


function App() {
  

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>}/>
      <Route path='/group/invite/accept/:token' element={<AcceptInvite/>}/>
      <Route path='/profile' element={<PageProvider><Dashboard/></PageProvider>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
