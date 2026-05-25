import express from "express";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import getResponseFromOpenAI from "../utils/openai.js";
import Thread from "../model/Thread.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const isDatabaseConnected = () => mongoose.connection.readyState === 1;
const ownerFilter = (req) => ({
    $or: [
        { owner: req.user._id },
        { owner: { $exists: false } },
        { owner: null },
    ],
});
const threadQuery = (req, threadId) => ({
    ThreadId: threadId,
    ...ownerFilter(req),
});
const claimLegacyThread = async (thread, req) => {
    if (thread && !thread.owner) {
        thread.owner = req.user._id;
        await thread.save();
    }
    return thread;
};

// Protect all routes below this line
router.use(protect);

router.get("/chat", (req, res) => {
    res.json({
        message: "Chat endpoint is running",
        method: "POST",
        url: "/api/chat",
        body: {
            threadId: "optional existing thread id",
            message: "your message"
        }
    });
});

router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            ThreadId: randomUUID(),
            title: "Test sample",

        });
        const response = await thread.save();
        res.status(200).json({ message: "Thread created successfully", data: response });
    }
    catch (err) {
        console.error("Error creating thread:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// get all threads
const getThreads = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            console.warn("Database not connected. Returning empty threads list.");
            return res.json([]);
        }
        const threads = await Thread.find(ownerFilter(req)).sort({ updatedAt: -1 });
        // decreasing order of time so that latest thread will be on top
        res.json(threads);
    } catch (err) {
        console.error("Error fetching threads:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// get thread by id
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await claimLegacyThread(await Thread.findOne(threadQuery(req, threadId)), req);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.send(thread);
    } catch (err) {
        console.error("Error fetching thread:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// delete thread by id
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ error: "Database not connected" });
        }
        const deletedthread = await Thread.findOneAndDelete(threadQuery(req, threadId));
        if (!deletedthread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json({ message: "Thread deleted successfully" });
    } catch (err) {
        console.error("Error deleting thread:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// rename thread by id
router.patch("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    const title = req.body.title?.trim();

    if (!title) {
        return res.status(400).json({ error: "title is required" });
    }

    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ error: "Database not connected" });
        }

        const thread = await Thread.findOneAndUpdate(
            threadQuery(req, threadId),
            { owner: req.user._id, title: title.slice(0, 80), updatedAt: new Date() },
            { new: true },
        );

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread);
    } catch (err) {
        console.error("Error renaming thread:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// chat route
router.post("/chat", async (req, res) => {
    const { message } = req.body;
    const threadId = req.body.threadId || randomUUID();

    if (!message) {
        return res.status(400).json({ error: "message is required" });
    }
    try {
        if (!isDatabaseConnected()) {
            const assistantReply = await getResponseFromOpenAI(message);
            return res.json({
                threadId,
                reply: assistantReply,
                saved: false,
                warning: "Database is not connected, so this chat was not saved."
            });
        }

        let thread = await claimLegacyThread(await Thread.findOne(threadQuery(req, threadId)), req);
        if (!thread) {
            thread = new Thread({
                ThreadId: threadId,
                owner: req.user._id,
                title: message.slice(0, 40) || "New Thread",
                messages: []
            });
        }

        thread.messages.push({ role: "user", content: message });
        const assistantReply = await getResponseFromOpenAI(message);
        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();
        await thread.save();

        res.json({ threadId: thread.ThreadId, reply: assistantReply });
    }
    catch (err) {
        console.error("Error sending chat message:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

router.post("/chat/regenerate", async (req, res) => {
    const { message, threadId } = req.body;

    if (!threadId) {
        return res.status(400).json({ error: "threadId is required" });
    }

    try {
        if (!isDatabaseConnected()) {
            if (!message) {
                return res.status(400).json({ error: "message is required when database is unavailable" });
            }

            const assistantReply = await getResponseFromOpenAI(message);
            return res.json({
                threadId,
                reply: assistantReply,
                saved: false,
                warning: "Database is not connected, so this regenerated reply was not saved."
            });
        }

        const thread = await claimLegacyThread(await Thread.findOne(threadQuery(req, threadId)), req);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        if (thread.messages.at(-1)?.role === "assistant") {
            thread.messages.pop();
        }

        const lastUserMessage = [...thread.messages].reverse().find((item) => item.role === "user");
        if (!lastUserMessage) {
            return res.status(400).json({ error: "No user message found to regenerate from" });
        }

        const assistantReply = await getResponseFromOpenAI(lastUserMessage.content);
        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();
        await thread.save();

        res.json({ threadId: thread.ThreadId, reply: assistantReply });
    } catch (err) {
        console.error("Error regenerating chat reply:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});



router.get("/thread", getThreads);
router.get("/threads", getThreads);


export default router;
