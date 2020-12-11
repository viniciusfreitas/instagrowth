const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')

mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database!'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

// chamar requisição diária de seguidores
function dailyUpdate() {
    const { daily } = require('./schedule')
    daily()
}
dailyUpdate()


const profileRouter = require('./routes/profile')
app.use('/profile', profileRouter)

module.exports = app
