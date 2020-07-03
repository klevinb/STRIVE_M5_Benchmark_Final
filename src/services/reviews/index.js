const express = require("express")
const {
    readReviews,
    writeReviews
} = require("../../functions")
const { join } = require("path")
const uniqid = require("uniqid")

const route = express.Router()

const reviewsPath = join(__dirname, "reviews.json")

route.get("/", async (req, res, next) => {
    try {
        const reviews = await readReviews(reviewsPath)
        res.status(200).send(reviews)
    } catch (error) {
        next(error)
    }
})

route.get("/:id", async (req, res, next) => {
    try {
        const reviews = await readReviews(reviewsPath)
        const findReview = reviews.find(m => m._id === req.params.id)
        if (findReview) {
            res.status(200).send(findReview)
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
        const reviews = await readReviews(reviewsPath)

        const newReview = { _id: uniqid(), ...req.body, createdAt: new Date() }
        reviews.push(newReview)
        await writeReviews(reviewsPath, reviews)
        res.status(201).send("Created")

    } catch (error) {
        next(error)
    }
})

route.put("/:id", async (req, res, next) => {
    try {
        const reviews = await readReviews(reviewsPath)
        const findReview = reviews.find(m => m._id === req.params.id)
        if (findReview) {
            const index = reviews.indexOf(findReview)
            const updatedReview = { ...findReview, ...req.body }
            reviews[index] = updatedReview

            await writeReviews(reviewsPath, reviews)
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

route.delete("/:id", async (req, res, next) => {
    try {
        const reviews = await readReviews(reviewsPath)
        const findReview = reviews.find(m => m._id === req.params.id)
        if (findReview) {
            await writeReviews(reviewsPath, reviews.filter(m => m._id !== req.params.id))
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