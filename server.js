// express App
const express = require('express');
const app = express();

// modules
const hbs = require('hbs');
const bodyParser = require('body-parser');
const Database = require('./controllers/Database');
const database = Database.connection("localhost", "root", "password", "hotel");

// app config
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
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
app.post('/registration-user', (req, res) => {
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
			database.query("INSERT INTO users SET ?", data, err => {
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
app.post('/get-rooms', (req, res) => {
	database.query(`SELECT * FROM rooms`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json(result);
		}
	});
});
app.post('/get-room', (req, res) => {
	const number = req.body.number;
	
	database.query(`SELECT * FROM rooms WHERE number = '${number}'`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else if (result[0]) {
			res.status(302).end();
		} else {
			res.status(404).end();
		}
	});
});
app.post('/update-room', (req, res) => {
	const data = [
		req.body.price,
		req.body.number,
		req.body.category,
		req.body.editNumber
	];
	
	database.query(`UPDATE rooms SET price = ?, number = ?, category = ? WHERE number = ?`, data, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});
app.post('/get-registration', (req, res) => {
	database.query(`SELECT * FROM registrations`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json(result);
		}
	});
});
app.post('/add-registration', (req, res) => {
	const data = [
		req.body.roomNumber,
		req.body.price,
		new Date(req.body.dateOfArrival),
		new Date(req.body.dateOfDeparture),
		req.body.methodOfPayment,
		req.body.guestID
	];
	
	database.query(`INSERT INTO registrations SET roomNumber = ?, price = ?, dateOfArrival = ?, dateOfDeparture = ?, methodOfPayment = ?,
	guestID = ?`, data, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});
app.post('/delete-registration', (req, res) => {
	const roomNumber = req.body.roomNumber;
	
	database.query(`DELETE FROM registrations WHERE roomNumber = "${roomNumber}"`, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});
app.post('/get-guests', (req, res) => {
	database.query(`SELECT * FROM guests`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json(result);
		}
	});
});
app.post('/update-guest', (req, res) => {
	const data = [
		req.body.firstName,
		req.body.lastName,
		req.body.phone,
		req.body.address,
		req.body.passportDetails,
		new Date(req.body.dateOfBirth),
		parseInt(req.body.id)
	];
	
	database.query(`UPDATE guests SET firstName = ?, lastName = ?, phone = ?, address = ?, passportDetails = ?,
	dateOfBirth = ? WHERE id = ?`, data, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});
app.post('/add-guest', (req, res) => {
	const data = [
		req.body.firstName,
		req.body.lastName,
		req.body.phone,
		req.body.address,
		req.body.passportDetails,
		new Date(req.body.dateOfBirth)
	];
	
	database.query(`INSERT INTO guests SET firstName = ?, lastName = ?, phone = ?, address = ?, passportDetails = ?,
	dateOfBirth = ?`, data, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json({id: result.insertId});
		}
	});
});
app.post('/delete-guest', (req, res) => {
	const guestID = req.body.guestID;
	
	database.query(`DELETE FROM guests WHERE id = "${guestID}"`, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});

// middleware
app.use('/', (req, res, next) => {
	if (req.path === "/user-login" || req.path === "/user-registration") {
		if (isAuthorized) {
			res.redirect("/room");
		} else {
			next();
		}
	} else {
		if (!isAuthorized) {
			console.warn("User unauthorized");
			res.redirect("/user-login");
		} else {
			next();
		}
	}
});

// get requests
app.get('/user-login', (req, res) => {
	res.render("user-login");
});
app.get('/user-registration', (req, res) => {
	res.render("user-registration");
});
app.get('/log-out', (req, res) => {
	isAuthorized = false;
	res.redirect("/user-login");
});
app.get('/room', function (req, res) {
	res.render("room");
});
app.get('/registration', function (req, res) {
	res.render("registration");
});
app.get('/guest', function (req, res) {
	res.render("guest");
});

app.use('/', (req, res) => {
	res.redirect("/room");
});

app.listen(3000);