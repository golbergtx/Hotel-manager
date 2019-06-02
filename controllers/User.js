class User {
	constructor(login, password, name, isAdmin = false) {
		this.login = login;
		this.password = password;
		this.name = name;
		this.isAdmin = isAdmin;
	}
}

module.exports = User;