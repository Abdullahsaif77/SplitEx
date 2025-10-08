import React, { useState,useEffect } from "react";
import BalanceCard from "../Components/BalanceCard";
import axios from "axios"


const Balances = () => {

  const [balances , setbalances] = useState([])
  const [names , setnames] = useState([]);

  useEffect(()=>{
      const fetchBalances = async()=>{
        try{
          const token = localStorage.getItem('token')
          const response = await axios.get('http://localhost:5500/balances',{
            headers:{
              Authorization:`Bearer ${token}`
            }
          });
          if(!response){
            console.log("Something is wrong with backend")
          }
          const balance = response.data.balance
          const name = response.data.names
          
          const merge = balance.map((bal, index) => ({
            net:bal.net,
            name: name[index]
          }));
          
          console.log(merge)
          if(response.status == 200){
          setbalances(merge)
          }
        }
        catch (err) {
          console.error("Error fetching balances:", err);
        }
      }
      fetchBalances()    
  },[])



  return (
    <div className="balances-page">
      <div className="balances-header">
        <h2>All Balances</h2>
        <p>Overview of all member balances in this group</p>
      </div>
      
      <div className="balances-list">
       {balances.map((balances , index)=>{
         return <BalanceCard key={index} balance={balances}/>
       })}
      </div>
    </div>
  );
};

export default Balances;
