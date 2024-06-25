const { spawn } = require("child_process")

const names = ["mail", "app"]
const children = []

names.forEach(name => {
  const child = spawn("node", [`src/${name}.js`])
  children.push(child)
  child.on("close", code => {
    console.log(`[${name}] exited with code ${code}`)
  })
  child.stdout.on("data", data => {
    console.log(`[${name}] ${data}`)
  })
  child.stderr.on("data", data => {
    console.error(`[${name}] ${data}`)
  })
})

process.on("SIGINT", () => {
  children.forEach(child => {
    child.kill()
  })
  process.exit(0)
})
