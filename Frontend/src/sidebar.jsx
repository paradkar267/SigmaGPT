// Sidebar panel: lists threads and supports create, search, rename, delete, and switch.
import "./sidebar.css";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { v1 as uuidv1 } from "uuid";
import blackLogo from "./assets/blacklogo.png";
import { apiFetch } from "./api.js";
import { MyContext } from "./Mycontext.jsx";
import { useAuth } from "./useAuth.js";

function Sidebar() {
  const {
    allThreads,
    currentThreadId,
    setAllThreads,
    setCurrentThreadId,
    setnewChat,
    setPrevChat,
    setPrompt,
    setReply,
  } = useContext(MyContext);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [renamingThreadId, setRenamingThreadId] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");

  const filteredThreads = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return allThreads;
    return allThreads.filter((thread) => thread.title.toLowerCase().includes(search));
  }, [allThreads, searchTerm]);

  const getAllThreads = useCallback(async () => {
    if (!user) {
      setAllThreads([]);
      return;
    }

    try {
      const response = await apiFetch("/thread");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      if (Array.isArray(data)) {
        setAllThreads(
          data.map((thread) => ({
            threadId: thread.ThreadId,
            title: thread.title,
          })),
        );
      } else {
        console.error("Expected an array of threads, got:", data);
      }
    } catch (err) {
      console.error("Error fetching threads. Is the backend server running?", err);
    }
  }, [setAllThreads, user]);

  useEffect(() => {
    getAllThreads();
  }, [currentThreadId, getAllThreads]);

  const createNewChat = () => {
    setnewChat(true);
    setPrompt("");
    setReply(null);
    setCurrentThreadId(uuidv1());
    setPrevChat([]);
  };

  const deleteThread = async (event, threadId) => {
    event.stopPropagation();

    try {
      const response = await apiFetch(`/thread/${threadId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAllThreads(allThreads.filter((thread) => thread.threadId !== threadId));
        if (currentThreadId === threadId) createNewChat();
        return;
      }

      const errData = await response.json();
      alert(`Failed to delete thread: ${errData.error || "Unknown error"}`);
    } catch (err) {
      console.error("Error deleting thread:", err);
    }
  };

  const startRename = (event, thread) => {
    event.stopPropagation();
    setRenamingThreadId(thread.threadId);
    setRenameTitle(thread.title);
  };

  const cancelRename = () => {
    setRenamingThreadId(null);
    setRenameTitle("");
  };

  const saveRename = async (threadId) => {
    const title = renameTitle.trim();
    if (!title) {
      cancelRename();
      return;
    }

    const currentTitle = allThreads.find((thread) => thread.threadId === threadId)?.title;
    if (title === currentTitle) {
      cancelRename();
      return;
    }

    try {
      const response = await apiFetch(`/thread/${threadId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      setAllThreads((prev) =>
        prev.map((thread) =>
          thread.threadId === threadId ? { ...thread, title: data.title } : thread,
        ),
      );
      cancelRename();
    } catch (err) {
      console.error("Error renaming thread:", err);
      alert("Unable to rename this chat.");
    }
  };

  const handleRenameKeyDown = (event, threadId) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveRename(threadId);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  };

  const changeThread = async (newthreadId) => {
    if (renamingThreadId) return;

    setCurrentThreadId(newthreadId);

    try {
      const response = await apiFetch(`/thread/${newthreadId}`);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const res = await response.json();
      const historyToLoad = Array.isArray(res) ? res : res.messages || [];
      setPrevChat(historyToLoad);
      setnewChat(false);
      setPrompt("");
      setReply(null);
    } catch (err) {
      console.error("Error changing thread. Is the backend running?", err);
      alert("Unable to load chat history. Please ensure the backend server is running on port 8000.");
    }
  };

  return (
    <section className="sidebar">
      <button className="new-chat-button" onClick={createNewChat} type="button">
        <span className="logo-box">
          <img alt="GPT logo" className="sidebar-logo" src={blackLogo} />
        </span>
        <span className="new-chat-label">New chat</span>
        <i className="new-chat-icon fa-regular fa-pen-to-square" aria-hidden="true" />
      </button>

      <label className="historySearch">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search chats"
          type="search"
          value={searchTerm}
        />
      </label>

      <ul className="history">
        {filteredThreads?.map((thread, index) => (
          <li
            className={thread.threadId === currentThreadId ? "highlited" : ""}
            key={thread.threadId || index}
            onClick={() => changeThread(thread.threadId)}
          >
            {renamingThreadId === thread.threadId ? (
              <input
                autoFocus
                className="renameInput"
                onBlur={() => saveRename(thread.threadId)}
                onChange={(event) => setRenameTitle(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => handleRenameKeyDown(event, thread.threadId)}
                value={renameTitle}
              />
            ) : (
              <>
                <span className="threadTitle">{thread.title}</span>
                <span className="threadActions">
                  <button
                    aria-label="Rename chat"
                    className="threadIconBtn"
                    onClick={(event) => startRename(event, thread)}
                    title="Rename chat"
                    type="button"
                  >
                    <i className="fa-regular fa-pen-to-square" aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Delete chat"
                    className="threadIconBtn deleteThread"
                    onClick={(event) => deleteThread(event, thread.threadId)}
                    title="Delete chat"
                    type="button"
                  >
                    <i className="fa-solid fa-trash-can" aria-hidden="true" />
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="sign">
        <p>by yashParadkar &hearts;</p>
      </div>
    </section>
  );
}

export default Sidebar;
