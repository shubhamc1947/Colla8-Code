// src/pages/Home/Home.js
import { Link,useLocation } from "react-router-dom";
import  { useEffect } from "react";
import "./Homepage.scss";
import GuestLoginButton from '../../components/GuestLoginButton/GuestLoginButton';


import { motion } from "framer-motion";

import {  toast } from 'react-toastify';
import OptimizedVideo from "./Video";
import { useAuth } from "../../contexts/AuthContext";
const Home = () => {

  const location = useLocation();
  const { loading } = useAuth();
  const createRoomUrl = loading ? "#" : "/createRoom";
  const isLoggedin = !!localStorage.getItem("username");
  useEffect(() => {
    if (location.state?.message) {
      toast.error(location.state.message);
      location.state.message="";
    }
  }, [location.state]);

  //framer motion css
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
        delay:0.5,
      }
    },
    btn:{
      y:[-6,0,6,0,-6],
      opacity:0.8,
      transition:{
        duration:2,
        opacity:0.9,
        repeat:Infinity
      }
    },
  }

  const otherVariants={
    initial:{
      y:50,
      opacity:0.5
    },
    animate:{
      y:0,
      opacity:1,
      transition:{
        duration: 1,
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const aboutVariants={
    initial:{
      y:50,
      opacity:0.5
    },
    animate:{
      y:0,
      opacity:1,
      transition:{
        duration:1,

      }
    }
  }

  
const initialAnimation = () => {
  const particleContainer = document.querySelector(".particles");
  const starBackground = document.querySelector(".star-background");

  for (let i = 0; i < 100; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    particle.style.top = `${Math.random() * 100}vh`;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particleContainer.appendChild(particle);
  }

  for (let i = 0; i < 300; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.top = `${Math.random() * 100}vh`;
    star.style.left = `${Math.random() * 100}vw`;
    starBackground.appendChild(star);
  }
};

useEffect(() => {
  initialAnimation();
}, []);

  return (
    <div className="homeanimationwrap">
        <div className="particles"></div>
        <div className="star-background"></div>
      {/* home section */}
      <motion.div className="home" >
        <motion.div className="container">
          <motion.div className="textcont" variants={variants} initial="initial" animate="animate">
            <h1>Where Code Meets Collaboration.</h1>
            <h2>
              Solve, Teach, and Interview: The Online Code Editor for Every
              Occasion...
            </h2>
            <motion.h3  variants={variants} animate="btn">
              <Link  to={"/createRoom"} className="sharebtn" variants={variants} animate="btn" >Create New Room</Link>
              {!isLoggedin && <GuestLoginButton />}
            </motion.h3>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="videocontbg">
        {/* <motion.div className="videocont"> */}
            {/* demo section */}
            {/* <motion.video variants={otherVariants} initial="initial"  whileInView="animate" autoPlay controls loop  muted playsInline>
              <motion.source src="./demo.mp4" type="video/mp4" />
            </motion.video>
        </motion.div> */}
        <OptimizedVideo/>
      </div>


      {/* About Section */}
      <motion.div className="about" >
          <motion.h1 variants={otherVariants} initial="initial" whileInView="animate">Collaborative Coding ...</motion.h1>
        <motion.div className="container">
          <motion.div className="feature" variants={otherVariants} >
            <h1>Team Up</h1>
            <p>
              Open a shared editor, write or paste code, and collaborate with
              friends and colleagues in real-time.
            </p>
            <Link to={"/createRoom"} className="sharebtn">Code Together</Link>
          </motion.div>
          <motion.div className="feature" variants={otherVariants} >
            <h1>Evaluate Talent</h1>
            <p>
              Assign coding tasks and observe candidates' skills in real-time,
              whether in-person or remote.
            </p>
            <Link to={"/createRoom"} className="sharebtn">Conduct an Interview</Link>
          </motion.div>
          <motion.div className="feature" variants={otherVariants} >
            <h1>Share Knowledge</h1>
            <p>
              Share your code with students and peers, and guide them through
              the learning process. Top universities rely on us every day.
            </p>
            <Link to={"/createRoom"} className="sharebtn">Teach to learn</Link>
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div className="footer">
        <motion.div className="container">
          <motion.div className="links">
            <a href="https://github.com/shubhamc1947" target="_blank"><i className="fa-brands fa-github"></i></a>
            <a href="https://www.linkedin.com/in/shubhamchat03/" target="_blank"><i className="fa-brands fa-linkedin"></i></a>
            <a href="https://twitter.com/shubham_1947" target="_blank"><i className="fa-brands fa-square-x-twitter"></i></a>
          </motion.div>
          <h4>Created By Shubham with ❤</h4>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
