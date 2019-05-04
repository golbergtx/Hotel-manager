import Room from "./data/Room.js";

new Vue({
	el: "article",
	data: {
		rooms: [],
		registrations: [],
		displayedRooms: [],
		numberFilter: "",
		categoryFilter: "",
		dateOfArrivalFilter: "",
		dateOfDepartureFilter: "",
		showAvailableRooms: false,
		openedEditPopup: false,
		editRoomNumber: null,
		editRoomData: {
			number: null,
			price: null,
			category: ""
		},
		popupErrorMessage: "Цей номер вже існює",
		showPopupErrorMessage: false
	},
	methods: {
		applyFilters() {
			this.displayedRooms = this.rooms;
			if (this.numberFilter) {
				this.displayedRooms = Room.getRoomByNumber(this.displayedRooms, this.numberFilter);
			}
			if (this.categoryFilter) {
				this.displayedRooms = Room.getRoomsByCategory(this.displayedRooms, this.categoryFilter);
			}
			if (this.showAvailableRooms) {
				this.displayedRooms = Room.getAvailableRooms(this.displayedRooms, this.showAvailableRooms);
			}
			this.displayedRooms = Room.getRoomsByPeriod(this.displayedRooms,
				new Date(this.dateOfArrivalFilter),
				new Date(this.dateOfDepartureFilter)
			);
		},
		openEditPopup(index) {
			this.openedEditPopup = true;
			this.editRoomNumber = this.displayedRooms[index].number;
			this.editRoomData.price = this.displayedRooms[index].price;
			this.editRoomData.number = this.displayedRooms[index].number;
			this.editRoomData.category = this.displayedRooms[index].category;
		},
		closeEditPopup() {
			this.openedEditPopup = false;
		},
		updateRoom() {
			if (this.editRoomNumber !== Number(this.editRoomData.number)) {
				if (this.checkRoom(this.editRoomData.number)) {
					this.showPopupErrorMessage = true;
					setTimeout(() => this.showPopupErrorMessage = false, 3000);
					return;
				}
			}
			this.updateRoomData(this.editRoomNumber);
			this.editRoom(this.editRoomNumber);
			this.closeEditPopup();
		},
		checkRoom(number) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "get-room", false);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(`number=${encodeURIComponent(number)}`);
			if (xhr.status === 302) {
				return true;
			} else if (xhr.status === 404) {
				return false;
			}
		},
		updateRoomData(editRoomNumber) {
			const data = this.editRoomData;
			data.editNumber = editRoomNumber;
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "update-room");
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify(data));
		},
		editRoom(editRoomNumber) {
			const room = this.rooms.find((element) => element.number === editRoomNumber);
			room.editRoom(this.editRoomData);
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
		this.displayedRooms = this.rooms;
	}
});