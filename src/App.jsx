import { Analytics } from "@vercel/analytics/react"
import {
  Route,
  Routes,
  BrowserRouter as Router,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./pages/Home/Home";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import RoomPage from "./pages/RoomPage/RoomPage";
import NavBar from "./components/NavBar/NavBar";
import Auth from "./components/ProtectedRoutes/Auth";
import CreateRoom from './pages/CreateRoom/CreateRoom';
import { AuthProvider } from "./contexts/AuthContext";
// import { compileString } from "sass";
import CodeTab from "./components/CodeTab/CodeTab";
import GuestBanner from "./components/GuestBanner/GuestBanner";
import NotFound from "./pages/NotFound/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <GuestBanner/>
        <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/createRoom" element={<Auth compo={CreateRoom}  />} />

          <Route path="/editor/:roomId" element={<RoomPage />} />
          <Route path="*" element={<NotFound />} />
          {/* <Route path="/test" element={<CodeTab />} /> */}
          
        </Routes>
      </AuthProvider>
      <ToastContainer
         position="bottom-right"
         autoClose={5000}
         hideProgressBar={false}
         newestOnTop={false}
         closeOnClick
         rtl={false}
         pauseOnFocusLoss
         draggable
         pauseOnHover
         theme="light"
      />
      <Analytics />
    </Router>
  );
}

export default App;
