import React, { useState } from 'react'
import '../styles/Model.css'
import axios from 'axios'

const Member = ({ isOpen, setisOpen, group }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  if (!isOpen) return null;

  const handleAdd = async () => {
    console.log("clicked")
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `https://split-ex-backend.vercel.app/group/${group._id}/invite`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        }
      )

      if (response.status == 201) {
        console.log(response.data)
        setisOpen(false)
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      alert("Failed to invite member")
    }
  }

  const handleCancel = () => {
    setisOpen(false)
  }

  return (
    <div className='MainBox'>
      <div className='Model'>
        <div className="head">
          <h1>Add member</h1>
        </div>

        <div className="input1">
          <label htmlFor="">Name</label>
          <input
            type="text"
            placeholder='Enter name'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="input2">
          <label htmlFor="">Email</label>
          <input
            type="text"
            placeholder='Enter email'
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="foot">
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleAdd}>Add</button>
        </div>
      </div>
    </div>
  )
}

export default Member
