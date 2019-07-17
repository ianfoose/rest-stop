const express = require('express')
const dataHelper = require('./util/DatabaseHelper.js');
const fs = require('fs');

let apiConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const app = express()
const port = 8080

app.get('/', (req, res) => {
 	res.send(apiConfig.name);
});

app.listen(port, () => console.log(apiConfig.name+` listening on port ${port}!`))