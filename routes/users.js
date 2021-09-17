const express = require('express')
const router = express.Router()
const { body, validationResult, param } = require('express-validator');
const bcrypt = require('bcrypt')
const db = require('../db')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// import route handler
const { verifyToken, validationHandler } = require('../middleware')

router.get('/users', 
    verifyToken,
    async (req, res) => {
        try {
            const result = await db.User.find()

            if (result.length<1) return res.status(200).send('Empty')
            return res.status(200).send(result)
        } catch (err) {
            return res.status(500).send(err)
        }
})

router.get('/users/:nama', 
    param('nama').isAlpha().withMessage('Parameter Must Be Alpha'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        try {
            const result = await db.User.find({ nama: req.params.nama})

            if (result.length<1) return res.status(200).send('Not Found')
            return res.status(200).send(result)
        } catch (err) {
            return res.status(500).send(err)
        }
})

router.post('/register', 
    body('email').isEmail().withMessage('harus format email'),
    body('password').isAlpha().withMessage('Cannot Be Empty'),
    body('nama').matches(/^[a-z0-9 ]+$/i).withMessage('Nama Required').isLength({ min: 2}).withMessage('min 2 char'),
    body('telp').isNumeric().withMessage('harga harus angka'),
    body('tgl_lahir').isDate().withMessage('harus format YYYY/MM/DD'),
    validationHandler,
    async (req, res) => {
        try {
            let body = req.body
            const hash = await bcrypt.hash(req.body.password, 10);
            body.password = hash;
    
            const count = await db.User.countDocuments({ email: req.body.email });
            if (count > 0) return res.status(200).send('Email Already Exist')
    
            let doc = new db.User(body)
            await doc.save();
            return res.status(201).send(doc)
        } catch (err) {
            return res.status(500).send(err)
        }
})

router.post('/login',
    body('email').isEmail().withMessage('Input Must Be Email'),
    body('password').isAlpha().withMessage('Password Cannot Be Empty'),
    validationHandler,
    async (req, res) => {
        try {
            const user = await db.User.findOne({ email: req.body.email })
            const userID = user._id
            if(!user) return res.status(404).send('Email Not Found')

            const match = await bcrypt.compare(req.body.password, user.password)
            if(!match) return res.status(404).send('Password Incorrect')

            if(user && match) {
                const token = jwt.sign({ userID }, process.env.SECRET_KEY, { expiresIn: '1h' })

                var response = {
                    message: 'Log In Success',
                    user_id: userID,
                    token_type: 'JWT',
                    token: token,
                    expired_in: '1 Hour'
                }
                return res.status(404).send(response)
            }
        } catch (err) {
            return res.status(500).send(err)
        }
})

router.put('/users/:email',
    body('nama').matches(/^[a-z0-9 ]+$/i).withMessage('Nama Required').isLength({ min: 2}).withMessage('min 2 char'),
    body('telp').isNumeric().withMessage('harga harus angka'),
    body('tgl_lahir').isDate().withMessage('harus format YYYY/MM/DD'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        try {
            let userExist = await db.User.findOne({ email: req.params.email })
            if (!userExist) return res.status(200).send('Not Found')

            userExist.nama = req.body.nama
            userExist.telp = req.body.telp
            userExist.tgl_lahir = req.body.tgl_lahir

            userExist.save()
            return res.status(201).send(userExist)
        } catch (err) {
            return res.status(500).send(err)
        }
})

router.delete('/users/:email', 
    param('email').isAlpha().withMessage('Parameter Must Be Email'),
    verifyToken,
    validationHandler,
    async (req, res) => {
        try {
            var userExist = await db.User.findOne({ email: req.params.email})
            if (!userExist) return res.status(200).send('Email Not Found')

            await db.User.remove({ email: req.params.email })
            return res.send('delete success')
        } catch (err) {
            return res.status(500).send(err)
        }
})

module.exports = router