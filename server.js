'use strict';

const express = require('express');

// Constants
const PORT = 80;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world!!!!\n');
});

/*
var mysql = require('mysql');

app.get('/', function(req, res) {
    var connection = mysql.createConnection({
      host     : 'mysql',
      user     : 'wwc',
      password : '123'
    });
    connection.connect(function(err) {
        if (err) {
            res.send('Could not connect to MySQL ' + err.stack);
        } else {
            res.send('Connected to MySQL - Thread ' + connection.threadId);
        }
    });
});
*/

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);