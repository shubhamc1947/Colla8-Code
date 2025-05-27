import { useState, useEffect, useRef } from "react"
//tooltip

import { Tooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"
//react router dom
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom"

import CodeEditor from "../CodeEditor/CodeEditor"
import { ClientLogo } from "../ClientLogo/ClientLogo"
import { initSocket } from "../../socket"
import ACTIONS from "../../Actions"
import { toast } from "react-toastify"
import "./Room.scss"

// Helper functions for sessionStorage
const saveToSessionStorage = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving to sessionStorage (${key}):`, error)
  }
}

const loadFromSessionStorage = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error loading from sessionStorage (${key}):`, error)
    return defaultValue
  }
}

const Room = () => {
  //
  const username = sessionStorage.getItem("username") || localStorage.getItem("username")

  const socketRef = useRef(null)
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
  const { roomId } = useParams()
  const reactNavigator = useNavigate()
  const location = useLocation()
  const [clientList, setClientList] = useState([])
  const [showShareModal, setShowShareModal] = useState(false)
  const shareUrlRef = useRef(null)

  // Load saved code on component mount
  useEffect(() => {
    const savedTabs = loadFromSessionStorage("codeTabs")
    if (savedTabs && Array.isArray(savedTabs) && savedTabs.length > 0) {
      codeRef.current = savedTabs
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket()

      const handleErrors = (e) => {
        // console.log("socket error", e);
        toast.error("Socket connection failed, try again later.")
        reactNavigator("/")
      }

      socketRef.current.on("connect_error", handleErrors)
      socketRef.current.on("connect_failed", handleErrors)

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: username,
      })

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId, userSocketMap }) => {
        if (username !== (sessionStorage.getItem("username") || localStorage.getItem("username"))) {
          toast.success(`${username} joined the room.`)
        }

        setClientList(clients)

        if (codeRef.current) {
          // console.log(codeRef+" code is going here");
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          })
        }
      })

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} got disconnected.`)
        setClientList((prev) => prev.filter((client) => client.socketId !== socketId))
      })
    }

    init()

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.DISCONNECTED)
        socketRef.current.off(ACTIONS.JOINED)
        socketRef.current.disconnect()
      }
    }
  }, [roomId, username, reactNavigator])

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId)
      toast.success("Room ID has been copied to your clipboard")
    } catch (err) {
      toast.error("Could not copy the Room ID")
      console.error(err)
    }
  }

  function leaveRoom() {
    sessionStorage.removeItem("activeTabId");
    sessionStorage.removeItem("codeTabs");
    sessionStorage.removeItem("codeTheme");
    reactNavigator("/")
  }

  // Generate a shareable URL for the room
  const getShareableLink = () => {
    // Get the current URL without any query parameters or hash
    const url = new URL(window.location.href)
    const baseUrl = `${url.protocol}//${url.host}${url.pathname}`
    return baseUrl
  }

  // Function to share the room link
  const shareRoom = () => {
    setShowShareModal(true)
  }

  // Function to copy the shareable link
  const copyShareableLink = async () => {
    const link = getShareableLink()
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Shareable link copied to clipboard!")
      setShowShareModal(false)
    } catch (err) {
      toast.error("Failed to copy link")
      console.error(err)
    }
  }

  // Function to share via different platforms
  const shareVia = (platform) => {
    const link = getShareableLink()
    const text = `Join my collaborative coding room: ${link}`

    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
        break
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
        break
      case "email":
        shareUrl = `mailto:?subject=Join my collaborative coding room&body=${encodeURIComponent(text)}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank")
    setShowShareModal(false)
  }

  // Handle code changes from CodeEditor
  const handleCodeChange = (code) => {
    codeRef.current = code
    // Save to sessionStorage whenever code changes
    saveToSessionStorage("codeTabs", code)
  }

  if (!sessionStorage.getItem("username") && !localStorage.getItem("username")) {
    return <Navigate to="/" />
  }

  return (
    <div className="room">
      <div className="leftside">
        <div className="lefttop">
          <div className="clientList">
            {clientList.map((client, idx) => (
              <ClientLogo
                data-tooltip-id={idx + 500}
                data-tooltip-content={client.username}
                key={client.socketId}
                username={client.username}
              />
            ))}
          </div>
        </div>
        <div className="leftbottom">
          <button onClick={copyRoomId} data-tooltip-id="copybtn" data-tooltip-content="Copy Room Id">
            <i className="fa-solid fa-copy"></i>
          </button>
          <button
            onClick={shareRoom}
            data-tooltip-id="sharebtn"
            data-tooltip-content="Share Room"
            className="share-btn"
          >
            <i className="fa-solid fa-share-nodes"></i>
          </button>
          <button onClick={leaveRoom} data-tooltip-id="leavebtn" data-tooltip-content="Leave the room">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
          <Tooltip style={{ backgroundColor: "white", color: "#333",zIndex:"100" }} id="copybtn" />
          <Tooltip style={{ backgroundColor: "white", color: "#333",zIndex:"100" }} id="sharebtn" />
          <Tooltip style={{ backgroundColor: "white", color: "#333",zIndex:"100" }} id="leavebtn" />
        </div>
      </div>
      <div className="rightside">
        <div className="editor">
          <CodeEditor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={handleCodeChange}
          />
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Room</h3>
              <button className="close-modal" onClick={() => setShowShareModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="share-modal-content">
              <p>Share this link with others to collaborate:</p>
              <div className="share-link-container">
                <input
                  type="text"
                  value={getShareableLink()}
                  readOnly
                  ref={shareUrlRef}
                  onClick={(e) => e.target.select()}
                />
                <button onClick={copyShareableLink} className="copy-link-btn">
                  <i className="fa-solid fa-copy"></i>
                </button>
              </div>
              <div className="share-platforms">
                <button onClick={() => shareVia("twitter")} className="platform-btn twitter">
                  <i className="fa-brands fa-twitter"></i>
                </button>
                <button onClick={() => shareVia("facebook")} className="platform-btn facebook">
                  <i className="fa-brands fa-facebook-f"></i>
                </button>
                <button onClick={() => shareVia("whatsapp")} className="platform-btn whatsapp">
                  <i className="fa-brands fa-whatsapp"></i>
                </button>
                <button onClick={() => shareVia("email")} className="platform-btn email">
                  <i className="fa-solid fa-envelope"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Room