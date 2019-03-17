new Vue({
	el: '#loginForm',
	data: {
		login: "",
		password: "",
		loginSuccessFull: false,
		showErrorLoginMessage: false
	},
	methods: {
		submit: function () {
			const data = "login=" + encodeURIComponent(this.login) + "&password=" + encodeURIComponent(this.password);
			this.loginSuccessFull = this.loginToServer(data);
			if (this.loginSuccessFull) {
				window.location = "/";
			} else {
				this.showErrorLoginMessage = true;
			}
		},
		loginToServer: function (body) {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'login', false);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(body);
			if (xhr.status != 200) {
				return false;
			} else {
				return true;
			}
		}
	}
});

/* TODO refactoring code */