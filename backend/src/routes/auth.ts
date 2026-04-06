import { Router } from 'express';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

// Dev-only login — replace with SSO/LDAP in production
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  // TODO: validate against agent directory
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }
  const token = jwt.sign(
    { id: '1', email, name: email.split('@')[0], role: 'agent' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '8h' }
  );
  res.json({ token, agent: { id: '1', email, name: email.split('@')[0], role: 'agent' } });
});
