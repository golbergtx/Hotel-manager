new Vue({
	el: "article",
	data: {
		openedServicePopup: false,
		restaurantService: [],
		laundryService: [],
		service: {
			name: "",
			category: "",
			cost: ""
		}
	},
	watch: {},
	methods: {
		editService(type, service) {
			this.service.name = service.name;
			this.service.cost = service.cost;
			this.service.category = service.category;
			
			const action = `delete-${type}-service`;
			this.sendGuestData(action, this.service, () => {
				this.restaurantService.splice(index, 1);
			});
			this.openServicePopup();
		},
		deleteService(type, index) {
			const action = `delete-${type}-service`;
			this.sendGuestData(action, this.service, () => {
				this.restaurantService.splice(index, 1);
			});
		},
		
		
		openServicePopup() {
			this.openedServicePopup = true;
		},
		closeServicePopup() {
			this.openedServicePopup = false;
		},
		saveServiceData() {
		
		},
		sendGuestData(action, data, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", action);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify(data));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback(xhr.response);
			}
		},
		getServicesData() {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "get-services", false);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send();
			if (xhr.status === 200) {
				return JSON.parse(xhr.response);
			}
		},
	},
	mounted() {
		const service = this.getServicesData();
		this.restaurantService = service.restaurantService;
		this.laundryService = service.laundryService;
	}
});