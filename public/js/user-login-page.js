new Vue({
	el: "#loginForm",
	data: {
		login: "",
		password: "",
		loginSuccessFull: false,
		showErrorLoginMessage: false
	},
	methods: {
		submit() {
			const data = `login=${encodeURIComponent(this.login)}&password=${encodeURIComponent(this.password)}`;
			
			this.loginToServer(data);
			if (this.loginSuccessFull) {
				window.location = "/";
			} else {
				this.showErrorLoginMessage = true;
			}
		},
		loginToServer(data) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "/login", false);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(data);
			if (xhr.status === 200) {
				this.loginSuccessFull = true;
			} else if (xhr.status === 401) {
				this.loginSuccessFull = false;
			} else {
				alert("Oops! Something went wrong");
			}
		}
	}
});