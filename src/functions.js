const { writeJson, readJson } = require("fs-extra")

const readMedia = async (filePath) => {
    try {
        const books = await readJson(filePath)
        return books
    } catch (error) {
        throw new Error(error)
    }
}

const writeMedia = async (filePath, data) => {
    try {
        await writeJson(filePath, data)
    } catch (error) {
        throw new Error(error)
    }
}
const readReviews = async (filePath) => {
    try {
        const comments = await readJson(filePath)
        return comments
    } catch (error) {
        throw new Error(error)
    }
}

const writeReviews = async (filePath, data) => {
    try {
        await writeJson(filePath, data)
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    readMedia,
    writeMedia,
    readReviews,
    writeReviews
}