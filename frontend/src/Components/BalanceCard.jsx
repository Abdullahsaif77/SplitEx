import React, { useState } from "react";
import "../styles/BalanceCard.css";


const BalanceCard = ({ balance}) => {

  

  const getColor = (value) => {
    if (value > 0) return "green-text";
    if (value < 0) return "red-text";
    return "black-text";
  };

  return (
    <div className="balance-wrapper">
      <div className="balance-date"></div>
      <div className="balance-card">
        <div>
          <p className="balance-user">
            <strong>{balance.name}</strong>
          </p>
          <p className="balance-subtext">Net balance summary</p>
        </div>
        <div className="balance-right">
          <p className={`balance-amount ${getColor(balance.net)}`}>
            {balance.net > 0 ? `+${balance.net} PKR` : `${balance.net} PKR`}
          </p>
          <p className="balance-status">
            {balance.net === 0 ? "Settled" : "Active"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
