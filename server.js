// express App
const express = require("express");
const app = express();

// modules
const fs = require('fs');
const hbs = require("hbs");
const json2xls = require('json2xls');
const bodyParser = require("body-parser");
const User = require("./controllers/User");
const Database = require("./controllers/Database");
const DataFormater = require("./controllers/Date-formater");
const database = Database.connection("localhost", "root", "password", "hotel");

// app config
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
let user = null;

// post requests
app.post("/user", (req, res) => {
	res.json(user).end();
});
app.post("/login", (req, res) => {
	const userLogin = req.body.login;
	const userPassword = req.body.password;
	
	database.query(`SELECT * FROM users WHERE login = "${userLogin}"`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		}
		if (result[0] && userPassword === result[0].password.trim()) {
			user = new User(result[0].login, result[0].password, result[0].name, result[0].isAdmin);
			res.status(200).end();
		} else {
			res.status(401).end();
		}
	});
});
app.post("/registration-user", (req, res) => {
	const data = {
		login: req.body.login,
		password: req.body.password.trim(),
		name: req.body.name
	};
	
	const promise = new Promise((resolve, reject) => {
		database.query(`SELECT * FROM users WHERE login = "${data.login}"`, (err, result) => {
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

app.post("/get-room", (req, res) => {
	const number = req.body.number;
	
	database.query(`SELECT * FROM rooms WHERE number = "${number}"`, (err, result) => {
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
app.post("/get-rooms", (req, res) => {
	database.query(`SELECT * FROM rooms`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json(result);
		}
	});
});
app.post("/update-room", (req, res) => {
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

app.post("/get-registration", (req, res) => {
	database.query(`SELECT * FROM registrations`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json(result);
		}
	});
});
app.post("/add-registration", (req, res) => {
	const data = [
		req.body.roomNumber,
		req.body.price,
		req.body.priceServices,
		new Date(req.body.dateOfArrival),
		new Date(req.body.dateOfDeparture),
		req.body.methodOfPayment,
		req.body.guestsID,
		req.body.servicesJSON
	];
	
	database.query(`INSERT INTO registrations SET roomNumber = ?, price = ?, priceServices = ?, dateOfArrival = ?, dateOfDeparture = ?, methodOfPayment = ?,
	guestsID = ?, servicesJSON = ?`, data, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});
app.post("/update-registration", (req, res) => {
	const data = [
		req.body.roomNumber,
		req.body.price,
		req.body.priceServices,
		new Date(req.body.dateOfArrival),
		new Date(req.body.dateOfDeparture),
		req.body.methodOfPayment,
		req.body.guestsID,
		req.body.servicesJSON,
		parseInt(req.body.id)
	];
	
	database.query(`UPDATE registrations SET roomNumber = ?, price = ?, priceServices = ?, dateOfArrival = ?, dateOfDeparture = ?, methodOfPayment = ?,
	guestsID = ?, servicesJSON = ? WHERE id = ?`, data, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});
app.post("/delete-registration", (req, res) => {
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

app.post("/get-guests", (req, res) => {
	database.query(`SELECT * FROM guests`, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json(result);
		}
	});
});
app.post("/add-guest", (req, res) => {
	const data = [
		req.body.firstName,
		req.body.lastName,
		req.body.phone,
		req.body.address,
		req.body.passportDetails,
		new Date(req.body.dateOfBirth),
		req.body.discountCode
	];
	
	database.query(`INSERT INTO guests SET firstName = ?, lastName = ?, phone = ?, address = ?, passportDetails = ?,
	dateOfBirth = ?, discountCode = ?`, data, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json({id: result.insertId});
		}
	});
});
app.post("/update-guest", (req, res) => {
	const data = [
		req.body.firstName,
		req.body.lastName,
		req.body.phone,
		req.body.address,
		req.body.passportDetails,
		new Date(req.body.dateOfBirth),
		req.body.discountCode,
		parseInt(req.body.id)
	];
	
	database.query(`UPDATE guests SET firstName = ?, lastName = ?, phone = ?, address = ?, passportDetails = ?,
	dateOfBirth = ?, discountCode = ? WHERE id = ?`, data, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});
app.post("/delete-guest", (req, res) => {
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

app.post("/get-services", (req, res) => {
	const restaurantService = new Promise((resolve, reject) => {
		database.query(`SELECT * FROM restaurantService`, (err, result) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
	const laundryService = new Promise((resolve, reject) => {
		database.query(`SELECT * FROM laundryService`, (err, result) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
	Promise.all([restaurantService, laundryService]).then(result => res.status(200).json({
		restaurantService: result[0],
		laundryService: result[1]
	}));
});
app.post("/add-service", (req, res) => {
	let tableName;
	const data = [
		req.body.name,
		req.body.cost,
		req.body.category
	];
	const typeID = req.body.typeID;
	
	if (typeID === "restaurant") tableName = "restaurantService";
	if (typeID === "laundry") tableName = "laundryService";
	
	database.query(`INSERT INTO ${tableName} SET name = ?, cost = ?, category = ?`, data, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).json({id: result.insertId});
		}
	});
});
app.post("/update-service", (req, res) => {
	let tableName;
	const data = [
		req.body.name,
		req.body.cost,
		req.body.category,
		parseInt(req.body.id)
	];
	const typeID = req.body.typeID;
	
	if (typeID === "restaurant") tableName = "restaurantService";
	if (typeID === "laundry") tableName = "laundryService";
	
	database.query(`UPDATE ${tableName} SET name = ?, cost = ?, category = ? WHERE id = ?`, data, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});
app.post("/delete-service", (req, res) => {
	let tableName;
	const typeID = req.body.typeID;
	const id = req.body.service.id;
	
	if (typeID === "restaurant") tableName = "restaurantService";
	if (typeID === "laundry") tableName = "laundryService";
	
	database.query(`DELETE FROM ${tableName} WHERE id = "${id}"`, err => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});

app.post("/download-guest-report", (req, res) => {
	createGuestReport("guest", () => res.sendFile(`${__dirname}/reports/guest.xlsx`));
});
app.post("/download-restaurant-report", (req, res) => {
	createServiceReport("restaurant", () => res.sendFile(`${__dirname}/reports/services.xlsx`));
});
app.post("/download-laundry-report", (req, res) => {
	createServiceReport("laundry", () => res.sendFile(`${__dirname}/reports/services.xlsx`));
});

// middleware
app.use("/", (req, res, next) => {
	if (req.path === "/user-login" || req.path === "/user-registration") {
		if (user) {
			res.redirect("/room");
		} else {
			next();
		}
	} else {
		if (!user) {
			console.warn("User unauthorized");
			res.redirect("/user-login");
		} else {
			next();
		}
	}
});

// get requests
app.get("/user-login", (req, res) => {
	res.render("user-login");
});
app.get("/user-registration", (req, res) => {
	res.render("user-registration");
});
app.get("/log-out", (req, res) => {
	user = null;
	res.redirect("/user-login");
});
app.get("/room", (req, res) => {
	res.render("room");
});
app.get("/registration", (req, res) => {
	res.render("registration");
});
app.get("/guest", (req, res) => {
	res.render("guest");
});
app.get("/admin-panel", (req, res) => {
	if (user.isAdmin) res.render("admin-panel");
	else res.status(401).end();
});

app.use("/", (req, res) => {
	res.redirect("/room");
});

app.listen(3000);


function createGuestReport(type, callback) {
	database.query(`SELECT * FROM guests`, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			const reportData = [];
			result.forEach(guest => {
				reportData.push({
					["First name"]: guest.firstName,
					["Last name"]: guest.lastName,
					["Phone number"]: guest.phone,
					["Address"]: guest.address,
					["Passport details"]: guest.passportDetails,
					["Date of Birth"]: DataFormater.getFormatDate(new Date(guest.dateOfBirth)),
					["Discount code"]: guest.discountCode
				})
			});
			
			const xls = json2xls(reportData);
			fs.writeFileSync('./reports/guest.xlsx', xls, 'binary');
			if (callback) callback();
		}
	});
}
function createServiceReport(type, callback) {
	database.query(`SELECT * FROM registrations`, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			const reportData = [];
			let registrations = result;
			
			registrations.forEach(registration => {
				let service = {};
				const services = JSON.parse(registration.servicesJSON);
				if (type === "restaurant") service = services.restaurant;
				if (type === "laundry") service = services.laundry;
				
				Object.values(service).forEach(service => {
					reportData.push({
						["Room number"]: registration.roomNumber,
						["Date of Arrival"]: DataFormater.getFormatDate(new Date(registration.dateOfArrival)),
						["Date of departure"]: DataFormater.getFormatDate(new Date(registration.dateOfDeparture)),
						["Name"]: service.name,
						["Count"]: service.count,
						["Cost"]: service.cost,
						["Sum"]: service.count * service.cost
					})
				});
			});
			
			const xls = json2xls(reportData);
			fs.writeFileSync('./reports/services.xlsx', xls, 'binary');
			if (callback) callback();
		}
	});
}