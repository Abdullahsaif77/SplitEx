import React from "react";
import deletePic from "../assets/delete.png";

const AddFriend = ({ member, onChange, onRemove }) => {
  return (
    <div className="daba">
      <div className="friend-header">
        <h5>Add Member</h5>
        <div className="imge" onClick={onRemove} style={{ cursor: "pointer" }}>
          <img src={deletePic} height="18px" alt="delete" />
        </div>
      </div>

      <div className="friend-fields">
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter member name"
            value={member.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter member email"
            value={member.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AddFriend;
