import React, { useState } from "react";
import "../styles/BalanceCard.css";


const BalanceCard = ({ balance}) => {

  const roundNet = Math.round(balance.net)

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
          <p className={`balance-amount ${getColor(roundNet)}`}>
            {roundNet > 0 ? `+${roundNet} PKR` : `${roundNet} PKR`}
          </p>
          <p className="balance-status">
            {roundNet === 0 ? "Settled" : "Active"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
