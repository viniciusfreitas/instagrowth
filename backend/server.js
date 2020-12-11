require('dotenv').config({path: __dirname + '/.env'});
const app  = require('./app');
const port = process.env.PORT || 3000

const server = app.listen(port, () => console.log(`Server is running on port ${port}`))