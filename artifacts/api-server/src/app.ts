import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";
import healthRouter from "./routes/health.js";
import worldRouter from "./routes/world.js";
import agentsRouter from "./routes/agents.js";
import conversationsRouter from "./routes/conversations.js";
import economyRouter from "./routes/economy.js";
import governanceRouter from "./routes/governance.js";
import contentRouter from "./routes/content.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", healthRouter);
app.use("/api/world", worldRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/economy", economyRouter);
app.use("/api/governance", governanceRouter);
app.use("/api/content", contentRouter);

export default app;
