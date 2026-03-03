import type { Request, Response, NextFunction } from "express";
import { db } from "../db.js";

function checksSession(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.session_id;
  
  if (!sessionId) {
    res.status(401).send('Authentication required');
    return;
  }
  
  const session = db.prepare(
    `SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')`
  ).get(sessionId);
  
  if (!session) {
    res.clearCookie("session_id");
    res.status(401).send('Session expired or invalid');
    return;
  }
  
  next();
}

export default checksSession;
