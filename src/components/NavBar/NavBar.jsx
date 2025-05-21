// src/components/NavBar/NavBar.js

import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "./NavBar.scss";
//framer motion
import { motion } from "framer-motion"

const NavBar = () => {
  const { authState, logoutHandler, loading } = useContext(AuthContext);
  const loginUrl = loading ? "#" : "/login";
  const registerUrl = loading ? "#" : "/register";
  
  // console.log(authState);

  //framer motion varient
  const variants={
    initial:{
      y:-100,
      opacity:0
    },
    animate:{
      y:0,
      opacity:1,
      transition:{
        duration:1,
        delay:0.3
      }
    }
  }
  return (
    <motion.nav className="navbar" variants={variants} initial="initial" animate="animate">
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
