import React, { useEffect, useState } from 'react'
import "../styles/navbar.css"
import profile from "../assets/profile.png"
import axios from 'axios'

const Navbar = ({ toggleSidebar }) => {
  const [name , setname] = useState('')

  useEffect(()=>{
    const fetchUser=async()=>{
      try{
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5500/profile',
          {
            headers:{
              authorization:`Brearer ${token}`
            }
          }
        )
        setname(response.data.user.name)
      }
      catch(err){
        res.status(500).json({message:err})
      }
    }
    fetchUser()
    
  },[])
  return (
    <div className='d-flex align-items-center navbarr py-3'>
      <button className="btn d-md-none ms-2" onClick={toggleSidebar}>
        ☰
      </button>

      <input
        type="text"
        placeholder="Search for a friend or a group"
        className="ms-3 px-4 py-2 flex-grow-1"
      />

      <div className="Line ms-4 d-none d-md-block"></div>

      <div className="d-flex ms-auto me-3">
        <img src={profile} height="40px" className="ms-2" alt="profile" />
        <p className="pt-2 ms-2">{name}</p>
      </div>
    </div>
  )
}

export default Navbar
