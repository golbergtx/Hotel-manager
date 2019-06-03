import DateFormater from "/js/data/Date-formater.js";

export default class Room {
	constructor(number, category, dateOfArrival, dateOfDeparture, price, reserved) {
		this.number = number;
		this.category = category;
		this.dateOfArrival = dateOfArrival;
		this.dateOfDeparture = dateOfDeparture;
		this.status = Boolean(dateOfArrival);
		this.reserved = reserved;
		this.price = price;
	}
	
	getPrice() {
		return `${this.price} $`
	}
	
	getStatus() {
		if (this.reserved) return "Заброньовано";
		return (this.status) ? "Занято" : "Вільно"
	}
	
	getDateOfArrival() {
		return DateFormater.getFormatDate(this.dateOfArrival);
	}
	
	getDateOfDeparture() {
		return DateFormater.getFormatDate(this.dateOfDeparture);
	}
	
	editRoom(options) {
		this.number = options.number;
		this.category = options.category;
		this.price = options.price;
	}
	
	static getRoomByNumber(rooms, number) {
		const result = [];
		const room = rooms.find(room => room.number === parseInt(number));
		if (room) result.push(room);
		return result;
	}
	
	static getPriceByNumber(rooms, number) {
		let result = 0;
		const room = rooms.find(room => room.number === parseInt(number));
		if (room) result = room.price;
		return result;
	}
	
	static getRoomsByCategory(rooms, category) {
		return rooms.filter(room => room.category.startsWith(category));
	}
	
	static getRoomsByPeriod(rooms, start, end) {
		let result = [];
		if (start.toString() !== "Invalid Date") {
			result = rooms.filter(room => {
				return DateFormater.getFormatDate(room.dateOfArrival, "-") >= DateFormater.getFormatDate(start, "-");
			});
		} else {
			result = rooms;
		}
		if (end.toString() !== "Invalid Date") {
			result = result.filter(room => {
				return DateFormater.getFormatDate(room.dateOfDeparture, "-") <= DateFormater.getFormatDate(end, "-");
			});
		}
		return result;
	}
	
	static getAvailableRooms(rooms, dateOfArrival) {
		return rooms.filter(room => !room.status || dateOfArrival > room.dateOfDeparture);
	}
}