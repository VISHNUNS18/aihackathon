import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function auth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    (req as Request & { agent: unknown }).agent = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
