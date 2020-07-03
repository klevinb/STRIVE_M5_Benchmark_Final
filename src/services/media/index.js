const express = require("express")
const {
    readMedia,
    writeMedia,
} = require("../../functions")
const { join } = require("path")

const route = express.Router()

const mediaPath = join(__dirname, "media.json")

route.get("/", async (req, res, next) => {
    try {
        const media = await readMedia(mediaPath)
        res.status(200).send(media)
    } catch (error) {
        next(error)
    }
})

route.get("/:imdbID", async (req, res, next) => {
    try {
        const media = await readMedia(mediaPath)
        const findMedia = media.find(m => m.imdbID === req.params.imdbID)
        if (findMedia) {
            res.status(200).send(findMedia)
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

route.post("/", async (req, res, next) => {
    try {
        const media = await readMedia(mediaPath)
        const findMedia = media.find(m => m.imdbID === req.params.imdbID)
        if (findMedia) {
            res.status(400).send("Medias should have uniqe IDs")
        } else {
            const newMedia = { ...req.body }
            media.push(newMedia)
            await writeMedia(mediaPath, media)
            res.status(201).send("Created")
        }
    } catch (error) {
        next(error)
    }
})

route.put("/:imdbID", async (req, res, next) => {
    try {
        const media = await readMedia(mediaPath)
        const findMedia = media.find(m => m.imdbID === req.params.imdbID)
        if (findMedia) {
            const index = media.indexOf(findMedia)
            const updatedMedia = { ...findMedia, ...req.body }
            media[index] = updatedMedia

            await writeMedia(mediaPath, media)
            res.status(200).send("Updated!")

        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

route.delete("/:imdbID", async (req, res, next) => {
    try {
        const media = await readMedia(mediaPath)
        const findMedia = media.find(m => m.imdbID === req.params.imdbID)
        if (findMedia) {
            await writeMedia(mediaPath, media.filter(m => m.imdbID !== req.params.imdbID))
            res.status(200).send("Deleted!")
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
})
module.exports = route