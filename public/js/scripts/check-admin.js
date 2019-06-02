new Vue({
	el: "nav",
	data() {
		return {
			isAdmin: false
		}
	},
	mounted() {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", "user");
		xhr.onreadystatechange = () => {
			if (xhr.readyState !== 4) return;
			this.isAdmin = Boolean(JSON.parse(xhr.response).isAdmin);
		};
		xhr.send();
	}
});