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
	
	getSumPrice() {
		let wholeAmount = 0;
		if (this.dateOfArrival && this.dateOfDeparture) {
			const duration = (this.dateOfDeparture - this.dateOfArrival) / 86400000;
			const price = this.price || 0;
			wholeAmount = price * duration;
		}
		return wholeAmount;
	}
	
	getRegistrationByGuest() {
		//TODO implement method after guestID
	}
	
	pay() {
		//TODO implement method
	}
	
	checkPaymentStatus() {
		//TODO implement method
	}
	
	static createRegistration(roomNumber, price, dateOfArrival, dateOfDeparture, methodOfPayment, guestID) {
		return new Registration(null, roomNumber, price, dateOfArrival, dateOfDeparture, methodOfPayment, guestID)
	}
}