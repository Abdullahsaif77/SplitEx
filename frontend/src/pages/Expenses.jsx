import React from 'react'
import "../styles/Expenses.css"
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import ExpenseModal from '../Components/ExpenseModel';

const Expenses = () => {

  const [expenseInfo , setexpenseInfo] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData , setformData] = useState({
    groupId : '',
    createdBy:'',
    payer:'',
    amount:0,
    description:'',
    split:'equal',
    participants:[]
  })


  useEffect(()=>{
    const fetchExpense = async()=>{
      try{
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5500/Expenses',{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })
        if(!response){
          console.log("Something is broken in backend")
          alert('Something is broken in backend')
        }
        console.log(response.data.UserExpense)
        setexpenseInfo(response.data.UserExpense)
        
      }
      catch(error){
        console.log(error)
      }
    }
    fetchExpense()
  },[])

  return (
    <div className='home'>
      <div className='d-flex justify-content-between align-items-center expenseHead'>
        <h4>Expenses</h4>
        <div className='bbt'>
          <button className='btn btn-primary' onClick={() => setIsModalOpen(true)}>New expense</button>
        </div>
      </div>
      <p className='p-2'>Expenses</p>
      {expenseInfo.map((expense, index) => (
        <div key={index} className="expense-card shadow-sm mb-3">
       
          <div className="expense-header text-muted">
            <p className="mb-0">{new Date(expense.date).toDateString()}</p>
          </div>
          <div className="expense-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">{expense.description || "No description"}</h6>
              <p className="mb-0 text-secondary" style={{ fontSize: "14px" }}>
                Paid by <strong>{expense.payer?.name || "Someone"}</strong>
              </p>
            </div>
            <div className="text-end">
              <h6 className="mb-0 text-success">
                {expense.amount} {expense.currency}
              </h6>
              <small className="text-muted">
                {expense.participants?.length || 0} participants
              </small>
            </div>
          </div>
        </div>
      ))}
      <ExpenseModal  
      isOpen={isModalOpen} 
      onClose={()=>{setIsModalOpen(false)}}
      formData={formData}
      setformData={setformData}
      expenseInfo={expenseInfo}
      />
    </div>
  )
}

export default Expenses
