const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log(`Connected to database at ${process.env.DB_HOST}`);
});

const productSchema = new mongoose.Schema({
    nama:  {
        type: String,
        required: true,
        minLenght: 3,
        maxLength: 255
    },
    harga: {
        type: Number,
        required: true,
        min: 1,
    },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        maxLength: 255
    },
    password: {
        type: String,
        required: true,
        minLenght: 6,
        maxLength: 255
    },
    nama: {
        type: String,
        required: true,
        minLenght: 3,
        maxLength: 255
    },
    telp: {
        type: String,
        required: true,
        minLenght: 10,
        maxLength: 255
    },
    tgl_lahir: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
    idUser: {
        type: String,
        required: true,
        maxLength: 255
    },
    email: {
        type: String,
        required: true,
        maxLength: 255
    },
    nama: {
        type: String,
        required: true,
        minLenght: 3,
        maxLength: 255
    },
    telp: {
        type: String,
        required: true,
        minLenght: 10,
        maxLength: 255
    },
    products: []
}, { timestamps: true })

exports.Product = mongoose.model('Products', productSchema);
exports.User = mongoose.model('Users', userSchema);
exports.Transaction = mongoose.model('Transactions', transactionSchema);
