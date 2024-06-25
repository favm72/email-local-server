const fs = require("fs")
const path = require("path")
const { SMTPServer } = require("smtp-server")
const { simpleParser } = require("mailparser")

const Storage = require("./storage.js")

const storage = new Storage()
storage.init()

const options = {
  key: fs.readFileSync(path.join(__dirname, "..", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "..", "cert.pem")),
}

const server = new SMTPServer({
  key: options.key,
  cert: options.cert,
  secure: false,
  logger: true,
  disabledCommands: ["AUTH", "STARTTLS"],
  authOptional: true,
  authMethods: ["PLAIN", "LOGIN"],
  onConnect(session, callback) {
    return callback()
  },
  onAuth(auth, session, callback) {
    return callback(null, { user: auth.username })
  },
  onData(stream, session, callback) {
    simpleParser(stream, (err, parsed) => {
      if (err) {
        console.error(err)
        return callback()
      }
      storage.saveEmail({
        date: new Date().toISOString(),
        from: parsed.from.text,
        to: parsed.to.text,
        subject: parsed.subject,
        body: parsed.html,
      })
      return callback()
    })
  },
  onMailFrom(address, session, callback) {
    return callback()
  },
})

server.listen(2500, () => {
  console.log("SMTP server is running on port 2500")
})
