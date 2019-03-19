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
			dateOfArrival: null,
			dateOfDeparture: null,
			methodOfPayment: null,
			guestID: 1,
			wholeAmount: 0
		},
		openedRegistrationPopup: false,
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
				guestID: 0,
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
				registration.dateOfArrival,
				registration.dateOfDeparture,
				registration.methodOfPayment,
				registration.guestID
			);
		});
		this.displayedRegistrations = this.registrations;
	}
});