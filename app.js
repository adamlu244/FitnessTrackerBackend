require("dotenv").config()
const express = require("express")
const app = express()

// Setup your Middleware and API Router here
const client = require('./db/client.js');
client.connect();

const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(express.json());

const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());

const router = require('./api');
app.use('/api', router);

module.exports = app;
