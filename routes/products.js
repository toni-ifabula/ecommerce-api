const express = require('express')
const router = express.Router()
const { body, validationResult, param } = require('express-validator');
const db = require('../db')

// import route handler
const { verifyToken, validationHandler } = require('../middleware')

router.get('/products', 
    verifyToken,
    async (req, res) => {
        await db.Product.find(function (err, result) {
            if (err) return res.status(404).send(err)
            else if (result.length<1) return res.status(200).send('Empty')

            res.status(200).send(result)
        })
})

router.get('/products/:nama', 
    param('nama').isAlpha().withMessage('Parameter Must Be Alpha'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        await db.Product.find({ nama: req.params.nama}, function (err, result) {
            if (err) return res.status(404).send(err)
            else if (result.length<1) return res.status(200).send('Not Found')

            res.status(200).send(result)
        })
})

router.post('/products', 
    body('nama').matches(/^[a-z0-9 ]+$/i).withMessage('tidak boleh kosong').isLength({ min: 2}).withMessage('min 2 char'),
    body('harga').isNumeric().withMessage('harga harus angka'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        const count = await db.Product.countDocuments({ nama: req.body.nama });
        if (count > 0) return res.status(200).send('Product Already Exist')

        var doc = new db.Product(req.body)
        await doc.save(function (err, doc) {
            if (err) return res.status(404).send(err)
            res.status(201).send(doc)
        });
})

router.put('/products/:nama',
    body('nama').matches(/^[a-z0-9 ]+$/i).withMessage('tidak boleh kosong').isLength({ min: 2}).withMessage('min 2 char'),
    body('harga').isNumeric().withMessage('harga harus angka'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        try {
            var productExist = await db.Product.findOne({ nama: req.params.nama})
            if (!productExist) return res.status(200).send('Not Found')

            const count = await db.Product.countDocuments({ nama: req.body.nama });
            if (count > 0) return res.status(200).send('Product Already Exist')

            productExist.nama = req.body.nama
            productExist.harga = req.body.harga

            await productExist.save()
            res.status(201).send(productExist)
        } catch(err) {
            return res.status(200).send(err)
        }
})

router.delete('/products/:nama', 
    param('nama').isAlpha().withMessage('Parameter Must Be Alpha'),
    verifyToken,
    validationHandler,
    async (req, res) => {
    try {
        var productExist = await db.Product.findOne({ nama: req.params.nama})
        if (!productExist) return res.status(200).send('Not Found')

        await db.Product.remove({ nama: req.params.nama })
        res.status(200).send('delete success')
    } catch (err) {
        return res.status(200).send(err)
    }
})

module.exports = router