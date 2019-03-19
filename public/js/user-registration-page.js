new Vue({
	el: "#registrationForm",
	data: {
		login: "",
		password: "",
		firstName: "",
		loginExist: false,
		registrySuccessFull: false,
		showErrorLoginMessage: false
	},
	methods: {
		submit() {
			const data = `login=${encodeURIComponent(this.login)}&password=${encodeURIComponent(this.password)}
				&name=${encodeURIComponent(this.firstName)}`;
			this.sendDataToServer(data);
			if (this.registrySuccessFull) {
				window.location = "/";
			} else {
				this.showErrorLoginMessage = true;
			}
		},
		sendDataToServer(body) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "registration-user", false);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(body);
			if (xhr.status === 200) {
				this.registrySuccessFull = true;
			} else if (xhr.status === 409) {
				this.loginExist = true;
			} else {
				this.registrySuccessFull = false;
			}
		}
	}
});