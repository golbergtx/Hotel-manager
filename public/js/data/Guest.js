export default class Guest {
	constructor(id, firstName, lastName, phone, address, passportDetails, dateOfBirth) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.phone = phone;
		this.address = address;
		this.passportDetails = passportDetails;
		this.dateOfBirth = dateOfBirth;
	}
	
	editGuest(options) {
		this.firstName = options.firstName;
		this.lastName = options.lastName;
		this.phone = options.phone;
		this.address = options.address;
		this.passportDetails = options.passportDetails;
		this.dateOfBirth = options.dateOfBirth;
	}
	
	getFullName(){
		return `${this.firstName} ${this.lastName}`;
	}
	
	static getGuestByFirstName(guests, firstName) {
		return guests.filter(guest => guest.firstName.startsWith(firstName));
	}
	
	static createGuest(firstName, lastName, phone, address, passportDetails, dateOfBirth) {
		return new Guest(null, firstName, lastName, phone, address, passportDetails, dateOfBirth);
	}
}