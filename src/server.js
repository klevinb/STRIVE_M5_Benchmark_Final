const express = require("express")
const cors = require("cors")
const { badRequest, notFound, genericError } = require("./errorHandlers")
const mediaRoutes = require("./services/media")
const reviewsRoutes = require("./services/reviews")
const listEndpoints = require("express-list-endpoints")
const { join } = require("path")
const helmet = require("helmet")

const server = express()

const publicFolderPath = join(__dirname, "../public")

const port = process.env.PORT

const allowedConntections =
    process.env.NODE_ENV = "production"
        ?
        [process.env.FE_URL]
        :
        [process.env.FE_DEV]

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedConntections.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS!"))
        }
    }
}

server.use(express.json())
server.use(cors())
server.use(helmet())
server.use(express.static(publicFolderPath))
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