import React from 'react'
import "../styles/home.css"
import "bootstrap/dist/css/bootstrap.min.css";
import tick from "../assets/tick.png"
import axios from 'axios'
import { useState } from 'react';
import { useEffect } from 'react';
import ActivityFeed from '../Components/ActivityFeed';

const Home = () => {

  const [plusbalance , setplusbalance] = useState(0);
  const [negativebalance , setnegativebalance] = useState(0);
  const [activities , setactivities] = useState([])


  useEffect(()=>{
    const fetchBalance = async()=>{
      try{
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5500/home',
          {
            headers:{
              authorization: `Bearer ${token}`
            }
          }
        )
        if(response.status == 200){
          if(response.data.balance >= 0){
            console.log(response)
            setplusbalance(response.data.balance)
          }else{
            setnegativebalance(response.data.balance)
          }
          setactivities(response.data.activities || [])
        }
      }
      catch(error){
        console.error("Error fetching balance:", error);
      }
    }
    fetchBalance()
  },[])
 
  return (
    <div className='home'>  
      
      <div className='box animate-box'>
        <div className='balance-item'>
          <p className='mt-3'>You Get</p>
          <h3 className='pb-3 text-success'>PKR {plusbalance}</h3>
        </div>
        <div className='balance-item'>
          <p className='mt-3'>You Owe</p>
          <h3 className='pb-3 text-danger'>PKR {negativebalance}</h3>
        </div>
      </div>

     
      <div className='Activity'>
        <p className='ms-1 mt-3'>Your Activities</p>
      </div>

      {activities.length === 0 ? ( <div className="box2 animate-box d-flex flex-column justify-content-center align-items-center">
        <img src={tick} height="50px" alt="tick" />
        <p className='para'>All debts settled up!</p>
        <p className='para2'>
          Your debts in groups and 1:1 with friends are settled.  
          Add an expense to get paid back!
        </p>
      </div>) : (<ActivityFeed activities={activities}/>) }
     
    </div>
  )
}

export default Home
