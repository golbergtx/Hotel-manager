new Vue({
	el: "article",
	data: {
		popupHeader: "",
		openedServicePopup: false,
		isEditServiceMode: false,
		editServiceIndex: 0,
		restaurantService: [],
		laundryService: [],
		service: {
			typeID: "",
			id: "",
			name: "",
			category: "",
			cost: ""
		},
		types: [
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
		downloadGuest() {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", "download-guest");
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			xhr.responseType = 'blob';
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4) return;
				const link = document.createElement('a');
				link.href = window.URL.createObjectURL(xhr.response);
				link.download = "guest";
				link.click();
			};
			xhr.send();
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
			this.service.typeID = typeID;
			this.service.id = service.id;
			this.service.name = service.name;
			this.service.cost = service.cost;
			this.service.category = service.category;
			this.openServicePopup();
		},
		deleteService(typeID, service, index) {
			const data = {
				typeID,
				service: service
			};
			this.sendServiceData("delete-service", data, () => {
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
				this.sendServiceData("update-service", this.service, () => {
					if (this.service.typeID === "restaurant") {
						this.restaurantService[this.editServiceIndex].name = this.service.name;
						this.restaurantService[this.editServiceIndex].cost = this.service.cost;
						this.restaurantService[this.editServiceIndex].category = this.service.category;
					}
					if (this.service.typeID === "laundry") {
						this.laundryService[this.editServiceIndex].name = this.service.name;
						this.laundryService[this.editServiceIndex].cost = this.service.cost;
						this.laundryService[this.editServiceIndex].category = this.service.category;
					}
				});
			} else {
				this.sendServiceData("add-service", this.service, (result) => {
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
			}
			this.closeServicePopup();
		},
		
		onChangeType(event) {
			this.service.typeID = this.types[event.target.selectedIndex].id;
		},
		resetServiceData() {
			this.service.typeID = this.types[0].id;
			this.service.id = "";
			this.service.name = "";
			this.service.category = "";
			this.service.cost = "";
		},
		
		sendServiceData(action, data, callback) {
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