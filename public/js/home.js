class Room {
	constructor(number, category, status, dateOfArrival, dateOfDeparture, price) {
		this.number = number;
		this.category = category;
		this.status = status;
		this.dateOfArrival = dateOfArrival;
		this.dateOfDeparture = dateOfDeparture;
		this.price = price;
	}
	
	editRoom(options) {
		this.number = options.number;
		this.category = options.category;
		this.status = options.status;
		this.dateOfArrival = options.dateOfArrival;
		this.dateOfDeparture = options.dateOfDeparture;
		this.price = options.price;
	}
	
	static getRoomByNumber(rooms, number) {
		const result = [];
		const room = rooms.find(room => room.number === parseInt(number));
		if (room) result.push(room);
		return result;
	}
	
	static getRoomsByCategory(rooms, category) {
		return rooms.filter(room => room.category.startsWith(category));
	}
	
	static getAvailableRooms(rooms) {
		return rooms.filter(room => room.status);
	}
}

new Vue({
	el: 'article',
	data: {
		rooms: [],
		displayedRooms: [],
		numberFilter: "",
		categoryFilter: "",
		editPriceData: "",
		editCategoryData: "",
		editDateOfArrivalData: "",
		editDateOfDepartureData: "",
		editPopupErrorMessage: "",
		editRoomNumber: null,
		editNumberData: null,
		editStatusData: false,
		openedEditPopup: false,
		showAvailableRooms: false
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
			return `${date.getDay()} : ${date.getMonth()} : ${date.getFullYear()}`
		},
		openEditPopup(index) {
			this.openedEditPopup = true;
			this.editRoomNumber = this.displayedRooms[index].number;
			this.editPriceData = this.displayedRooms[index].price;
			this.editNumberData = this.displayedRooms[index].number;
			this.editStatusData = this.displayedRooms[index].status;
			this.editCategoryData = this.displayedRooms[index].category;
			this.editDateOfArrivalData = this.displayedRooms[index].dateOfArrival;
			this.editDateOfDepartureData = this.displayedRooms[index].dateOfDeparture;
		},
		closeEditPopup() {
			this.openedEditPopup = false;
		},
		saveNewRoomData() {
			if (this.editRoomNumber !== Number(this.editNumberData)) {
				if (this.checkRoom(this.editNumberData)) {
					this.editPopupErrorMessage = "Цей номер вже існює";
					setTimeout(() => this.editPopupErrorMessage = "", 3000);
					return;
				}
			}
			this.sendDataToServer(this.editRoomNumber);
			this.updateRoomData(this.editRoomNumber);
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
		sendDataToServer(editRoomNumber) {
			const data = {
				editNumber: editRoomNumber,
				number: this.editNumberData,
				category: this.editCategoryData,
				status: this.editStatusData,
				dateOfArrival: this.editDateOfArrivalData,
				dateOfDeparture: this.editDateOfDepartureData,
				price: this.editPriceData,
			};
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'update-room');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));
		},
		updateRoomData(editRoomNumber) {
			const editRoom = this.rooms.find((element) => element.number === editRoomNumber);
			editRoom.editRoom({
				price: this.editPriceData,
				number: this.editNumberData,
				status: this.editStatusData,
				category: this.editCategoryData,
				dateOfArrival: this.editDateOfArrivalData,
				dateOfDeparture: this.editDateOfDepartureData
			});
		}
	},
	mounted() {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', 'get-rooms');
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send();
		xhr.onloadend = () => {
			if (xhr.status === 200) {
				const roomsData = JSON.parse(xhr.response, (key, value) => {
					if (key.startsWith("date")) return new Date(value);
					return value
				});
				this.rooms = roomsData.map(room => new Room(room.number, room.category, room.status,
					room.dateOfArrival, room.dateOfDeparture, room.price));
				this.displayedRooms = this.rooms;
			}
		};
	}
});
