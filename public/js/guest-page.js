import Room from "/js/data/Room.js";
import Registration from "/js/data/Registration.js";

new Vue({
	el: 'article',
	data: {
		rooms: [],
		registrations: [],
		freeRoomNumbers: [],
		registration: {
			roomNumber: null,
			price: null,
			dateOfArrival: null,
			dateOfDeparture: null,
			methodOfPayment: null,
			guestID: 1 /*TODO add Guest ID */,
			wholeAmount: 0
		},
		openedRegistrationPopup: false,
		registrationPopupErrorMessage: ""
	},
	watch: {},
	methods: {
		getFormatDate(date) {
			return `${date.getDay()} : ${date.getMonth()} : ${date.getFullYear()}`
		},
		openRegistrationPopup() {
			this.freeRoomNumbers = Room.getAvailableRooms(this.rooms).map(element => element.number);
			if (!this.freeRoomNumbers.length) this.registrationPopupErrorMessage = "Вільних номерів немає";
			this.openedRegistrationPopup = true;
		},
		closeRegistrationPopup() {
			this.openedRegistrationPopup = false;
		},
		onChangeRoomNumber() {
			this.registration.price = Room.getPriceByNumber(this.rooms, Number(this.registration.roomNumber));
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
		},
		resetRegistrationData() {
			this.registration = {
				roomNumber: null,
				price: null,
				dateOfArrival: null,
				dateOfDeparture: null,
				methodOfPayment: null,
				guestID: 1 /*TODO add Guest ID */,
				wholeAmount: 0
			};
		},
		addRegistration() {
			this.addRegistrationData(this.registration, () => {
				this.registrations.push(
					Registration.createRegistration(
						this.registration.roomNumber,
						this.registration.price,
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
			xhr.open('POST', 'add-registrationPage');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(registrationPage));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback();
			}
		},
		deleteRegistrationData(roomNumber, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'delete-registration');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify({roomNumber: roomNumber}));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback();
			}
		},
		getRoomsData() {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'get-rooms', false);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send();
			if (xhr.status === 200) {
				return JSON.parse(xhr.response);
			}
		},
		getRegistrationData() {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'get-registration', false);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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
		this.registrations = registrationsData.map(registration => {
			return new Registration(registration.id,
				registration.roomNumber,
				registration.price,
				registration.dateOfArrival,
				registration.dateOfDeparture,
				registration.methodOfPayment,
				registration.guestID
			);
		});
	}
});

/*TODO refactoring edit registration */
/*TODO methodOfPayment*/
/*TODO guestID */