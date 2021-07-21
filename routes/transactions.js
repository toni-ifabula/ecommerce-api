const express = require('express')
const router = express.Router()
const { body, validationResult, param } = require('express-validator');
const db = require('../db')

// import route handler
const { verifyToken, validationHandler } = require('../middleware')

router.get('/transactions', 
    verifyToken,
    async (req, res) => {
        await db.Transaction.find(function (err, result) {
            if (err) return res.status(404).send(err)
            else if (result.length<1) return res.status(200).send('Empty')

            res.status(200).send(result)
        })
})

router.get('/transactions/:namaUser',
    param('namaUser').isAlpha().withMessage('Parameter Must Be Alpha'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        await db.Transaction.find({ nama: req.params.namaUser}, function (err, result) {
            if (err) return res.status(404).send(err)
            else if (result.length<1) return res.status(200).send('Not Found')

            res.status(200).send(result)
        })
})

router.post('/transactions', 
    body('idUser').isAlphanumeric().withMessage('Must Be Alphanumeric'),
    body('idProducts').isArray().withMessage('Must Be Array of ObjectId'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        try {
            const user = await db.User.findOne({ _id: req.body.idUser });
            if (!user) return res.status(200).send('User Not Found')

            var productList = [];

            for(var i=0; i<req.body.idProducts.length; i++) {
                const prod = await db.Product.findOne({ _id: req.body.idProducts[i] });
                if (!prod) return res.status(200).send('Product Not Found')
                productList.push(prod)
            }

            var data = {
                idUser: req.body.idUser,
                email: user.email,
                nama: user.nama,
                telp: user.telp,
                products: productList
            }

            var doc = new db.Transaction(data)
            await doc.save();
            res.status(201).send(data)
        } catch (err) {
            return res.send(err)
        }
})

router.delete('/transactions/:id',
    param('id').isAlpha().withMessage('Parameter Must Be ObjectId'),
    verifyToken,
    validationHandler,
    async (req, res) => {
    try {
        var transactionExist = await db.Transaction.findOne({ _id: req.params.id})
        if (!transactionExist) return res.status(200).send('Not Found')

        await db.Transaction.remove({ _id: req.params.id })
        res.status(200).send('delete success')
    } catch (err) {
        return res.status(200).send(err)
    }
})

module.exports = router