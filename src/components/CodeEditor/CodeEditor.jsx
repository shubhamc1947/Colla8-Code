"use client"

import { useState, useEffect } from "react"
import "./CodeEditor.scss"
import CodeMirror from "@uiw/react-codemirror"
import axios from "axios"

//tooltip
import { Tooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"

// languages
import { javascript } from "@codemirror/lang-javascript"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { python } from "@codemirror/lang-python"
import { rust } from "@codemirror/lang-rust"
import { php } from "@codemirror/lang-php"
// themes
import { okaidia } from "@uiw/codemirror-theme-okaidia"
import { dracula } from "@uiw/codemirror-theme-dracula"
import { solarizedLight } from "@uiw/codemirror-theme-solarized"
import { githubLight } from "@uiw/codemirror-theme-github"
import { material } from "@uiw/codemirror-theme-material"
import { monokai } from "@uiw/codemirror-theme-monokai"
import { nord } from "@uiw/codemirror-theme-nord"
import { darcula } from "@uiw/codemirror-theme-darcula"
import { eclipse } from "@uiw/codemirror-theme-eclipse"
import ACTIONS from "../../Actions"
import { toast } from "react-toastify"

const themes = {
  okaidia: { theme: okaidia, mode: "dark" },
  dracula: { theme: dracula, mode: "dark" },
  material: { theme: material, mode: "dark" },
  monokai: { theme: monokai, mode: "dark" },
  nord: { theme: nord, mode: "dark" },
  darcula: { theme: darcula, mode: "dark" },
  githubLight: { theme: githubLight, mode: "light" },
  solarizedLight: { theme: solarizedLight, mode: "light" },
  eclipse: { theme: eclipse, mode: "light" },
}

const languages = {
  javascript: javascript,
  cpp: cpp,
  java: java,
  python: python,
  rust: rust,
  php: php,
}

// Boilerplate code for each language
const boilerplateCode = {
  javascript: `// JavaScript Boilerplate
function main() {
  console.log("Hello, World!");
  
  // Your code here
  
  return 0;
}

main();`,
  cpp: `// C++ Boilerplate
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  
  // Your code here
  
  return 0;
}`,
  java: `// Java Boilerplate
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
    
    // Your code here
  }
}`,
  python: `# Python Boilerplate
def main():
    print("Hello, World!")
    
    # Your code here
    
    return 0

if __name__ == "__main__":
    main()`,
  rust: `// Rust Boilerplate
fn main() {
    println!("Hello, World!");
    
    // Your code here
}`,
  php: `<?php
// PHP Boilerplate
function main() {
    echo "Hello, World!";
    
    // Your code here
    
    return 0;
}

main();
?>`,
}

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

const CodeEditor = ({ socketRef, roomId, onCodeChange }) => {
  // Update the initial tab state to use the proper JavaScript boilerplate
  const [tabs, setTabs] = useState(() => {
    // Try to load from localStorage first
    const savedTabs = localStorage.getItem("codeTabs")
    if (savedTabs) {
      try {
        return JSON.parse(savedTabs)
      } catch (e) {
        console.error("Error parsing saved tabs:", e)
      }
    }

    // Default tab if nothing in localStorage
    return [
      {
        id: 1,
        heading: "New Code",
        code: boilerplateCode.javascript,
        lang: "javascript",
        input: "",
      },
    ]
  })

  // Update the theme state to use localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("codeTheme") || "dracula"
  })

  // Update isActiveId to use localStorage
  const [isActiveId, setIsActiveId] = useState(() => {
    const savedActiveId = localStorage.getItem("activeTabId")
    return savedActiveId ? Number.parseInt(savedActiveId, 10) : 1
  })
  const [output, setOutput] = useState("")
  const [showOutput, setShowOutput] = useState(true) // Always show output panel in new layout
  const [isRunning, setIsRunning] = useState(false)
  const [previousLang, setPreviousLang] = useState("javascript")

  // Add useEffect to save to localStorage whenever tabs or theme changes
  useEffect(() => {
    localStorage.setItem("codeTabs", JSON.stringify(tabs))
  }, [tabs])

  useEffect(() => {
    localStorage.setItem("codeTheme", theme)
  }, [theme])

  // Add useEffect to save active tab ID
  useEffect(() => {
    localStorage.setItem("activeTabId", isActiveId.toString())
  }, [isActiveId])

  useEffect(() => {
    const handleCodeChange = (msg) => {
      if (Array.isArray(msg)) {
        setTabs(msg)
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

  const handleChange = (e) => {
    const { name, value } = e.target

    // If changing language and there's code written
    if (name === "lang") {
      const activeTab = tabs.find((tab) => tab.id === isActiveId)

      // Store the current language before changing
      setPreviousLang(activeTab.lang)

      if (activeTab?.code && activeTab?.code.trim() !== "" && activeTab?.code !== boilerplateCode[activeTab.lang]) {
        const confirmChange = window.confirm(
          "Changing language will load new boilerplate code. Do you want to change the language?",
        )

        if (confirmChange) {
          // Update the language and load boilerplate
          setTabs((prevTabs) => {
            const codingText = prevTabs.map((tab) =>
              tab.id === isActiveId ? { ...tab, [name]: value, code: boilerplateCode[value] || "" } : tab,
            )
            socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
            onCodeChange(codingText)
            return codingText
          })
        } else {
          // If user cancels, revert the select element to the previous language
          // We need to use setTimeout to ensure this happens after the current event loop
          setTimeout(() => {
            const selectElement = document.querySelector('select[name="lang"]')
            if (selectElement) {
              selectElement.value = previousLang
            }
          }, 0)

          // Return early to prevent further processing
          return
        }
      } else {
        // If there's no meaningful code, just change the language and load boilerplate
        setTabs((prevTabs) => {
          const codingText = prevTabs.map((tab) =>
            tab.id === isActiveId ? { ...tab, [name]: value, code: boilerplateCode[value] || "" } : tab,
          )
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
          onCodeChange(codingText)
          return codingText
        })
      }
    } else {
      // For other changes (not language)
      setTabs((prevTabs) => {
        const codingText = prevTabs.map((tab) => (tab.id === isActiveId ? { ...tab, [name]: value } : tab))
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
        onCodeChange(codingText)
        return codingText
      })
    }
  }

  const handleTextValue = (value) => {
    setTabs((prevTabs) => {
      const codingText = prevTabs.map((tab) => (tab.id === isActiveId ? { ...tab, code: value } : tab))
      // Emit the updated tabs array to the socket
      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
      onCodeChange(codingText)
      return codingText
    })
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setTabs((prevTabs) => {
      const codingText = prevTabs.map((tab) => (tab.id === isActiveId ? { ...tab, input: value } : tab))
      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
      onCodeChange(codingText)
      return codingText
    })
  }

  const addTab = () => {
    const newId = tabs.length > 0 ? tabs[tabs.length - 1].id + 1 : 1
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
      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
      return codingText
    })
  }

  const removeTab = (id) => {
    setTabs((prev) => {
      const codingText = tabs.filter((tab) => tab.id !== id)
      if (codingText.length === 0) {
        setIsActiveId(null)
      } else if (id === isActiveId) {
        setIsActiveId(codingText[0].id)
      }

      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
      onCodeChange(codingText)
      return codingText
    })
  }

  const downloadFile = () => {
    const activeTab = tabs.find((tab) => tab.id === isActiveId)
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

  const loadBoilerplate = () => {
    const activeTab = tabs.find((tab) => tab.id === isActiveId)
    if (activeTab && boilerplateCode[activeTab.lang]) {
      setTabs((prevTabs) => {
        const codingText = prevTabs.map((tab) =>
          tab.id === isActiveId ? { ...tab, code: boilerplateCode[tab.lang] } : tab,
        )
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, codingText })
        onCodeChange(codingText)
        return codingText
      })
      toast.info(`Loaded ${activeTab.lang} boilerplate code`)
    }
  }

  const activeTab = Array.isArray(tabs) ? tabs.find((tab) => tab.id === isActiveId) : null

  return (
    <div className="codeeditor">
      <div className="header">
        <div className="heading">
          <input
            type="text"
            id="codeheading"
            name="heading"
            value={activeTab?.heading}
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
            <select name="lang" onChange={handleChange} value={activeTab?.lang}>
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
                <button onClick={() => removeTab(tab.id)} className="close-btn">
                  <i className="fa-solid fa-xmark"></i>
                </button>
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
