import express from "express";
import cors from "cors";
import Redis from "ioredis";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const redisSub = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const redisPub = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const channels = new Map();

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const boardId = req.query.boardId;
  if (!boardId) {
    res.write("event: error\\ndata: {\\\"message\\\":\\\"boardId required\\\"}\\n\\n");
    return res.end();
  }

  const key = boardId.toString();
  if (!channels.has(key)) {
    const sub = redisSub.duplicate();
    sub.subscribe(`board:${key}`);
    sub.on("message", (_channel, message) => {
      const clients = channels.get(key)?.clients || new Set();
      for (const client of clients) {
        client.write(`event: board:update\\ndata: ${message}\\n\\n`);
      }
    });
    channels.set(key, { sub, clients: new Set() });
  }

  const channel = channels.get(key);
  channel.clients.add(res);

  req.on("close", () => {
    channel.clients.delete(res);
    if (channel.clients.size === 0) {
      try { channel.sub.unsubscribe(); channel.sub.disconnect(); } catch {}
      channels.delete(key);
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`sse-service listening on ${port}`);
});
