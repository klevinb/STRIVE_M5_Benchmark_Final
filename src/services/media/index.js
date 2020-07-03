const express = require("express")
const {
    readMedia,
    writeMedia,
    readReviews
} = require("../../functions")
const { join } = require("path")
const multer = require("multer")
const fs = require("fs-extra")
const axios = require("axios")
const PdfPrinter = require('pdfmake')
const sgMail = require("@sendgrid/mail")

const route = express.Router()

const mediaPath = join(__dirname, "media.json")
const reviewsPath = join(__dirname, "../reviews/reviews.json")
const upload = multer()
const mediaImgPath = join(__dirname, "../../../public/media/img")


route.get("/", async (req, res, next) => {
    try {
        const media = await readMedia(mediaPath)
        if (req.query && req.query.title) {
            const findMedia = media.filter(m =>
                m.Title.toLowerCase().indexOf(req.query.title.toLowerCase()) !== -1
                ||
                m.Year === req.query.Year
                ||
                m.Type.toLowerCase().indexOf(req.query.type.toLowerCase()) !== -1
            )
            res.status(200).send(findMedia)
        } else {
            res.status(200).send(media)
        }
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

route.get("/:imdbID/reviews", async (req, res, next) => {
    try {
        const media = await readMedia(mediaPath)
        const findMedia = media.find(m => m.imdbID === req.params.imdbID)
        if (findMedia) {
            const reviews = await readReviews(reviewsPath)
            const findReviews = reviews.filter(r => r.elementId === req.params.imdbID)
            if (findReviews.length > 0) {
                res.status(200).send(findReviews)
            } else {
                const err = new Error()
                err.httpStatusCode = 404
                next(err)
            }
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

route.post("/:imdbID/upload", upload.single("file"), async (req, res, next) => {
    try {
        await fs.writeFile(join(mediaImgPath, `${req.file.originalname}`), req.file.buffer)
        res.status(201).send("Upload Successfuly!")
    } catch (error) {
        next(error)
    }
})

route.get("/omdbapi/:imdbID", async (req, res, next) => {
    try {
        const resp = await axios.get("http://www.omdbapi.com/?apikey=71eeae0a&i=" + req.params.imdbID)
        res.status(200).send(resp.data)
    } catch (error) {
        next(error)
    }
})
route.get("/search/query", async (req, res, next) => {
    if (req.query && req.query.title) {
        try {
            const resp = await axios.get("http://www.omdbapi.com/?apikey=71eeae0a&t=" + req.query.title + "&plot=full")
            res.status(200).send(resp.data)
        } catch (error) {
            next(error)
        }
    } else {
        const err = new Error()
        err.httpStatusCode = 400
        err.message = "You should provide us a title that you'd like to search!"
        next(err)
    }

})

route.get("/pdf/catalogue", async (req, res, next) => {
    try {
        if (req.query && req.query.title) {
            const media = await readMedia(mediaPath)
            const findMovie = media.filter(m => m.Title.toLowerCase().indexOf(req.query.title.toLowerCase()) !== -1)
            if (findMovie.length > 0) {
                const fonts = {
                    Roboto: {
                        normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
                        bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
                        italics: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
                        bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf'
                    }
                }
                const printer = new PdfPrinter(fonts)

                var docDefinition = {
                    content:
                        [
                            findMovie.map(m =>
                                `Title: ${m.Title}
                                Year: ${m.Year}
                                `
                            )
                        ]
                }
                pdfDoc = printer.createPdfKitDocument(docDefinition)
                res.setHeader("Content-Disposition", `attachment; filename=movies.pdf`)
                pdfDoc.pipe(res)
                pdfDoc.end()
            } else {
                const err = new Error()
                err.httpStatusCode = 404
                next(err)
            }
        } else {
            const err = new Error()
            err.httpStatusCode = 400
            err.message = "You should provide us the title of the movie!"
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

route.post("/email/sendCatalogue", async (req, res, next) => {
    try {
        const media = await readMedia(mediaPath)
        const findMedia = media.filter(m => m.Title.toLowerCase().indexOf(req.body.title.toLowerCase()) !== -1)
        if (findMedia.length > 0) {
            const fonts = {
                Roboto: {
                    normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
                    bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
                    italics: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
                    bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf'
                }
            }
            const printer = new PdfPrinter(fonts)

            var docDefinition = {
                content:
                    [
                        findMedia.map(m =>
                            `Title: ${m.Title}
                            Year: ${m.Year}
                            `
                        )
                    ]
            }
            pdfDoc = printer.createPdfKitDocument(docDefinition)
            pdfDoc.pipe(fs.createWriteStream(join(__dirname, `${req.body.email}.pdf`)))
            pdfDoc.end()

            const pdfData = join(__dirname, `${req.body.email}.pdf`)

            sgMail.setApiKey(process.env.SENDGRID_API_KEY)

            const sendEmail = async () => {
                fs.readFile(pdfData, function (err, data) {
                    let data_base64 = data.toString('base64')
                    sgMail.send({
                        to: `${req.body.email}`,
                        from: 'our@movies.com',
                        subject: 'Movies Catalogue',
                        text: 'Here is the list of the movies with this title!',
                        attachments: [{
                            filename: `MoviesCatalogue.pdf`,
                            content: data_base64,
                            type: 'application/pdf',
                            disposition: 'attachment',
                        }],
                    })
                })
            }

            setTimeout(sendEmail, 1000);
            res.status(201).send("Sent")
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