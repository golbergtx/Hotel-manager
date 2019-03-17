export default class Registration {
	constructor(id, roomNumber, price, dateOfArrival, dateOfDeparture, methodOfPayment, guestID) {
		this.id = id;
		this.roomNumber = roomNumber;
		this.price = price;
		this.dateOfArrival = dateOfArrival;
		this.dateOfDeparture = dateOfDeparture;
		this.methodOfPayment = methodOfPayment;
		this.guestID = guestID;
	}
	
	getDateOfArrival() {
		return getFormatDate(this.dateOfArrival);
	}
	
	getDateOfDeparture() {
		return getFormatDate(this.dateOfDeparture);
	}
	
	getPrice() {
		return `${this.price} $`
	}
	
	getSumPrice() {
		let wholeAmount = 0;
		if (this.dateOfArrival && this.dateOfDeparture) {
			const duration = (this.dateOfDeparture - this.dateOfArrival) / 86400000;
			const price = this.price || 0;
			wholeAmount = price * duration;
		}
		return `${wholeAmount} $`;
	}
	
	pay() {
		//TODO implement method
	}
	
	checkPaymentStatus() {
		//TODO implement method
	}
	
	static getRegistrationByGuestID(registrations, id) {
		return registrations.filter(registration => registration.id === id);
	}
	
	static createRegistration(roomNumber, price, dateOfArrival, dateOfDeparture, methodOfPayment, guestID) {
		return new Registration(null, roomNumber, price, dateOfArrival, dateOfDeparture, methodOfPayment, guestID)
	}
}

function getFormatDate(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	if (day <= 9) day = `0${day}`;
	if (month <= 9) month = `0${month}`;
	return `${day} : ${month} : ${date.getFullYear()}`
}