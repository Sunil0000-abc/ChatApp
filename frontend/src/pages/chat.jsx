import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { CiUser } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { IoIosLogOut, IoIosAddCircle } from "react-icons/io";
import { FaUserAlt } from "react-icons/fa";
import { HiMenu } from "react-icons/hi";
import axios from "axios";
import Addfriend from "../component/Addfriend";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const Chat = () => {
  const navigate = useNavigate();
  const [addfriend, setAddFriend] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [userMenu, setUserMenu] = useState(false);
  const [friends, setFriends] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const currentUser = JSON.parse(storedUser);

  useEffect(() => {
    if (currentUser) {
      socket.emit("register", currentUser.id);
    }

    socket.on("privateMessage", ({ senderId, message }) => {
      setChatMessages((prev) => ({
        ...prev,
        [senderId]: [...(prev[senderId] || []), { senderId, message }],
      }));
    });

    return () => {
      socket.off("privateMessage");
    };
  }, [currentUser.id]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(
          `https://chatapp-3-716o.onrender.com/api/auth/get-friend/${currentUser.id}`
        );
        setFriends(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFriends();
  }, [currentUser.id]);

  const sendPrivateMessage = async () => {
    if (selectedUser && message.trim()) {
      socket.emit("privateMessage", {
        senderId: currentUser.id,
        receiverId: selectedUser._id,
        message,
      });

      await axios.post("https://chatapp-3-716o.onrender.com/api/auth/save-message", {
        senderId: currentUser.id,
        receiverId: selectedUser._id,
        message: message,
      });

      setChatMessages((prev) => ({
        ...prev,
        [selectedUser._id]: [
          ...(prev[selectedUser._id] || []),
          { senderId: currentUser.id, message },
        ],
      }));

      setMessage("");
    }
  };

  const removeFriend = async (friendId) => {
    const prevFriends = [...friends];
    setFriends((prev) => prev.filter((f) => f._id !== friendId));

    try {
      await axios.delete(`https://chatapp-3-716o.onrender.com/api/auth/remove-friend`, {
        data: { currentUserId: currentUser.id, friendUserId: friendId },
      });
    } catch (err) {
      console.error("Error removing friend:", err);
      setFriends(prevFriends);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-gradient-to-r from-[#0E1621] to-[#1A2332] text-white">
  {/* MOBILE HEADER */}
  <div className="md:hidden flex items-center justify-between bg-[#1A2332] p-3 shadow">
    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
      <HiMenu className="text-2xl" />
    </button>
    <h1 className="font-bold">{selectedUser ? selectedUser.name : "Chat App"}</h1>
    <IoIosAddCircle
      className="cursor-pointer text-2xl text-blue-400 hover:text-blue-300"
      onClick={() => setAddFriend(true)}
    />
  </div>

  {/* SIDEBAR */}
  <div
    className={`fixed md:static top-0 left-0 h-full w-64 bg-[#1A2332] border-r border-[#253040] p-4 flex flex-col transform md:translate-x-0 transition-transform duration-300 z-40
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
  >
    {/* User Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <FaUserAlt
          className="rounded-full p-1 bg-[#253040] hover:bg-[#2E3C4D] cursor-pointer text-2xl"
          onClick={() => setUserMenu(!userMenu)}
        />
        <h2 className="font-semibold">{currentUser.name}</h2>
      </div>
      <IoIosAddCircle
        className="hidden md:block cursor-pointer text-2xl text-blue-400 hover:text-blue-300"
        onClick={() => setAddFriend(true)}
      />
    </div>

    
    {userMenu && (
      <div className="bg-[#253040] rounded shadow-md p-2 mb-4">
        <div className="flex items-center gap-2 p-2 hover:bg-[#2E3C4D] cursor-pointer">
          <CiUser />
          <Link to="/profile">Profile</Link>
        </div>
        <div
          className="flex items-center gap-2 p-2 hover:bg-[#2E3C4D] cursor-pointer"
          onClick={handleLogout}
        >
          <IoIosLogOut />
          <span>Logout</span>
        </div>
      </div>
    )}

    
    <div className="flex-1 overflow-y-auto">
      {friends.length > 0 ? (
        friends.map((itm) => {
          const isSelected = selectedUser?._id === itm._id;
          return (
            <div
              key={itm._id}
              onClick={() => {
                setSelectedUser(itm);
                setSidebarOpen(false); 
              }}
              className={`p-2 rounded-lg cursor-pointer flex justify-between items-center ${
                isSelected
                  ? "bg-blue-500 text-white"
                  : "hover:bg-[#253040] text-gray-300"
              }`}
            >
              <span>{itm.name}</span>
              <button
                className="text-xs text-red-400 hover:text-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFriend(itm._id);
                }}
              >
                Remove
              </button>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">No friends yet</p>
      )}
    </div>
  </div>

  
  <div className="flex-1 flex flex-col">
    
    <div className="hidden md:flex bg-[#1A2332] p-4 shadow items-center h-16">
      <h2 className="text-lg font-semibold">
        {selectedUser ? selectedUser.name : "Select a user to chat"}
      </h2>
    </div>

    
    <div className="flex-1 p-4 overflow-y-auto space-y-2">
      {selectedUser &&
      chatMessages[selectedUser._id] &&
      chatMessages[selectedUser._id].length > 0 ? (
        chatMessages[selectedUser._id].map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-2xl max-w-xs break-words shadow ${
              msg.senderId === currentUser.id
                ? "bg-blue-500 text-white ml-auto"
                : "bg-[#253040] text-white"
            }`}
          >
            {msg.message}
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center">
          {selectedUser
            ? "No messages yet"
            : "Click on a friend to start chatting"}
        </div>
      )}
    </div>

    
    {selectedUser && (
      <div className="p-3 bg-[#1A2332] flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendPrivateMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-[#253040] border border-[#2E3C4D] rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendPrivateMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-400 transition"
        >
          Send
        </button>
      </div>
    )}
  </div>

 
  {addfriend && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => setAddFriend(false)}
  >
    <div
      className="relative z-10 bg-[#1A2332] rounded-lg p-4 shadow-lg w-[400px] max-w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <Addfriend currentUserId={currentUser.id} setAddFriend={setAddFriend} />
    </div>
  </div>
)}
</div>

  );
};

export default Chat;
