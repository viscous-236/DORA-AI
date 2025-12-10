import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.json({ 
    status: "ok",
    service: "DAO Governance Co-Pilot AI Agent",
    timestamp: new Date().toISOString()
  });
});
