const express = require('express');
const { model } = require('mongoose');
const app = express();

app.use(require('./usuario'));
app.use(require('./login'));

module.exports = app;