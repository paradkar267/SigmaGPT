import "./chatwindow.css";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ScaleLoader } from "react-spinners";
import "highlight.js/styles/atom-one-dark.css";
import Chat from "./chat";
import { MyContext } from "./Mycontext.jsx";
import { useAuth } from "./useAuth.js";

const API_BASE = "http://localhost:8000/api";

export default function ChatWindow() {
  const {
    allThreads,
    currentThreadId,
    PrevChat,
    prompt,
    setAllThreads,
    setPrompt,
    setReply,
    setPrevChat,
    setnewChat,
  } = useContext(MyContext);

  const { user, logout, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(null);
  const dropdownRef = useRef(null);

  const lastUserMessage = useMemo(
    () => [...PrevChat].reverse().find((chat) => chat.role === "user"),
    [PrevChat],
  );
  const canRegenerate = Boolean(user && lastUserMessage && !loading);

  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const showAuthNotice = () => {
    openAuthModal("login");
    setNotice("Please sign in to start chatting.");
  };

  const handleProfileClick = () => {
    if (user) {
      setDropdownOpen((value) => !value);
      return;
    }

    openAuthModal("login");
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    setNotice("You've been signed out.");
  };

  const addThreadPreview = (threadId, title) => {
    setAllThreads((prev) => {
      if (prev.some((thread) => thread.threadId === threadId)) return prev;
      return [{ threadId, title: title.slice(0, 40) || "New Thread" }, ...prev];
    });
  };

  const sendMessage = async (message) => {
    try {
      setLoading(true);
      setnewChat(false);
      setPrompt("");
      setNotice("");
      setReply(null);
      setPrevChat((prev) => [...prev, { role: "user", content: message }]);

      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, threadId: currentThreadId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      setPrevChat((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setReply(data.reply);
      addThreadPreview(data.threadId || currentThreadId, message);
    } catch (error) {
      console.error("Error fetching reply:", error);
      setNotice(error.message || "Unable to send message. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const getReply = async (event) => {
    event.preventDefault();

    if (!user) {
      showAuthNotice();
      return;
    }

    const message = prompt.trim();
    if (!message || loading) return;
    await sendMessage(message);
  };

  const handlePromptKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const usePrompt = (message) => {
    if (!user) {
      showAuthNotice();
      return;
    }

    setPrompt(message);
  };

  const copyMessage = async (message, index) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(index);
      window.setTimeout(() => setCopiedMessage(null), 1400);
    } catch (error) {
      console.error("Unable to copy message:", error);
      setNotice("Unable to copy message.");
    }
  };

  const downloadChat = () => {
    if (!PrevChat.length) return;

    const title = allThreads.find((thread) => thread.threadId === currentThreadId)?.title || "sigmaGPT chat";
    const markdown = PrevChat.map((chat) => {
      const label = chat.role === "user" ? "You" : "sigmaGPT";
      return `## ${label}\n\n${chat.content}`;
    }).join("\n\n");
    const blob = new Blob([`# ${title}\n\n${markdown}\n`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "chat"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const regenerateReply = async () => {
    if (!canRegenerate) return;

    try {
      setLoading(true);
      setNotice("");
      setPrevChat((prev) => {
        if (prev.at(-1)?.role === "assistant") return prev.slice(0, -1);
        return prev;
      });

      const response = await fetch(`${API_BASE}/chat/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          threadId: currentThreadId,
          message: lastUserMessage.content,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      setPrevChat((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setReply(data.reply);
    } catch (error) {
      console.error("Error regenerating reply:", error);
      setNotice(error.message || "Unable to regenerate reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatwindow">
      <div className="navbar">
        <span>
          sigmaGPT <i className="fa-solid fa-angle-down" aria-hidden="true" />
        </span>

        <div className="topActions">
          <button
            aria-label="Regenerate response"
            className="topActionBtn"
            disabled={!canRegenerate}
            onClick={regenerateReply}
            title="Regenerate response"
            type="button"
          >
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
          </button>
          <button
            aria-label="Download chat"
            className="topActionBtn"
            disabled={!PrevChat.length}
            onClick={downloadChat}
            title="Download chat"
            type="button"
          >
            <i className="fa-solid fa-download" aria-hidden="true" />
          </button>

          <div className="navbarRight" ref={dropdownRef}>
            <button
              aria-label={user ? "Open profile menu" : "Sign in"}
              className={`userIconBtn${user ? " loggedIn" : ""}`}
              onClick={handleProfileClick}
              title={user ? user.name : "Sign in"}
              type="button"
            >
              {user ? (
                <span className="userInitials">{getInitials(user.name)}</span>
              ) : (
                <i className="fa-solid fa-user" aria-hidden="true" />
              )}
            </button>

            {user && dropdownOpen && (
              <div className="userDropdown">
                <div className="dropdownUserInfo">
                  <div className="dropdownAvatar">{getInitials(user.name)}</div>
                  <div className="dropdownUserName">{user.name}</div>
                  <div className="dropdownUserEmail">{user.email}</div>
                </div>
                <div className="dropdownItems">
                  <button className="dropdownItem" type="button">
                    <i className="fa-regular fa-user" aria-hidden="true" /> Profile
                  </button>
                  <button className="dropdownItem" type="button">
                    <i className="fa-solid fa-gear" aria-hidden="true" /> Settings
                  </button>
                  <button className="dropdownItem" type="button">
                    <i className="fa-solid fa-arrow-up-wide-short" aria-hidden="true" /> Upgrade
                  </button>
                  <div className="dropdownDivider" />
                  <button className="dropdownItem logout" onClick={handleLogout} type="button">
                    <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {notice && <p className="notice">{notice}</p>}

      <Chat
        copiedMessage={copiedMessage}
        onCopyMessage={copyMessage}
        onPromptSelect={usePrompt}
      />

      {loading && (
        <div className="loaderWrap">
          <ScaleLoader color="#bbbebd" height={24} width={3} />
        </div>
      )}

      <form className="chatInput" onSubmit={getReply}>
        <div className="userInput">
          <textarea
            disabled={!user}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handlePromptKeyDown}
            placeholder={user ? "Message sigmaGPT" : "Sign in to start chatting..."}
            rows={1}
            value={prompt}
          />
          <button
            aria-label="Send message"
            className="submitButton"
            disabled={loading || !user || !prompt.trim()}
            type="submit"
          >
            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
          </button>
        </div>
        <p className="info">
          sigmaGPT can make mistakes, please verify critical information from reliable sources.
        </p>
      </form>
    </div>
  );
}
