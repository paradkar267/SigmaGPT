import "./chat.css";
import { useContext, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { MyContext } from "./Mycontext.jsx";

const starterPrompts = [
  "Draft a focused 3-day study plan for React and Node.js.",
  "Review this idea and turn it into a polished project roadmap.",
  "Explain MongoDB sessions and cookies with a small example.",
  "Create a clean portfolio bio for a full-stack developer.",
];

export default function Chat({ copiedMessage, onCopyMessage, onPromptSelect }) {
  const { newChat, PrevChat } = useContext(MyContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [PrevChat]);

  return (
    <div className="chat">
      {newChat ? (
        <div className="emptyChat">
          <h1>Start a New Chat!</h1>
          <div className="starterGrid">
            {starterPrompts.map((starter) => (
              <button
                className="starterPrompt"
                key={starter}
                onClick={() => onPromptSelect(starter)}
                type="button"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chats">
          {PrevChat?.map((chat, index) => (
            <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={index}>
              <div className={chat.role === "user" ? "userMessage" : "gptMessage"}>
                {chat.role === "user" ? (
                  <p>{chat.content}</p>
                ) : (
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {chat.content}
                  </ReactMarkdown>
                )}
                <button
                  aria-label="Copy message"
                  className="copyMessageBtn"
                  onClick={() => onCopyMessage(chat.content, index)}
                  title="Copy message"
                  type="button"
                >
                  <i
                    className={copiedMessage === index ? "fa-solid fa-check" : "fa-regular fa-copy"}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
