import React, { useEffect, useState } from 'react';
import "../styles/Group.css";
import CreateGroup from '../Components/CreateGroup';
import GroupPage from '../Components/GroupPage';
import axios from 'axios';

const Groups = () => {
  const [group , setGroup] = useState([]);
  const [isModalOpen , setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleCreateGroup = () => {
    setIsModalOpen(true);
  };

  const handleOpen = (group) => {
    setSelectedGroup(group);  // ✅ open the selected group
  };

  useEffect(() => {
    const fetchGroups = async() => {
      try{
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5500/groups', {
          headers: {
            Authorization:`Bearer ${token}`
          }
        });
        if(!response){
          console.log('Something is broken in backend');
          alert('Something is broken in backend');
        }
        setGroup(response.data.Groups);
      }
      catch(error){
        console.log(error);
      }
    };
    fetchGroups();
  },[]);

  return (
    <div className='home'>
      {!selectedGroup ? (
        <>
          <div className='d-flex justify-content-between align-items-center expenseHead'>
            <h4>New Group</h4>
            <div className='bbt'>
              <button className='btn btn-primary' onClick={handleCreateGroup}>Create group</button>
            </div>
          </div>
          <p className='ms-2'>Groups</p>
          {group.map((group,index)=>(
            <div key={index} className="group-card d-flex justify-content-between align-items-center p-3 mb-3 shadow-sm rounded">
              <div>
                <h5 className="mb-1">{group.name}</h5>
                <p className="numbers mb-0 text-muted">
                  {group.members.map(m => m.userId?.name).join(", ")}
                </p>
              </div>
              <div>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => handleOpen(group)}
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <GroupPage group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}

      <CreateGroup 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Groups;
