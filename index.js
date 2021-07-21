const express = require('express')
const app = express()
const morgan = require("morgan")
const cors = require("cors");
require('dotenv').config()

// import routes
const products = require('./routes/products')
const users = require('./routes/users')
const transactions = require('./routes/transactions')

app.use(morgan("common"))   // terminal logger
app.use(cors())     //enable CORS
app.use(express.json()) //parsing application/json
app.use(express.urlencoded({ extended: true }));    //parsing application/x-www-form-urlencoded

app.use('/api', products)

app.use('/api', users)

app.use('/api', transactions)

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`)
})
