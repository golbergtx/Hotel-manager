import Room from "./data/Room.js";
import infoPopup from "./scripts/info-popup.js"

Vue.component('info-popup', infoPopup);

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
			if (!this.isValidEditRoomData()) {
				alert("Заповніть всі поля!");
				return
			}
			if (this.editRoomNumber !== Number(this.editRoomData.number)) {
				if (this.isRoomExists(this.editRoomData.number)) {
					this.showPopupErrorMessage = true;
					setTimeout(() => this.showPopupErrorMessage = false, 3000);
					return;
				}
			}
			const data = this.editRoomData;
			data.editNumber = this.editRoomNumber;
			this.sendData("update-room", JSON.stringify(data), (response, status) => {
				if (status === 200) {
					this.$refs.infoPopup.openInfoPopup("Оновлено!");
					this.editRoom(this.editRoomNumber);
					this.closeEditPopup();
				} else {
					this.$refs.infoPopup.openInfoPopup("Oops! Something went wrong");
				}
			});
		},
		isRoomExists(number) {
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
		editRoom(editRoomNumber) {
			const room = this.rooms.find((element) => element.number === editRoomNumber);
			room.editRoom(this.editRoomData);
		},
		isValidEditRoomData() {
			return Object.values(this.editRoomData).every(element => element !== "");
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
			} else {
				alert("Oops! Something went wrong");
			}
		}
	},
	mounted() {
		const roomsData = this.getData("get-rooms");
		const registrationsData = this.getData("get-registration");
		this.rooms = roomsData.map(room => {
			const registration = registrationsData.find(registration => {
				if (registration.dateOfDeparture < new Date()) return false;
				return registration.roomNumber === room.number
			}) || {};
			
			return new Room(room.number,
				room.category,
				registration.dateOfArrival,
				registration.dateOfDeparture,
				room.price,
				(registration.methodOfPayment === null)
			);
		});
		this.displayedRooms = this.rooms;
	}
});