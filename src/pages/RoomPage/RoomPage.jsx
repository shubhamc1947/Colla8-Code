// src/pages/RoomPage/RoomPage.js

import React, { useEffect } from 'react';
import Room from '../../components/Room/Room';
import './RoomPage.scss';
import { Navigate, useLocation } from 'react-router-dom';

const RoomPage = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("username");
  useEffect(() => {
    if (!isLoggedIn) {
      // Match route like /editor/:roomId
      const match = location.pathname.match(/^\/editor\/(.+)$/);
      if (match && match[1]) {
        const roomId = match[1];
        localStorage.setItem("cachedRoomId", roomId);
      }
    }
  }, [isLoggedIn, location.pathname]);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="room-page">
      <Room />
    </div>
  );
};

export default RoomPage;
