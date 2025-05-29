import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { auth, userRole } = req.body;

  if (!auth || !userRole) {
    return res.status(400).json({ error: 'Missing data' });
  }

  res.setHeader('Set-Cookie', [
    serialize('auth', auth, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }),
    serialize('userRole', userRole, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }),
  ]);

  return res.status(200).json({ message: 'Cookies set' });
} 