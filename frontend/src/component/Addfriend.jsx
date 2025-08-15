import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { IoIosAddCircle } from "react-icons/io";

const Addfriend = ({ className, currentUserId }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('https://chatapp-3-716o.onrender.com/api/auth/all-user');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const handleAddFriend = async (friendUserId) => {
    try {
      await axios.post('https://chatapp-3-716o.onrender.com/api/auth/add-friend', {
        currentUserId,
        friendUserId
      });
      alert('Friend added successfully!');
    } catch (err) {
      console.error('Failed to add friend', err);
    }
  };

  return (
    <div className={`text-white ${className}`}>
      
      <div className="flex items-center justify-center mb-4">
        <h1 className="text-xl font-semibold">Add Friend</h1>
      </div>

      
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {users.map((itm) => (
          <div
            key={itm._id}
            className="flex items-center justify-between bg-[#253040] px-4 py-2 rounded-lg hover:bg-[#2E3C4D] transition"
          >
            <span>{itm.name}</span>
            <IoIosAddCircle
              className="cursor-pointer text-blue-400 hover:text-blue-300 text-xl"
              onClick={() => handleAddFriend(itm._id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Addfriend;
