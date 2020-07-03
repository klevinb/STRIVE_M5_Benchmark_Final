const express = require("express")

const server = express()

const port = 3001

server.use(express.json())


server.listen(port, () => {
    console.log(`Serever runinng at port:${port}`)
})