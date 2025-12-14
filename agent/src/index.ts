import express from "express";
import { spawn } from "child_process";
import { analyzeProposalRouter } from "./routes/analyzeProposal";
import { healthRouter } from "./routes/health";
import { config } from "dotenv";
import { paymentMiddleware } from "x402-express";
import cors from "cors";

config();

if (process.env.ENABLE_LOCAL_RAG === "true") {
  console.log("🔍 Starting Local RAG server...");

  const rag = spawn("python3", ["local_rag_server.py"], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  rag.on("error", (err) => {
    console.error("Failed to start Local RAG:", err);
  });

  rag.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Local RAG exited with code ${code}`);
    }
  });

  process.on("SIGINT", () => {
    console.log("Shutting down Local RAG...");
    rag.kill();
    process.exit();
  });
}

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Payment",
      "X-Payment-TxHash",
      "X-Payment-Network",
      "X-Payment-Amount",
      "X-Payment-Token",
      "X-Payment-Signature",
      "X-Payment-Address",
      "X-Payment-Challenge",
      "X-Payment-Payload",
      "Access-Control-Expose-Headers",
    ],
    exposedHeaders: [
      "X-Payment-Required",
      "X-Payment-Address",
      "X-Payment-Amount",
      "X-Payment-Network",
      "X-Payment-Token",
      "X-Payment-Challenge",
      "X-Payment-Payload",
      "X-Payment-Response",
    ],
  })
);

app.options("*", cors());
app.use(express.json());

const payTo = process.env.PAY_TO_ADDRESS as `0x${string}` | undefined;


  const facilitatorUrl = (process.env.FACILITATOR_URL ||
    "https://facilitator.x402.org") as `${string}://${string}`;

  app.use(
    paymentMiddleware(
      payTo!,
      {
        "POST /api/analyze-proposal": {
          price: "$0.001",
          network: "base-sepolia",
        },
      },
      {
        url: facilitatorUrl,
      }
    )
  );

app.use("/api/analyze-proposal", analyzeProposalRouter);
app.use("/api/health", healthRouter);

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log("Response headers:", res.getHeaders());
  });
  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI Agent server listening on port ${PORT}`);
});
