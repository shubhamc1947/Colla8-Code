// src/components/NavBar/NavBar.js

import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "./NavBar.scss";
//framer motion
import { motion } from "framer-motion"
import { toast } from "react-toastify";
import { navBarVarient } from "../../utils/motionVarients";

const NavBar = () => {
  const { authState, logoutHandler, loading } = useContext(AuthContext);
  const loginUrl = loading ? "#" : "/login";
  const registerUrl = loading ? "#" : "/register";
  
  // console.log(authState);

  //framer motion varient

  useEffect(() => {
      let timeout;
      if (loading) {
        timeout = setTimeout(() => {
          toast.info("⏳ The server is on a free tier, so it might take a few seconds. Trust me, the app works!");
        }, 2000);
      }
      return () => clearTimeout(timeout);
  }, [loading]);
  useEffect(() => {
    if (window.innerWidth < 996) {
      toast.warn("📱 For the best experience, please use a larger screen.");
    }
  }, []);
  return (
    <motion.nav className="navbar" variants={navBarVarient} initial="initial" animate="animate">
      <Link to="/"><h1>CollabCode<span>.</span></h1></Link>
      {authState.username ? (
        <>
          <button onClick={logoutHandler} disabled={loading} style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }} >Logout</button>
        </>
      ) : (
        <>
          <span>
            <Link to={registerUrl}>Register</Link>
            <Link to={loginUrl}>Login</Link>
          </span>
        </>
      )}
    </motion.nav>
  );
};

export default NavBar;
