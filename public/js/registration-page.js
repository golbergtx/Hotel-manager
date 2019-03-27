import Room from "/js/data/Room.js";
import Guest from "/js/data/Guest.js";
import Registration from "/js/data/Registration.js";

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
			priceServices: 0,
			dateOfArrival: null,
			dateOfDeparture: null,
			methodOfPayment: null,
			guestID: 0,
			wholeAmount: 0,
			paidStatus: false
		},
		services: {
			breakfast: 0,
			taxi: 0,
			washing: 0
		},
		openedRegistrationPopup: false,
		openedServicesPopup: false,
		methodsOfPayment: [
			"Наличный",
			"Безналичный"
		],
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
		openRegistrationPopup() {
			this.freeRoomNumbers = Room.getAvailableRooms(this.rooms).map(element => element.number);
			this.registration.guestID = this.guests[0].id;
			if (!this.freeRoomNumbers.length) this.showPopupErrorMessage = true;
			else this.showPopupErrorMessage = false;
			this.openedRegistrationPopup = true;
		},
		closeRegistrationPopup() {
			this.openedRegistrationPopup = false;
		},
		onChangeRoomNumber() {
			this.registration.price = Room.getPriceByNumber(this.rooms, Number(this.registration.roomNumber));
			this.setSumPrice();
		},
		onChangeGuestID(event) {
			this.registration.guestID = this.guests[event.target.selectedIndex].id;
		},
		onChangePriceServices() {
			this.registration.priceServices = this.services.breakfast + this.services.taxi + this.services.washing;
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
		},
		resetRegistrationData() {
			this.registration = {
				roomNumber: null,
				price: null,
				priceServices: 0,
				dateOfArrival: null,
				dateOfDeparture: null,
				methodOfPayment: null,
				guestID: 0,
				wholeAmount: 0,
				paidStatus: false
			};
			this.services = {
				breakfast: 0,
				taxi: 0,
				washing: 0
			};
		},
		openServicesPopup() {
			this.openedServicesPopup = true;
			this.registration.paidStatus = false;
		},
		closeServicesPopup() {
			this.openedServicesPopup = false;
		},
		openPDFCheck() {
			const clientName = Guest.getGuestByID(this.guests, this.registration.guestID).getFullName();
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
						this.registration.methodOfPayment,
						this.registration.guestID)
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
				registration.guestID
			);
		});
		this.displayedRegistrations = this.registrations;
	}
});