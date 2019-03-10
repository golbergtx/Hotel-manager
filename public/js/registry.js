new Vue({
	el: '#registryForm',
	data: {
		login: "",
		password: "",
		firstName: "",
		registrySuccessFull: false,
		loginExist: false,
		showErrorLoginMessage: false,
		disableSaveDataBtn: false
	},
	methods: {
		submit: function () {
			const data = "login=" + encodeURIComponent(this.login) + "&password=" + encodeURIComponent(this.password)
				+ "&name=" + encodeURIComponent(this.firstName);
			this.sendDataToServer(data);
			if (this.registrySuccessFull) {
				window.location = "/";
			} else {
				this.showErrorLoginMessage = true;
			}
		},
		sendDataToServer: function (body) {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'registry-user', false);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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