"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const analyzeProposal_1 = require("./routes/analyzeProposal");
const health_1 = require("./routes/health");
const dotenv_1 = require("dotenv");
const x402_express_1 = require("x402-express");
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)();
if (process.env.ENABLE_LOCAL_RAG === "true") {
    console.log("🔍 Starting Local RAG server...");
    const rag = (0, child_process_1.spawn)("python3", ["local_rag_server.py"], {
        cwd: process.cwd(),
        stdio: "inherit",
    });
    rag.on("error", (err) => {
        console.error("❌ Failed to start Local RAG:", err);
    });
    rag.on("exit", (code) => {
        if (code !== 0) {
            console.error(`❌ Local RAG exited with code ${code}`);
        }
    });
    process.on("SIGINT", () => {
        console.log("🛑 Shutting down Local RAG...");
        rag.kill();
        process.exit();
    });
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
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
}));
app.options("*", (0, cors_1.default)());
app.use(express_1.default.json());
const payTo = process.env.PAY_TO_ADDRESS;
const facilitatorUrl = (process.env.FACILITATOR_URL ||
    "https://facilitator.x402.org");
app.use((0, x402_express_1.paymentMiddleware)(payTo, {
    "POST /api/analyze-proposal": {
        price: "$0.001",
        network: "base-sepolia",
    },
}, {
    url: facilitatorUrl,
}));
app.use("/api/analyze-proposal", analyzeProposal_1.analyzeProposalRouter);
app.use("/api/health", health_1.healthRouter);
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
//# sourceMappingURL=index.js.map