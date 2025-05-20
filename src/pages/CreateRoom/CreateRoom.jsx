import React, { useEffect, useState } from 'react';
import { v4 as id } from 'uuid';
import { useNavigate } from 'react-router-dom';
import './CreateRoom.scss';
import {toast} from 'react-toastify';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const cachedRoomId = localStorage.getItem("cachedRoomId");
      if (cachedRoomId) {
        const parsedId = JSON.parse(cachedRoomId);
        localStorage.removeItem("cachedRoomId"); 
        navigate(`editor/${parsedId}`)
      }
    }, 2000);
  },[])
  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId === "") {
      toast.error('ROOM ID is required');
      return;
    }

    // Redirect
    navigate(`/editor/${roomId}`);
  };

  function createNewRoom() {
    const newRoomId = id();
    setRoomId(newRoomId);
    toast.success('Created a new room');
  }

  return (
    <div className='createroom'>
      <form autoComplete='off'>
        <div className='inputgroup'>
          <label htmlFor="roomId">Room Id ...</label>
          <input type="text" name="roomId" id="roomId" placeholder='Enter Existing Room ID' value={roomId} onChange={e => setRoomId(e.target.value)} />
        </div>
        <div className='inputgroup'>
          <input type="submit" onClick={joinRoom} value="Enter Room" />
        </div>
        <div className='inputgroup'>
          <p>Create A new room <span className='newroomlink' onClick={createNewRoom}>New Room</span></p>
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;
