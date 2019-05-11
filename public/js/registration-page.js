import Room from "./data/Room.js";
import Guest from "./data/Guest.js";
import Registration from "./data/Registration.js";
import DateFormater from "./data/Date-formater.js";

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
			paidStatus: false
		},
		services: {
			enableBreakfast: false,
			enableTransfer: false,
			enableRestaurantService: false,
			enableLaundryService: false,
		},
		openedRegistrationPopup: false,
		openedServicesPopup: false,
		isEditRegistrationMode: false,
		isReservationMode: false,
		methodsOfPayment: [
			"Наличный",
			"Безналичный"
		],
		priceServices: {
			breakfast: 30,
			transfer: 50,
		},
		popupHeader: "",
		popupErrorMessage: "Вільних номерів немає!",
		showPopupErrorMessage: false,
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
			this.popupHeader = "Оформить регистрацию:";
			this.freeRoomNumbers = Room.getAvailableRooms(this.rooms).map(element => element.number);
			
			if (mode === "editRegistrationMode") {
				this.isEditRegistrationMode = true;
				this.popupHeader = "Редактировать регистрацию:";
				this.freeRoomNumbers.push(this.displayedRegistrations[index].roomNumber);
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
			}
			
			if (mode === "reservationMode") {
				this.popupHeader = "Оформить бронь:";
				this.isReservationMode = true;
				this.registration.paidStatus = true;
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
			[...event.target.selectedOptions].forEach((option) => this.registration.guestsID += `${option.index},`);
			this.registration.guestsID = this.registration.guestsID.slice(0, -1);
		},
		onChangeServices() {
			this.registration.priceServices = 0;
			const duration = (new Date(this.registration.dateOfDeparture) - new Date(this.registration.dateOfArrival)) / 86400000;
			if (this.services.enableBreakfast) {
				this.registration.priceServices += this.priceServices.breakfast * duration * this.registration.guestsID.split(",").length;
			}
			if (this.services.enableTransfer) {
				this.registration.priceServices += this.priceServices.transfer * duration * this.registration.guestsID.split(",").length;
			}
			this.setSumPrice();
		},
		setSumPrice() {
			if (this.registration.dateOfArrival && this.registration.dateOfDeparture) {
				const duration = (new Date(this.registration.dateOfDeparture) - new Date(this.registration.dateOfArrival)) / 86400000;
				const price = this.registration.price || 0;
				this.registration.wholeAmount = price * duration;
			} else {
				this.registration.wholeAmount = 0;
			}
			this.registration.wholeAmount += this.registration.priceServices;
			this.registration.surchargeCost = this.registration.wholeAmount - this.registration.initialWholeAmount;
		},
		resetRegistrationData() {
			this.registration = {
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
				paidStatus: false
			};
			this.services = {
				enableBreakfast: false,
				enableTransfer: false,
				enableRestaurantService: false,
				enableLaundryService: false,
			}
		},
		openServicesPopup() {
			this.openedServicesPopup = true;
			this.registration.paidStatus = false;
		},
		closeServicesPopup() {
			this.openedServicesPopup = false;
		},
		openPDFCheck() {
			const clientName = Guest.getGuestByID(this.guests, this.registration.guestsID).getFullName();
			const docDefinition = {
				content: [
					{text: 'HOTEL', style: ['header']},
					`Клиент:  ${clientName}`,
					`Номер комнаты:  ${this.registration.roomNumber}`,
					`Дата заселения:  ${this.registration.dateOfArrival}`,
					`Дата выселения:  ${this.registration.dateOfDeparture}`,
					`Цена за сутки:  ${this.registration.price} $`,
					`Метод оплаты:  ${this.registration.methodOfPayment}`,
					`____________________________________________________`,
					{text: 'Дополнительные услуги:', style: ['subHeader']},
					`Цена завтрака:  ${this.services.breakfast} $`,
					`Цена такси:  ${this.services.taxi} $`,
					`Цена прачечной:  ${this.services.washing} $`,
					`____________________________________________________`,
					{text: `Общая сумма: ${this.registration.wholeAmount} $`, style: ['subHeader']},
				],
				styles: {
					header: {
						fontSize: 22,
						bold: true,
						alignment: 'center'
					},
					subHeader: {
						fontSize: 16,
						bold: true
					}
				}
			};
			pdfMake.createPdf(docDefinition).open();
		},
		addRegistration() {
			this.addRegistrationData(this.registration, () => {
				this.registrations.push(
					Registration.createRegistration(
						this.registration.roomNumber,
						this.registration.price,
						this.registration.priceServices,
						new Date(this.registration.dateOfArrival),
						new Date(this.registration.dateOfDeparture),
						(this.isReservationMode ? "" : this.registration.methodOfPayment),
						this.registration.guestsID)
				);
				const room = Room.getRoomByNumber(this.rooms, this.registration.roomNumber)[0];
				room.dateOfArrival = new Date(this.registration.dateOfArrival);
				room.dateOfDeparture = new Date(this.registration.dateOfDeparture);
				room.status = true;
				this.resetRegistrationData();
			});
			this.closeRegistrationPopup();
		},
		deleteRegistration(index) {
			this.deleteRegistrationData(this.registrations[index].roomNumber, () => {
				const room = Room.getRoomByNumber(this.rooms, this.registrations[index].roomNumber)[0];
				room.dateOfArrival = "";
				room.dateOfDeparture = "";
				room.status = false;
				this.registrations.splice(index, 1);
			});
		},
		addRegistrationData(registrationPage, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "add-registration");
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify(registrationPage));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback();
			}
		},
		deleteRegistrationData(roomNumber, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "delete-registration");
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify({roomNumber: roomNumber}));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback();
			}
		},
		getRoomsData() {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "get-rooms", false);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send();
			if (xhr.status === 200) {
				return JSON.parse(xhr.response);
			}
		},
		getGuestsData() {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "get-guests", false);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send();
			if (xhr.status === 200) {
				return JSON.parse(xhr.response);
			}
		},
		getRegistrationData() {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "get-registration", false);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
		const roomsData = this.getRoomsData();
		const guestData = this.getGuestsData();
		const registrationsData = this.getRegistrationData();
		
		this.rooms = roomsData.map(room => {
			const registration = registrationsData.find(element => element.roomNumber === room.number) || {};
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
				guest.dateOfBirth
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
				registration.guestsID
			);
		});
		this.displayedRegistrations = this.registrations;
	}
});

//TODO Services module