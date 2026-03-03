/// <reference path="./types/express.d.ts" />
import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import { db } from '../db.js'
import sessioncheck from '../middleware/sessioncheck.js'


const app = express()


app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser(process.env.SALT_ROUNDS))
app.use(express.urlencoded({ extended: true }));
console.log(Date(), 'Server Running')

interface UserInfo {
  id: number,
  email: string,
  hash: string,
  role: string //either client or vendor 
}

interface SqliteError extends Error {
  code: string
}
interface AppSession {
  id: string,
  userId: number,
  createdAt: Date,
  expiresAt: Date
}
app.set('view engine', 'ejs')

app.use((_req, _res, next) => {
  console.log('LOGS:');
  next();
});

app.get('/', (_req, res, _next) => res.send('homepage'))

app.get('/logout', sessioncheck, (req, res, _next) => {
  const sessionId = req.cookies?.session_id
  db.prepare(`DELETE FROM sessions WHERE id=?`).run(sessionId)
  res.clearCookie("session_id")
  res.redirect('/')
})

app.post('/', (req, res) => {
  const userId = db.prepare(` SELECT user_id FROM users WHERE email=?`).get(req.body.email)
  if (userId === undefined) {
    return res.send('error becasue userid undefined')
  }

  const userinfo = db.prepare(`SELECT * FROM users WHERE id=?`).get(userId) as UserInfo | undefined
  if (!userinfo) return res.status(401)

  if (userId && userinfo) {
    if (userinfo.role === 'client') return res.redirect(`/users/${userId}/client`)
    if (userinfo.role === 'vendor') return res.redirect(`/users/${userId}/vendor`)
  }
  res.send('autologin from cookie didnt work')
})

app.get(`/users/:userid/client`, (req, res, _next) => {
  const userid = req.params.userid
  res.send(`success from userid:${userid}`)
})

app.get(`/users/:userid/vendor`, (req: Request, res: Response, _next: NextFunction) => {
  const userid = req.params.userid
  res.send(`success from userid:${userid}/vendor`)

})


function check_user(req: Request, res: Response, next: NextFunction): void {
  const user = req.user
  if (!user.email || !user.hash || !user.role) {
    res.status(400).json({ message: "invalid user" })
    return
  }
  next()
}

app.post('/signup', async (req, res, _next: NextFunction) => {
  const saltrounds = Number(process.env.SALT_ROUNDS)
  const hash = await bcrypt.hash(req.body.password, saltrounds)
  try {
    const row = db.prepare(`
      INSERT INTO users (email,hash,role) VALUES (?,?,?) RETURNING id,email,role;
      `).get(req.body.email, hash, req.body.role) as UserInfo
    if (!row) {
      return res.status(404)
    }

    check_user(req, res, _next)

    const session: AppSession = {
      id: crypto.randomUUID(),
      userId: row.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60)

    }
    req.sessionId = session.id
    res.cookie('session_id', session.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    })
    if (row === undefined) {
      return res.status(500)
    }
    try {
      db.prepare('INSERT INTO sessions (id,user_id) VALUES (?,?);').run(session.id, session.userId)
    } catch (error) {
      console.log(error)
    }
    if (row.role === 'client') return res.redirect(`/users/${session.userId}/client`)
    if (row.role === 'vendor') return res.redirect(`/users/${session.userId}/vendor`)
    res.redirect('/')
  } catch (err: unknown) {
    const error = err as SqliteError
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.send('user already exists')
    }
  }
});

app.get('/api/dashboard/summary', (req, res, _next) => {
  res.json({
    "Row 1": db.prepare(`SELECT * FROM users WHERE id=?`).get(req.query.id)
  });
});
const PORT = process.env.PORT || 1738
app.listen(PORT, () => {
  console.log(`\nListening on http://localhost:${PORT}`)
})