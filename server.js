// express App
const express = require('express');
const app = express();

//modules
const hbs = require('hbs');
const bodyParser = require('body-parser');
const Database = require('./controllers/Database');
const database = Database.connection("localhost", "root", "password", "hotel");

//app config
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
let isAuthorized = false;

// post requests
app.post('/login', (req, res) => {
	const userLogin = req.body.login;
	const userPassword = req.body.password;
	
	database.query(`SELECT * FROM users WHERE login = '${userLogin}'`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		}
		if (result[0]) {
			isAuthorized = result[0].password === userPassword;
			res.status(200).end();
		} else {
			res.status(401).end();
		}
	});
});
app.post('/registry-user', (req, res) => {
	const data = {
		login: req.body.login,
		password: req.body.password,
		name: req.body.name
	};
	
	const promise = new Promise((resolve, reject) => {
		database.query(`SELECT * FROM users WHERE login = '${data.login}'`, (err, result) => {
			if (err) {
				console.log(err);
				res.status(500).end();
			}
			if (result[0]) {
				reject("Login conflict");
			}
			resolve();
		});
	});
	promise.then(() => {
			database.query("INSERT INTO users SET ?", data, function (err) {
				if (err) {
					console.log(err);
					return res.status(500).end();
				}
				res.status(200).end();
			});
		},
		error => {
			console.warn(error);
			res.status(409).end();
		}
	);
});

// middleware
app.use('/', (req, res, next) => {
	if (req.path === "/login" || req.path === "/registry") {
		if (isAuthorized) {
			res.redirect("/");
		} else {
			next();
		}
	} else {
		if (!isAuthorized) {
			console.warn("User unauthorized");
			res.redirect("/login");
		} else {
			next();
		}
	}
});

// get requests
app.get('/login', (req, res) => {
	res.render("login");
});
app.get('/registry', (req, res) => {
	res.render("registry");
});
app.get('/log-out', (req, res) => {
	isAuthorized = false;
	res.redirect("/login");
});
app.get('/', function (req, res) {
	res.render("home");
});

app.listen(3000);