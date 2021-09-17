const express = require('express')
const router = express.Router()
const { body, validationResult, param } = require('express-validator');
const db = require('../db')

// import route handler
const { verifyToken, validationHandler } = require('../middleware')

router.get('/transactions', 
    verifyToken,
    async (req, res) => {
        try {
            const result = await db.Transaction.find()
            
            if (result.length<1) return res.status(200).send('Empty')
            return res.status(200).send(result)
        } catch (err) {
            return res.status(500).send(err)
        }
})

router.get('/transactions/:namaUser',
    param('namaUser').isAlpha().withMessage('Parameter Must Be Alpha'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        try {
            const result = await db.Transaction.find({ nama: req.params.namaUser})
    
            if (result.length<1) return res.status(200).send('Not Found')
            return res.status(200).send(result)
        } catch (err) {
            return res.status(500).send(err)
        }
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

            let productList = [];

            for(let i=0; i<req.body.idProducts.length; i++) {
                const prod = await db.Product.findOne({ _id: req.body.idProducts[i] });
                if (!prod) return res.status(200).send('Product Not Found')
                productList.push(prod)
            }

            let data = {
                idUser: req.body.idUser,
                email: user.email,
                nama: user.nama,
                telp: user.telp,
                products: productList
            }

            let doc = new db.Transaction(data)
            await doc.save();
            return res.status(201).send(data)
        } catch (err) {
            return res.status(500).send(err)
        }
})

router.delete('/transactions/:id',
    param('id').isAlpha().withMessage('Parameter Must Be ObjectId'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        try {
            const transactionExist = await db.Transaction.findOne({ _id: req.params.id})
            if (!transactionExist) return res.status(200).send('Not Found')

            await db.Transaction.remove({ _id: req.params.id })
            return res.status(200).send('delete success')
        } catch (err) {
            return res.status(500).send(err)
        }
})

module.exports = router