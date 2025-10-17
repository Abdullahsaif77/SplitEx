import React from 'react'
import "../styles/Expenses.css"
import SettlementModal from '../Components/SettlementModal';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios'

const Settlements = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [settlements , setsettlements] = useState([])

    useEffect(()=>{
      const fetchSettlements = async()=>{
        try{
          const token = localStorage.getItem('token')
          const response = await axios.get('http://localhost:5500/settlements', 
            {
              headers:{
                Authorization: `Bearer ${token}`
              }
            }
          ) 
          if(!response){
             console.log("Something is broken in backend")
             alert('Something is broken in backend')
          }
          if(response.status == 200){
            setsettlements(response.data.UserSettlements)
          }
        }
        catch(error){
          console.log(error)
        }
      }
      fetchSettlements();
    },[])
    

    const handleSaveSettlement = (data) => {
        console.log("Settlement saved:", data);
        setsettlements((prev) => [data, ...prev]);
      };

  const sampleSettlements = [
    {
      payer: { name: "Ali" },
      receiver: { name: "Sara" },
      amount: 2000,
      currency: "PKR",
      date: "2025-09-25",
    },
    {
      payer: { name: "Hamza" },
      receiver: { name: "Usman" },
      amount: 1500,
      currency: "PKR",
      date: "2025-09-22",
    },
  ];

  return (
    <div className='home'>
      <div className='d-flex justify-content-between align-items-center expenseHead'>
        <h4>Settlements</h4>
        <div className='bbt'>
          <button className='btn btn-primary'  onClick={() => setIsModalOpen(true)}>New settlement</button>
        </div>
      </div>
      <p className='p-2'>Settlements</p>
      {settlements.map((settlement, index) => (
        <div key={index} className="expense-card shadow-sm mb-3">
         
          <div className="expense-header text-muted">
            <p className="mb-0">{new Date(settlement.createdAt).toDateString()}</p>
          </div>
          <div className="expense-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">
                <strong>{settlement.payer?.name}</strong> paid{" "}
                <strong>{settlement.receiver?.name}</strong>
              </h6>
              <p className="mb-0 text-secondary" style={{ fontSize: "14px" }}>
                Settlement transaction
              </p>
            </div>
            <div className="text-end">
              <h6 className="mb-0 text-success">
                {settlement.amount} {settlement.currency}
              </h6>
              <small className="text-muted">Completed</small>
            </div>
          </div>
        </div>
      ))}
       <SettlementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveSettlement} 
      />
    </div>
  )
}

export default Settlements
