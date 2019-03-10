const mysql = require('mysql');
class Database {
	static connection(host, user, password, database) {
		const connection = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database
		});
		connection.connect(err => {
			if (err) throw err;
			console.log("connected to database");
		});
		return connection;
	}
}
module.exports = Database;