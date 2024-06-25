const express = require("express")
const nodemailer = require("nodemailer")
const Storage = require("./storage.js")

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 2500,
  auth: {
    user: "admin@sample.com",
    pass: "password",
  },
})

const storage = new Storage()
storage.init()

const app = express()

function sendEmailAsync(options) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, function (error, info) {
      if (error) {
        reject(error)
      } else {
        resolve(info)
      }
    })
  })
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/emails", async (req, res) => {
  try {
    const emails = await storage.listEmails()
    res.json(emails)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: "Failed to fetch emails" })
  }
})

app.post("/email", async (req, res) => {
  const { to, subject, body, from } = req.body

  const mailOptions = {
    from,
    to,
    subject,
    html: body,
    encoding: "utf-8",
  }

  try {
    await sendEmailAsync(mailOptions)
    res.status(200).send({ message: "Email sent successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: "Failed to send email" })
  }
})

app.listen(3003, () => {
  console.log("Server is running on port 3003")
})
