import React from 'react'
import "../styles/settlement.css"
import SettlementModal from '../Components/SettlementModal';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion';

const Settlements = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [settlements, setsettlements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSettlements = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token')
                const response = await axios.get('https://split-ex-backend.vercel.app/settlements',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                if (!response) {
                    console.log("Something is broken in backend")
                    alert('Something is broken in backend')
                }
                if (response.status == 200) {
                    setsettlements(response.data.UserSettlements)
                }
            }
            catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        }
        fetchSettlements();
    }, [])


    const handleSaveSettlement = (data) => {
        console.log("Settlement saved:", data);
        setsettlements((prev) => [data, ...prev]);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className='settlements-page'>
            {/* Background Elements */}
            <div className="settlements-background-elements">
                <div className="settlements-glow settlements-glow-1"></div>
                <div className="settlements-glow settlements-glow-2"></div>
            </div>

            <div className="settlements-content">
                {/* Header Section */}
                <motion.div
                    className="settlements-header glass-card"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="header-content">
                        <motion.h2
                            className="settlements-title"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            Settlements
                        </motion.h2>
                        <p className="settlements-subtitle">Track and manage all your debt settlements</p>
                    </div>

                    <motion.button
                        className="new-settlement-btn"
                        onClick={() => setIsModalOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17 12H12V7M12 12H7M12 12V17M12 12V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        New Settlement
                    </motion.button>
                </motion.div>

                {/* Settlements List */}
                <motion.div
                    className="settlements-list-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {loading ? (
                        <div className="loading-state glass-card">
                            <div className="loading-spinner"></div>
                            <p>Loading settlements...</p>
                        </div>
                    ) : settlements.length === 0 ? (
                        <motion.div
                            className="empty-settlements glass-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring" }}
                        >
                            <div className="empty-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 12C21 13.78 20.4722 15.5201 19.4832 17.0001C18.4943 18.4802 17.0887 19.6337 15.4442 20.3149C13.7996 20.9961 11.99 21.1743 10.2442 20.8271C8.49836 20.4798 6.89472 19.6226 5.63604 18.364C4.37737 17.1053 3.5202 15.5016 3.17294 13.7558C2.82567 12.01 3.0039 10.2004 3.68509 8.55585C4.36628 6.91131 5.51983 5.50571 6.99987 4.51677C8.47991 3.52784 10.22 3 12 3" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <h3>No Settlements Found</h3>
                            <p>Create your first settlement to clear debts</p>
                            <motion.button
                                className="create-first-settlement-btn"
                                onClick={() => setIsModalOpen(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Create Your First Settlement
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="settlements-list">
                            <AnimatePresence>
                                {settlements.map((settlement, index) => (
                                    <motion.div
                                        key={settlement._id || index}
                                        className="settlement-card glass-card"
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
                                        <div className="settlement-header">
                                            <span className="settlement-date">
                                                {new Date(settlement.createdAt).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className={`settlement-status ${settlement.status || 'completed'}`}>
                                                {settlement.status || 'Completed'}
                                            </span>
                                        </div>

                                        <div className="settlement-content">
                                            <div className="settlement-flow">
                                                <div className="settlement-party">
                                                    <div className="settlement-avatar payer">
                                                        {getInitials(settlement.payer?.name || "P")}
                                                    </div>
                                                    <span className="settlement-party-name">
                                                        {settlement.payer?.name || "Payer"}
                                                    </span>
                                                </div>

                                                <div className="settlement-direction">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <span className="settlement-amount">
                                                        {settlement.amount} {settlement.currency}
                                                    </span>
                                                </div>

                                                <div className="settlement-party">
                                                    <div className="settlement-avatar receiver">
                                                        {getInitials(settlement.receiver?.name || "R")}
                                                    </div>
                                                    <span className="settlement-party-name">
                                                        {settlement.receiver?.name || "Receiver"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="settlement-details">
                                                <p className="settlement-description">
                                                    Settlement between <strong>{settlement.payer?.name}</strong> and <strong>{settlement.receiver?.name}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status indicator bar */}
                                        <div className="status-bar settlement-bar"></div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                <SettlementModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSettlement}
                />
            </div>
        </div>
    )
}

export default Settlements