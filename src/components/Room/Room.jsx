// src/components/Room/Room.js

import React, { useState, useEffect, useRef } from "react";
//tooltip

import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
//react router dom
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";


import CodeEditor from '../CodeEditor/CodeEditor';
import {ClientLogo} from '../ClientLogo/ClientLogo';
import {initSocket} from '../../socket';
import ACTIONS from '../../Actions';
import { toast } from "react-toastify";
import './Room.scss';

const Room = () => {
  //
  const username=localStorage.getItem('username');
  
  const socketRef = useRef(null);
  const codeRef = useRef([
    {
      id: 1,
      heading: "New Code",
      code: `// JavaScript Boilerplate
function main() {
  console.log("Hello, World!");
  
  // Your code here
  
  return 0;
}

main();`,
      lang: "javascript",
      input: "",
    },
  ])
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const location = useLocation();
  const [clientList, setClientList] = useState([]);

 useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      const handleErrors = (e) => {
        // console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      };

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId, userSocketMap }) => {
        if (username !== localStorage.getItem('username')) {
          toast.success(`${username} joined the room.`);
        }

        setClientList(clients);

        if (codeRef.current) {
          // console.log(codeRef+" code is going here");
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} got disconnected.`);
        setClientList((prev) => prev.filter((client) => client.socketId !== socketId));
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.disconnect();
      }
    };
  }, [roomId, username, reactNavigator]);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!localStorage.getItem('username')) {
    return <Navigate to="/" />;
  }

  // console.warn(codeRef)

  return (
    <div className="room">
      <div className="leftside">
        <div className="lefttop">
          {/* <h5>{username}</h5> */}
          {/* <h6>Room {roomId || ""}</h6> */}
          {/* <hr /> */}
          <div className="clientList">
            {clientList.map((client,idx) => (
              <ClientLogo data-tooltip-id={idx+500} data-tooltip-content="Hello world!" key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <div className="leftbottom">
          <button onClick={copyRoomId} data-tooltip-id="copybtn" data-tooltip-content="Copy Room Id" ><i className="fa-solid fa-copy"></i></button>
          <button onClick={leaveRoom} data-tooltip-id="leavebtn" data-tooltip-content="Leave the room" ><i className="fa-solid fa-right-from-bracket"></i></button>
          <Tooltip style={{ backgroundColor: "white", color: "#333" }} id="copybtn" />
          <Tooltip style={{ backgroundColor: "white", color: "#333" }} id="leavebtn" />

        </div>
      </div>
      <div className="rightside">
        {/* <CodePage
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }} */}
          <div className="editor">
            <CodeEditor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {
            codeRef.current = code;
          }} />
          </div>
        
      </div>
   
      
    </div>
  );
};

export default Room;
