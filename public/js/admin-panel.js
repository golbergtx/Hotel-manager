import infoPopup from "./scripts/info-popup.js"

Vue.component('info-popup', infoPopup);

new Vue({
	el: "article",
	data: {
		popupHeader: "",
		loginExist: false,
		openedUserPopup: false,
		openedServicePopup: false,
		isEditServiceMode: false,
		editServiceIndex: 0,
		restaurantService: [],
		laundryService: [],
		user: {
			login: "",
			password: "",
			name: ""
		},
		service: {
			typeID: "",
			id: "",
			name: "",
			category: "",
			cost: ""
		},
		serviceType: [
			{
				id: "restaurant",
				name: "Рум. сервіс"
			},
			{
				id: "laundry",
				name: "Пральня"
			}
		]
	},
	methods: {
		downloadGuestReport() {
			this.downloadReport("download-guest-report", "guest");
		},
		downloadRestaurantReport() {
			this.downloadReport("download-restaurant-report", "restaurant");
		},
		downloadLaundryReport() {
			this.downloadReport("download-laundry-report", "laundry");
		},
		
		createUser() {
			this.popupHeader = "Додати користувача:";
			this.openUserPopup();
		},
		
		createService() {
			this.popupHeader = "Додати сервіс:";
			this.isEditServiceMode = false;
			this.resetServiceData();
			this.openServicePopup();
		},
		editService(typeID, service, index) {
			this.popupHeader = "Редагувати сервіс:";
			this.isEditServiceMode = true;
			this.editServiceIndex = index;
			this.service = Object.assign({}, service);
			this.service.typeID = typeID;
			this.openServicePopup();
		},
		deleteService(typeID, service, index) {
			const data = {
				typeID,
				service: service
			};
			this.sendData("delete-service", JSON.stringify(data), () => {
				if (typeID === "restaurant") this.restaurantService.splice(index, 1);
				if (typeID === "laundry") this.laundryService.splice(index, 1);
			});
		},
		
		openServicePopup() {
			this.openedServicePopup = true;
		},
		closeServicePopup() {
			this.openedServicePopup = false;
			document.getElementById("selectType").selectedIndex = 0;
		},
		saveServiceData() {
			if (this.isEditServiceMode) {
				this.updateService();
			} else {
				this.addServices();
			}
			this.closeServicePopup();
		},
		addServices() {
			this.sendData("add-service", JSON.stringify(this.service), (result) => {
				if (this.service.typeID === "restaurant") {
					this.restaurantService.push({
						id: JSON.parse(result).id,
						name: this.service.name,
						cost: this.service.cost,
						category: this.service.category,
					});
				}
				if (this.service.typeID === "laundry") {
					this.laundryService.push({
						id: JSON.parse(result).id,
						name: this.service.name,
						cost: this.service.cost,
						category: this.service.category,
					});
				}
			});
		},
		updateService() {
			this.sendData("update-service", JSON.stringify(this.service), () => {
				const i = this.editServiceIndex;
				if (this.service.typeID === "restaurant") {
					this.restaurantService[i].name = this.service.name;
					this.restaurantService[i].cost = this.service.cost;
					this.restaurantService[i].category = this.service.category;
				}
				if (this.service.typeID === "laundry") {
					this.laundryService[i].name = this.service.name;
					this.laundryService[i].cost = this.service.cost;
					this.laundryService[i].category = this.service.category;
				}
			});
		},
		
		openUserPopup() {
			this.openedUserPopup = true;
		},
		closeUserPopup() {
			this.openedUserPopup = false;
			this.loginExist = false;
			this.resetUserData();
		},
		saveUserData() {
			if (this.isValidUser()) {
				this.sendData("registration-user", JSON.stringify(this.user), (result, status) => {
					if (status === 200) {
						this.$refs.infoPopup.openInfoPopup("Додано!");
						this.closeUserPopup();
					} else if (status === 409) {
						this.loginExist = true;
					} else {
						this.$refs.infoPopup.openInfoPopup("Помилка серверу!");
					}
				})
			} else {
				alert("Заповніть всі поля!");
			}
		},
		isValidUser() {
			return Object.values(this.user).every(element => element.trim() !== "");
		},
		
		onChangeServiceType(event) {
			this.service.typeID = this.serviceType[event.target.selectedIndex].id;
		},
		
		resetUserData() {
			this.user.name = "";
			this.user.login = "";
			this.user.password = "";
		},
		resetServiceData() {
			this.service.typeID = this.serviceType[0].id;
			this.service.id = "";
			this.service.name = "";
			this.service.category = "";
			this.service.cost = "";
		},
		
		downloadReport(action, fileName, data = "") {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", action);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.responseType = 'blob';
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4) return;
				const link = document.createElement('a');
				link.href = window.URL.createObjectURL(xhr.response);
				link.download = fileName;
				link.click();
			};
			xhr.send(data);
		},
		sendData(action, data, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", action);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(data);
			xhr.onloadend = () => {
				if (callback) callback(xhr.response, xhr.status);
			}
		},
		getServicesData() {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "get-services", false);
			xhr.send();
			if (xhr.status === 200) {
				return JSON.parse(xhr.response);
			}
		}
	},
	mounted() {
		const service = this.getServicesData();
		this.restaurantService = service.restaurantService;
		this.laundryService = service.laundryService;
	}
});