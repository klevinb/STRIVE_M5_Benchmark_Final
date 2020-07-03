const express = require("express")
const cors = require("cors")
const { badRequest, notFound, genericError } = require("./errorHandlers")
const mediaRoutes = require("./services/media")
const listEndpoints = require("express-list-endpoints")

const server = express()

const port = 3001

server.use(express.json())

server.use(cors())
//Routes
server.use("/media", mediaRoutes)

console.log(listEndpoints(server))
server.listen(port, () => {
    console.log(`Serever runinng at port:${port}`)
})