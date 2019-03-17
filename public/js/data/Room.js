import DateFormater from "/js/data/Date-formater.js";

export default class Room {
	constructor(number, category, dateOfArrival, dateOfDeparture, price) {
		this.number = number;
		this.category = category;
		this.dateOfArrival = dateOfArrival;
		this.dateOfDeparture = dateOfDeparture;
		this.status = Boolean(dateOfArrival);
		this.price = price;
	}
	
	getPrice() {
		return `${this.price} $`
	}
	
	getStatus() {
		return (this.status) ? "Занято" : "Свободно"
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
	
	static getAvailableRooms(rooms) {
		return rooms.filter(room => !room.status);
	}
}