const express = require("express")
const cors = require("cors")
const { badRequest, notFound, genericError } = require("./errorHandlers")
const mediaRoutes = require("./services/media")
const reviewsRoutes = require("./services/reviews")
const listEndpoints = require("express-list-endpoints")
const { join } = require("path")

const server = express()

const publicFolderPath = join(__dirname, "../public")

const port = 3003

server.use(express.json())
server.use(express.static(publicFolderPath))
server.use(cors())
//Routes
server.use("/media", mediaRoutes)
server.use("/reviews", reviewsRoutes)

//error handlers

server.use(badRequest)
server.use(notFound)
server.use(genericError)

console.log(listEndpoints(server))
server.listen(port, () => {
    console.log(`Serever runinng at port:${port}`)
})