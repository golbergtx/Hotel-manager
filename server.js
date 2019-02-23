// express App
const express = require('express');
const app = express();

//modules
const hbs = require('hbs');
const mysql = require('mysql');

//app config
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'hotel'
});

app.get('/', (req, res) => {
	res.render("home");
});

connection.connect(err => {
	if (err) throw err;
	console.log("connected to database");
});
app.listen(3000);