import "./App.css";
import { useState } from "react";
import AuthModal from "./AuthModal.jsx";
import ChatWindow from "./chatwindow";
import { MyContext } from "./Mycontext.jsx";
import Sidebar from "./sidebar";

function createThreadId() {
  return crypto.randomUUID();
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [Reply, setReply] = useState(null);
  const [currentThreadId, setCurrentThreadId] = useState(createThreadId);
  const [PrevChat, setPrevChat] = useState([]);
  const [newChat, setnewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  const provideContextValue = {
    prompt,
    setPrompt,
    Reply,
    setReply,
    currentThreadId,
    setCurrentThreadId,
    newChat,
    setnewChat,
    PrevChat,
    setPrevChat,
    allThreads,
    setAllThreads,
  };

  return (
    <div className="app">
      <MyContext.Provider value={provideContextValue}>
        <Sidebar />
        <ChatWindow />
        <AuthModal />
      </MyContext.Provider>
    </div>
  );
}

export default App;
