import Room from "./data/Room.js";
import Guest from "./data/Guest.js";
import Registration from "./data/Registration.js";
import DateFormater from "./data/Date-formater.js";
import Check from "./data/Check.js";

new Vue({
	el: "article",
	data: {
		rooms: [],
		guests: [],
		registrations: [],
		freeRoomNumbers: [],
		displayedRegistrations: [],
		guestNameFilter: "",
		registration: {
			id: null,
			roomNumber: null,
			price: null,
			surchargeCost: 0,
			priceServices: 0,
			dateOfArrival: null,
			dateOfDeparture: null,
			methodOfPayment: null,
			guestsID: "",
			wholeAmount: 0,
			initialWholeAmount: 0,
			servicesJSON: ""
		},
		services: {
			enableBreakfast: false,
			enableTransfer: false,
			enableRestaurantService: false,
			enableLaundryService: false,
			restaurantService: [],
			laundryService: [],
			priceBreakfast: 30,
			priceTransfer: 50,
			selectedRestaurantService: {},
			selectedLaundryService: {}
		},
		openedRegistrationPopup: false,
		openedServicesPopup: false,
		isEditRegistrationMode: false,
		isReservationMode: false,
		editRegistrationIndex: 0,
		methodsOfPayment: [
			"Готівковий",
			"Безготівковий"
		],
		popupHeader: "",
		popupErrorMessage: "Вільних номерів немає!",
		showPopupErrorMessage: false
	},
	watch: {
		guestNameFilter(val) {
			if (val !== "") {
				const registration = [];
				Guest.getGuestByFirstName(this.guests, val)
					.map(guest => guest.id)
					.forEach(id => registration.push(...Registration.getRegistrationByGuestID(this.registrations, id)));
				this.displayedRegistrations = registration;
			}
			else {
				this.displayedRegistrations = this.registrations;
			}
		}
	},
	methods: {
		openRegistrationPopup(event, mode, index = 0) {
			this.resetRegistrationData();
			this.popupHeader = "Оформити реєстрацію:";
			this.freeRoomNumbers = Room.getAvailableRooms(this.rooms).map(element => element.number);
			document.querySelectorAll(".guest-list > option").forEach(option => option.selected = false);
			
			if (mode === "editRegistrationMode") {
				this.isEditRegistrationMode = true;
				this.editRegistrationIndex = index;
				this.popupHeader = "Редагувати реєстрацію:";
				this.freeRoomNumbers.push(this.displayedRegistrations[index].roomNumber);
				this.registration.id = this.displayedRegistrations[index].id;
				this.registration.roomNumber = this.displayedRegistrations[index].roomNumber;
				this.registration.dateOfArrival = DateFormater.getFormatDate(this.displayedRegistrations[index].dateOfArrival, "-", true);
				this.registration.dateOfDeparture = DateFormater.getFormatDate(this.displayedRegistrations[index].dateOfDeparture, "-", true);
				this.registration.methodOfPayment = this.displayedRegistrations[index].methodOfPayment;
				this.registration.priceServices = this.displayedRegistrations[index].priceServices;
				this.registration.guestsID = this.displayedRegistrations[index].guestsID;
				this.registration.price = this.displayedRegistrations[index].price;
				this.setSumPrice();
				this.registration.initialWholeAmount = this.registration.wholeAmount;
				this.registration.surchargeCost = 0;
				document.querySelectorAll(".guest-list > option")
					.forEach((option, index) => option.selected = this.isSelectedGuest(this.guests[index].id));
			}
			
			if (mode === "reservationMode") {
				this.popupHeader = "Оформити бронь:";
				this.isReservationMode = true;
			}
			
			this.openedRegistrationPopup = true;
		},
		closeRegistrationPopup() {
			this.openedRegistrationPopup = false;
			this.isEditRegistrationMode = false;
			this.isReservationMode = false;
		},
		
		isSelectedGuest(id) {
			return this.registration.guestsID.split(",").includes(id.toString());
		},
		
		onChangeRoomNumber() {
			this.registration.price = Room.getPriceByNumber(this.rooms, Number(this.registration.roomNumber));
			this.setSumPrice();
		},
		onChangeDateOfArrival() {
			this.freeRoomNumbers = Room.getAvailableRooms(this.rooms, new Date(this.registration.dateOfArrival)).map(element => element.number);
			this.showPopupErrorMessage = !this.freeRoomNumbers.length;
			this.setSumPrice();
		},
		onChangeDateOfDeparture() {
			this.setSumPrice();
		},
		onChangeGuestsID(event) {
			this.registration.guestsID = "";
			[...event.target.selectedOptions].forEach((option) =>this.registration.guestsID += `${this.guests[option.index].id},`);
			this.registration.guestsID = this.registration.guestsID.slice(0, -1);
			this.setSumPrice();
		},
		
		openServicesPopup() {
			this.openedServicesPopup = true;
		},
		closeServicesPopup() {
			this.openedServicesPopup = false;
		},
		
		onChangeServices() {
			this.registration.priceServices = 0;
			const duration = (new Date(this.registration.dateOfDeparture) - new Date(this.registration.dateOfArrival)) / 86400000;
			
			if (this.services.enableBreakfast) {
				this.registration.priceServices += this.services.priceBreakfast * duration * this.registration.guestsID.split(",").length;
			}
			if (this.services.enableTransfer) {
				this.registration.priceServices += this.services.priceTransfer * duration * this.registration.guestsID.split(",").length;
			}
			Object.values(this.services.selectedRestaurantService).forEach(service => this.registration.priceServices += service.cost * service.count);
			Object.values(this.services.selectedLaundryService).forEach(service => this.registration.priceServices += service.cost * service.count);
			this.setSumPrice();
		},
		onChangeRestaurantService(event, service) {
			setSelectedService(Number(event.target.value), service, this.services.selectedRestaurantService);
			this.onChangeServices();
		},
		onChangeLaundryService(event, service) {
			setSelectedService(Number(event.target.value), service, this.services.selectedLaundryService);
			this.onChangeServices();
		},
		
		setSumPrice() {
			if (this.registration.dateOfArrival && this.registration.dateOfDeparture) {
				const duration = (new Date(this.registration.dateOfDeparture) - new Date(this.registration.dateOfArrival)) / 86400000;
				const price = this.registration.price || 0;
				this.registration.wholeAmount = price * Math.round(duration);
			} else {
				this.registration.wholeAmount = 0;
			}
			this.registration.wholeAmount += this.registration.priceServices;
			this.registration.surchargeCost = this.registration.wholeAmount - this.registration.initialWholeAmount;
		},
		setRegistrationServices() {
			this.registration.servicesJSON = JSON.stringify({
				enableBreakfast: this.services.enableBreakfast,
				enableTransfer: this.services.enableTransfer,
				restaurant: this.services.selectedRestaurantService,
				laundry: this.services.selectedLaundryService
			});
		},
		resetRegistrationData() {
			this.registration = {
				id: null,
				roomNumber: null,
				price: null,
				surchargeCost: 0,
				priceServices: 0,
				dateOfArrival: null,
				dateOfDeparture: null,
				methodOfPayment: null,
				guestsID: "",
				wholeAmount: 0,
				initialWholeAmount: 0,
				servicesJSON: ""
			};
			this.services.enableBreakfast = false;
			this.services.enableTransfer = false;
			this.services.enableRestaurantService = false;
			this.services.enableLaundryService = false;
			this.services.selectedRestaurantService = {};
			this.services.selectedLaundryService = {};
		},
		
		openPDFCheck(event, index) {
			let registration, category, guests = [], isDiscountActive = false;
			if (index !== undefined) {
				registration = this.displayedRegistrations[index];
			}
			else {
				this.setRegistrationServices();
				registration = Object.assign({}, this.registration);
				registration.dateOfArrival = new Date(registration.dateOfArrival);
				registration.dateOfDeparture = new Date(registration.dateOfDeparture);
			}
			category = Room.getRoomByNumber(this.rooms, registration.roomNumber)[0].category;
            
            if (registration.guestsID !== "") {
                guests = registration.guestsID.split(",").map(guestID => {
                    const guest = this.guests[guestID];
                    (guest.discountCode != null) && (isDiscountActive = true);
                    return guest.getFullName()
                });
            }
			Check.openPDF(registration, category, guests, isDiscountActive);
		},
		
		saveRegistration() {
			let action = "add-registration";
			const isEditRegistrationMode = this.isEditRegistrationMode;
			if (isEditRegistrationMode) action = "update-registration";
			this.setRegistrationServices();
			this.sendData(action, JSON.stringify(this.registration), () => {
				if (isEditRegistrationMode) {
					const registration = this.registrations[this.editRegistrationIndex];
					registration.roomNumber = this.registration.roomNumber;
					registration.priceServices = this.registration.priceServices;
					registration.dateOfArrival = new Date(this.registration.dateOfArrival);
					registration.dateOfDeparture = new Date(this.registration.dateOfDeparture);
					registration.methodOfPayment = this.registration.methodOfPayment;
					registration.guestsID = this.registration.guestsID;
					registration.servicesJSON = this.registration.servicesJSON;
				} else {
					this.registrations.push(
						Registration.createRegistration(
							this.registration.roomNumber,
							this.registration.price,
							this.registration.priceServices,
							new Date(this.registration.dateOfArrival),
							new Date(this.registration.dateOfDeparture),
							(this.isReservationMode ? "" : this.registration.methodOfPayment),
							this.registration.guestsID,
							this.registration.servicesJSON)
					);
				}
				const room = Room.getRoomByNumber(this.rooms, this.registration.roomNumber)[0];
				room.dateOfArrival = new Date(this.registration.dateOfArrival);
				room.dateOfDeparture = new Date(this.registration.dateOfDeparture);
				room.status = true;
				this.resetRegistrationData();
			});
			this.closeRegistrationPopup();
		},
		deleteRegistration(index) {
			this.sendData("delete-registration", JSON.stringify({roomNumber: this.registrations[index].roomNumber}), () => {
				const room = Room.getRoomByNumber(this.rooms, this.registrations[index].roomNumber)[0];
				room.dateOfArrival = "";
				room.dateOfDeparture = "";
				room.status = false;
				this.registrations.splice(index, 1);
			});
		},
		
		sendRegistrationData(action, registration, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", action);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify(registration));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback();
			}
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
		
		getData(action) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", action, false);
			xhr.send();
			if (xhr.status === 200) {
				return JSON.parse(xhr.response, (key, value) => {
					if (key.startsWith("date")) return new Date(value);
					return value
				});
			}
		}
	},
	mounted() {
		const roomsData = this.getData("get-rooms");
		const guestData = this.getData("get-guests");
		const service = this.getData("get-services");
		const registrationsData = this.getData("get-registration");
		const {restaurantService, laundryService} = service;
		
		this.rooms = roomsData.map(room => {
			const registration = registrationsData.find(registration => {
				if (registration.dateOfDeparture < new Date()) return false;
				return registration.roomNumber === room.number
			}) || {};
			return new Room(room.number,
				room.category,
				registration.dateOfArrival,
				registration.dateOfDeparture,
				room.price
			);
		});
		this.guests = guestData.map(guest => {
			return new Guest(guest.id,
				guest.firstName,
				guest.lastName,
				guest.phone,
				guest.address,
				guest.passportDetails,
				guest.dateOfBirth,
				guest.discountCode
			);
		});
		this.registrations = registrationsData.map(registration => {
			return new Registration(registration.id,
				registration.roomNumber,
				registration.price,
				registration.priceServices,
				registration.dateOfArrival,
				registration.dateOfDeparture,
				registration.methodOfPayment,
				registration.guestsID,
				registration.servicesJSON
			);
		}).filter(registration => registration.dateOfDeparture > new Date());
		
		formatService(restaurantService, this.services.restaurantService);
		formatService(laundryService, this.services.laundryService);
		this.displayedRegistrations = this.registrations;
	}
});

function formatService(serviceData, formattedService) {
	const categories = new Set();
	serviceData.forEach(service => categories.add(service.category));
	categories.forEach(category => {
		formattedService.push({
			name: category,
			list: serviceData.filter(service => service.category === category)
		})
	});
}

function setSelectedService(value, service, selectedServices) {
	selectedServices[service.id] = {
		name: service.name,
		cost: service.cost,
		count: value
	};
	if (value === 0) delete selectedServices[service.id];
}