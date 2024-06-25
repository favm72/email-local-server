const path = require("path")
const Driver = require("sqlite3").Database
const { open, Database } = require("sqlite")

class Storage {
  constructor() {
    /** @type {Database} */
    this.db = null
  }

  async init() {
    this.db = await open({
      filename: path.join(__dirname, "emails.db"),
      driver: Driver,
    })

    await this.db.exec(`CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      sender TEXT,
      recipient TEXT,
      subject TEXT,
      body TEXT
    )`)
  }

  async close() {
    await this.db.close()
  }

  async saveEmail(email) {
    const { date, from, to, subject, body } = email
    const query = `INSERT INTO emails (date, sender, recipient, subject, body) VALUES (?, ?, ?, ?, ?)`
    const result = await this.db.run(query, [date, from, to, subject, body])
    return result.lastID
  }

  async listEmails() {
    const query = `SELECT * FROM emails`
    return await this.db.all(query)
  }
}

module.exports = Storage
