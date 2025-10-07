import React from "react";
import UserCard from "../Components/UserCard";
import "../styles/Users.css";
import { useEffect } from "react";
import axios from 'axios'
import { useState } from "react";

const Users = () => {
  
const [friends , setfriends] = useState([])

  useEffect(()=>{
    const fetchFriends = async()=>{
      try{
        const response = await axios.get('http://localhost:5500/friends')
        if(!response){
          return console.log("Something is broken in backend")
          alert('Something is broken in backend')
        }
        setfriends(response.data.Friends)
      }
      catch(error){

      }
    }
    fetchFriends()
  },[])

  return (
    <div className="users-page">
      
      <div className="users-header">
        <h2>All Users</h2>
        <p>List of registered members in the system</p>
      </div>

      
      <div className="users-list">
       {friends.map((friend,index)=>{
        return <UserCard key={index} friend={friend}/>
       })}
      
      </div>
    </div>
  );
};

export default Users;
