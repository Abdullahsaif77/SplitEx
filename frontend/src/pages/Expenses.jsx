import React from 'react'
import "../styles/Expenses.css"
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import ExpenseModal from '../Components/ExpenseModel';
import { motion, AnimatePresence } from 'framer-motion';

const Expenses = () => {

  const [expenseInfo, setexpenseInfo] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setformData] = useState({
    groupId: '',
    createdBy: '',
    payer: '',
    amount: 0,
    description: '',
    split: 'equal',
    participants: []
  })

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token')
        const response = await axios.get('https://split-ex-backend.vercel.app/Expenses', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response) {
          console.log("Something is broken in backend")
          alert('Something is broken in backend')
        }
        console.log(response.data.UserExpense)
        setexpenseInfo(response.data.UserExpense)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }
    fetchExpense()
  }, [])

  return (
    <div className='expenses-page'>
      {/* Background Elements */}
      <div className="expenses-background-elements">
        <div className="expenses-glow expenses-glow-1"></div>
        <div className="expenses-glow expenses-glow-2"></div>
      </div>

      <div className="expenses-content">
        {/* Header Section */}
        <motion.div
          className="expenses-header glass-card"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-content">
            <motion.h2
              className="expenses-title"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              Expenses
            </motion.h2>
            <p className="expenses-subtitle">Track and manage all your expenses</p>
          </div>

          <motion.button
            className="new-expense-btn"
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Expense
          </motion.button>
        </motion.div>

        {/* Expenses List */}
        <motion.div
          className="expenses-list-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="loading-state glass-card">
              <div className="loading-spinner"></div>
              <p>Loading expenses...</p>
            </div>
          ) : expenseInfo.length === 0 ? (
            <motion.div
              className="empty-expenses glass-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 13.3132 21.7413 14.6136 21.2388 15.8268C20.7362 17.0401 19.9997 18.1425 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C4.00035 18.1425 3.26375 17.0401 2.7612 15.8268C2.25866 14.6136 2 13.3132 2 12C2 10.6868 2.25866 9.38642 2.7612 8.17317C3.26375 6.95991 4.00035 5.85752 4.92893 4.92893C5.85752 4.00035 6.95991 3.26375 8.17317 2.7612C9.38642 2.25866 10.6868 2 12 2Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>No Expenses Found</h3>
              <p>Create your first expense to start tracking</p>
              <motion.button
                className="create-first-expense-btn"
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Expense
              </motion.button>
            </motion.div>
          ) : (
            <div className="expenses-list">
              <AnimatePresence>
                {expenseInfo.map((expense, index) => (
                  <motion.div
                    key={expense._id || index}
                    className="expense-card glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="expense-header">
                      <span className="expense-date">
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="expense-amount">
                        {expense.amount} {expense.currency}
                      </span>
                    </div>

                    <div className="expense-content">
                      <div className="expense-main">
                        <h3 className="expense-description">
                          {expense.description || "No description"}
                        </h3>
                        <p className="expense-payer">
                          Paid by <strong>{expense.payer?.name || "Someone"}</strong>
                        </p>
                        <p className="expense-participants">
                          {expense.participants?.length || 0} participants
                        </p>
                      </div>

                      <div className="expense-group">
                        <span className="group-badge">
                          {expense.groupId?.name || "Group"}
                        </span>
                      </div>
                    </div>

                    {/* Status indicator bar */}
                    <div className="status-bar expense-bar"></div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false) }}
          formData={formData}
          setformData={setformData}
          expenseInfo={expenseInfo}
        />
      </div>
    </div>
  )
}

export default Expenses