import { useState, useEffect } from "react"
import "./CodeEditor.scss"
import CodeMirror from "@uiw/react-codemirror"
import axios from "axios"

//tooltip
import { Tooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"


import ACTIONS from "../../Actions"
import { toast } from "react-toastify"
import { boilerplateCode, languages, themes } from "../../../apis/utils/data"


// Helper function to get color for language indicator
const getLangColor = (lang) => {
  const colors = {
    javascript: "#f7df1e",
    cpp: "#00599c",
    java: "#b07219",
    python: "#3572A5",
    rust: "#dea584",
    php: "#4F5D95",
  }
  return colors[lang] || "#71d5b4"
}

// Helper function to get file extension for the API call
const getFileExtension = (lang) => {
  const extensions = {
    javascript: "js",
    cpp: "cpp",
    java: "java",
    python: "py",
    rust: "rs",
    php: "php",
  }
  return extensions[lang] || lang
}

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

const CodeEditor = ({ socketRef, roomId, onCodeChange }) => {
  // Initialize state with default values first
  const [tabs, setTabs] = useState([
    {
      id: 1,
      heading: "New Code",
      code: boilerplateCode.javascript,
      lang: "javascript",
      input: "",
    },
  ])

  const [theme, setTheme] = useState("dracula")
  const [isActiveId, setIsActiveId] = useState(1)
  const [output, setOutput] = useState("")
  const [showOutput, setShowOutput] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [previousLang, setPreviousLang] = useState("javascript")
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      // Load theme
      const savedTheme = loadFromSessionStorage("codeTheme", "dracula")
      setTheme(savedTheme)

      // Load tabs
      const savedTabs = loadFromSessionStorage("codeTabs")
      if (savedTabs && Array.isArray(savedTabs) && savedTabs.length > 0) {
        setTabs(savedTabs)
        
        // Load active tab ID
        const savedActiveId = loadFromSessionStorage("activeTabId", savedTabs[0].id)
        const validActiveId = savedTabs.find(tab => tab.id === savedActiveId) 
          ? savedActiveId 
          : savedTabs[0].id
        setIsActiveId(validActiveId)
      }

      setIsInitialized(true)
    }

    loadSavedData()
  }, [])

  // Save tabs to sessionStorage whenever tabs change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveToSessionStorage("codeTabs", tabs)
    }
  }, [tabs, isInitialized])

  // Save theme to sessionStorage whenever theme changes
  useEffect(() => {
    if (isInitialized) {
      saveToSessionStorage("codeTheme", theme)
    }
  }, [theme, isInitialized])

  // Save active tab ID to sessionStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveToSessionStorage("activeTabId", isActiveId)
    }
  }, [isActiveId, isInitialized])

  useEffect(() => {
    const handleCodeChange = (msg) => {
      if (Array.isArray(msg)) {
        setTabs(msg)
        // Don't save to sessionStorage here as it will be saved by the useEffect above
      } else {
        console.error("Received non-array message:", msg)
      }
    }

    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange)

      return () => {
        socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange)
      }
    }
  }, [socketRef.current])

  useEffect(() => {
    if (isInitialized && onCodeChange) {
      onCodeChange(tabs)
    }
  }, [tabs, isInitialized, onCodeChange])

  const handleChange = (e) => {
    const { name, value } = e.target

    // If changing language and there's code written
    if (name === "lang") {
      const activeTab = tabs.find((tab) => tab.id === isActiveId)

      setPreviousLang(activeTab.lang)

      if (activeTab?.code && activeTab?.code.trim() !== "" && activeTab?.code !== boilerplateCode[activeTab.lang]) {
        const confirmChange = window.confirm(
          "Changing language will load new boilerplate code. Do you want to change the language?",
        )

        if (confirmChange) {
          setTabs((prevTabs) => {
            const codingText = prevTabs.map((tab) =>
              tab.id === isActiveId ? { ...tab, [name]: value, code: boilerplateCode[value] || "" } : tab,
            )
            if (socketRef.current) {
              socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
            }
            return codingText
          })
        } else {
          setTimeout(() => {
            const selectElement = document.querySelector('select[name="lang"]')
            if (selectElement) {
              selectElement.value = previousLang
            }
          }, 0)

          return
        }
      } else {
        setTabs((prevTabs) => {
          const codingText = prevTabs.map((tab) =>
            tab.id === isActiveId ? { ...tab, [name]: value, code: boilerplateCode[value] || "" } : tab,
          )
          if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
          }
          return codingText
        })
      }
    } else {
      // For other changes (not language)
      setTabs((prevTabs) => {
        const codingText = prevTabs.map((tab) => (tab.id === isActiveId ? { ...tab, [name]: value } : tab))
        if (socketRef.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
        }
        return codingText
      })
    }
  }

  const handleTextValue = (value) => {
    setTabs((prevTabs) => {
      const codingText = prevTabs.map((tab) => (tab.id === isActiveId ? { ...tab, code: value } : tab))
      // Emit the updated tabs array to the socket
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
      }
      return codingText
    })
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setTabs((prevTabs) => {
      const codingText = prevTabs.map((tab) => (tab.id === isActiveId ? { ...tab, input: value } : tab))
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
      }
      return codingText
    })
  }

  const addTab = () => {
    const newId = tabs.length > 0 ? Math.max(...tabs.map(tab => tab.id)) + 1 : 1
    const defaultLang = "javascript"
    const newTab = {
      id: newId,
      heading: `New Code ${newId}`,
      code: boilerplateCode[defaultLang],
      lang: defaultLang,
      input: "",
    }
    setTabs((prevTabs) => {
      const codingText = [...prevTabs, newTab]
      setIsActiveId(newId)
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
      }
      return codingText
    })
  }

  const removeTab = (id) => {
    if (tabs.length <= 1) {
      toast.warning("Cannot remove the last tab")
      return
    }

    setTabs((prevTabs) => {
      const codingText = prevTabs.filter((tab) => tab.id !== id)
      
      // Update active tab if the removed tab was active
      if (id === isActiveId) {
        const activeIndex = prevTabs.findIndex(tab => tab.id === id)
        const newActiveId = activeIndex > 0 
          ? prevTabs[activeIndex - 1].id 
          : codingText[0]?.id
        setIsActiveId(newActiveId)
      }

      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
      }
      return codingText
    })
  }

  const downloadFile = () => {
    const activeTab = tabs.find((tab) => tab.id === isActiveId)
    if (!activeTab) return

    const blob = new Blob([activeTab.code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeTab.heading || "code"}.${getFileExtension(activeTab.lang)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("File Downloaded Successfully")
  }

  const runCode = async () => {
    const activeTab = tabs.find((tab) => tab.id === isActiveId)
    if (!activeTab) return

    setOutput("Running code...")
    setIsRunning(true)

    try {
      const { data } = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: activeTab.lang,
        version: "*",
        files: [
          {
            name: `main.${getFileExtension(activeTab.lang)}`,
            content: activeTab.code,
          },
        ],
        stdin: activeTab.input,
      })
      const outputText = data.run.output || "No output"
      setOutput(outputText)
      toast.success("Code executed successfully!")
    } catch (error) {
      toast.error("Execution failed")
      setOutput(error.message || "Execution failed")
      console.error(error)
    } finally {
      setIsRunning(false)
    }
  }


  const activeTab = Array.isArray(tabs) ? tabs.find((tab) => tab.id === isActiveId) : null

  // Don't render until initialized to prevent flash of default content
  if (!isInitialized) {
    return <div className="codeeditor">Loading...</div>
  }

  return (
    <div className="codeeditor">
      <div className="header">
        <div className="heading">
          <input
            type="text"
            id="codeheading"
            name="heading"
            value={activeTab?.heading || ""}
            onChange={handleChange}
            placeholder="Enter code title here..."
          />
        </div>
        <div className="effects">
          <div className="themewrap">
            <select onChange={(e) => setTheme(e.target.value)} value={theme}>
              {Object.keys(themes).map((themeKey) => (
                <option key={themeKey} value={themeKey}>
                  {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)} (
                  {themes[themeKey].mode.charAt(0).toUpperCase() + themes[themeKey].mode.slice(1)})
                </option>
              ))}
            </select>
          </div>
          <div className="langwrap">
            <select name="lang" onChange={handleChange} value={activeTab?.lang || "javascript"}>
              {Object.keys(languages).map((langKey) => (
                <option key={langKey} value={langKey}>
                  {langKey.charAt(0).toUpperCase() + langKey.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={runCode}
            data-tooltip-place="bottom-end"
            data-tooltip-id="runbtn"
            data-tooltip-content="Run Code"
            disabled={isRunning}
            className={`action-btn run-btn ${isRunning ? "running" : ""}`}
          >
            {isRunning ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-play"></i>}
          </button>
          <button
            onClick={downloadFile}
            data-tooltip-place="bottom-end"
            data-tooltip-id="downloadbtn"
            data-tooltip-content="Download Code"
            className="action-btn download-btn"
          >
            <i className="fa-solid fa-download"></i>
          </button>
          <Tooltip style={{ backgroundColor: "white", color: "#333" }} id="runbtn" />
          <Tooltip style={{ backgroundColor: "white", color: "#333" }} id="downloadbtn" />
        </div>
      </div>
      <div className="codetab">
        <div className="tabnav">
          {Array.isArray(tabs) &&
            tabs.map((tab, i) => (
              <div key={tab.id} className={tab.id === isActiveId ? "tab active" : "tab"}>
                <button onClick={() => setIsActiveId(tab.id)} className="tab-title">
                  <span className="lang-indicator" style={{ backgroundColor: getLangColor(tab.lang) }}></span>
                  {tab.heading.length > 15 ? tab.heading.substring(0, 15) + "..." : tab.heading}
                </button>
                {tabs.length > 1 && (
                  <button onClick={() => removeTab(tab.id)} className="close-btn">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            ))}
          <button onClick={addTab} className="addbtn">
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>

        {activeTab && (
          <div className="editor-container">
            <div className="code-panel">
              <div className="file-header">
                <span className="file-name">
                  {activeTab.heading}.{getFileExtension(activeTab.lang)}
                </span>
              </div>
              <div className="code-editor">
                <CodeMirror
                  value={activeTab.code}
                  theme={themes[theme].theme}
                  extensions={[languages[activeTab.lang] && languages[activeTab.lang]()]}
                  onChange={(value) => handleTextValue(value)}
                />
              </div>
            </div>

            <div className="io-panel">
              <div className="input-panel">
                <div className="file-header">
                  <span className="file-name">input.txt</span>
                </div>
                <textarea
                  value={activeTab.input || ""}
                  onChange={handleInputChange}
                  placeholder="Enter input for your program here..."
                  className="input-textarea"
                />
              </div>

              <div className="output-panel">
                <div className="file-header">
                  <span className="file-name">output.txt</span>
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className={`run-mini-btn ${isRunning ? "running" : ""}`}
                  >
                    {isRunning ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                  </button>
                </div>
                <pre className="output-content">{output}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeEditor