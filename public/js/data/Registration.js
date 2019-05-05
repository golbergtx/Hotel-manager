import DateFormater from "/js/data/Date-formater.js";

export default class Registration {
	constructor(id, roomNumber, price, priceServices, dateOfArrival, dateOfDeparture, methodOfPayment, guestsID) {
		this.id = id;
		this.roomNumber = roomNumber;
		this.price = price;
		this.priceServices = priceServices;
		this.dateOfArrival = dateOfArrival;
		this.dateOfDeparture = dateOfDeparture;
		this.methodOfPayment = methodOfPayment;
		this.guestsID = guestsID;
	}
	
	getDateOfArrival() {
		return DateFormater.getFormatDate(this.dateOfArrival);
	}
	
	getDateOfDeparture() {
		return DateFormater.getFormatDate(this.dateOfDeparture);
	}
	
	getPrice() {
		return `${this.price} $`
	}
	
	getSumPrice() {
		let wholeAmount = 0;
		if (this.dateOfArrival && this.dateOfDeparture) {
			const duration = (this.dateOfDeparture - this.dateOfArrival) / 86400000;
			const price = this.price || 0;
			wholeAmount = Math.round(price * duration);
		}
		wholeAmount += this.priceServices;
		return `${wholeAmount} $`;
	}
	
	static getRegistrationByGuestID(registrations, id) {
		return registrations.filter(registration => registration.guestsID.split(",").includes(id.toString()));
	}
	
	static createRegistration(roomNumber, price, priceServices, dateOfArrival, dateOfDeparture, methodOfPayment, guestsID) {
		return new Registration(null, roomNumber, price, priceServices, dateOfArrival, dateOfDeparture, methodOfPayment, guestsID)
	}
}