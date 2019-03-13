import Room from "/js/data/Room.js";
import Registration from "/js/data/Registration.js";

new Vue({
	el: 'article',
	data: {
		rooms: [],
		registrations: [],
		displayedRooms: [],
		numberFilter: "",
		categoryFilter: "",
		showAvailableRooms: false,
		openedEditPopup: false,
		editRoomData: {
			number: null,
			price: null,
			category: ""
		},
		editRoomNumber: null,
		editPopupErrorMessage: ""
	},
	watch: {
		numberFilter(val) {
			if (val !== "") this.displayedRooms = Room.getRoomByNumber(this.rooms, val);
			else this.displayedRooms = this.rooms;
		},
		categoryFilter(val) {
			if (val !== "") this.displayedRooms = Room.getRoomsByCategory(this.rooms, val);
			else this.displayedRooms = this.rooms;
		},
		showAvailableRooms(val) {
			if (val) this.displayedRooms = Room.getAvailableRooms(this.rooms, val);
			else this.displayedRooms = this.rooms;
		}
	},
	methods: {
		getFormatDate(date) {
			if (!(date instanceof Date)) return "-";
			return `${date.getDay()} : ${date.getMonth()} : ${date.getFullYear()}`
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
					this.editPopupErrorMessage = "Цей номер вже існює";
					setTimeout(() => this.editPopupErrorMessage = "", 3000);
					return;
				}
			}
			this.updateRoomData(this.editRoomNumber);
			this.editRoom(this.editRoomNumber);
			this.closeEditPopup();
		},
		checkRoom(number) {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'get-room', false);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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
			xhr.open('POST', 'update-room');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));
		},
		editRoom(editRoomNumber) {
			const room = this.rooms.find((element) => element.number === editRoomNumber);
			room.editRoom(this.editRoomData);
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
		this.displayedRooms = this.rooms;
	}
});
