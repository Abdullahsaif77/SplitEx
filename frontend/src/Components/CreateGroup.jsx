import React, { useState } from "react";
import "../styles/createGroup.css";
import AddFriend from "./AddFriend";
import axios from 'axios'

const CreateGroup = ({ isOpen, onClose }) => {
  const [groupData, setgroupData] = useState({
    name: "",
    members: [],
  });

  const handleSubmit = async(e)=>{
    e.preventDefault()
    try{
      const payload = {
        name : groupData.name,
        members : groupData.members
      }
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:5500/group' , payload ,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
       )
       if(!response){
        console.log("Something is broken in backend")
        alert("Something is broken in backend")
       }
       if(response.status === 200){
        console.log("Group is created successfull")
       }
    }
    catch(error){
      console.log(error)
    }
  }

  const HandleMember = (e) => {
    e.preventDefault();
    setgroupData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          userId: "",
          role: "member",
          _id: Date.now().toString(),
        },
      ],
    }));
  };

  
  const updateMember = (index, field, value) => {
    const updated = [...groupData.members];
    updated[index][field] = value;
    setgroupData({ ...groupData, members: updated });
  };
  console.log(groupData)

  if (!isOpen) return null;

  return (
    <div className="modelLayout">
      <div className="modelInfo ">
        <div className="Head">
          <h3>Create Group</h3>
        </div>

        <form>
          <p className="text-dark ms-4 mt-3">Name</p>
          <input
            type="text"
            className="ms-4 ps-3 py-2"
            placeholder="Enter name"
            value={groupData.name}
            onChange={(e) =>
              setgroupData({ ...groupData, name: e.target.value })
            }
          />

          <p className="text-dark ms-4 mt-3">Add members</p>

          
          {groupData.members.map((member, index) => (
            <AddFriend
              key={member._id}
              member={member}
              onChange={(field, value) => updateMember(index, field, value)}
              onRemove={() => {
                const updated = groupData.members.filter((_, i) => i !== index);
                setgroupData({ ...groupData, members: updated });
              }}
            />
          ))}

          <button className="boom" onClick={HandleMember}>
            Add group member
          </button>
        </form>

        <div className="foot">
          <button onClick={onClose}>cancel</button>
          <button onClick={handleSubmit}>
            create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
