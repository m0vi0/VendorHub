import Database, { Database as DatabaseType } from "better-sqlite3"
export const db: DatabaseType = new Database("database.db")

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    role TEXT NOT NULL
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run()
