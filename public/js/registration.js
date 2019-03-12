class Registration {
	constructor(registrationID, roomNumber, price, dateOfArrival, dateOfDeparture, methodOfPayment, guestID) {
		this.registrationID = registrationID;
		this.roomNumber = roomNumber;
		this.price = price;
		this.dateOfArrival = dateOfArrival;
		this.dateOfDeparture = dateOfDeparture;
		this.methodOfPayment = methodOfPayment;
		this.guestID = guestID;
	}
	
	getSumPrice() {
		return this.price * 0;
	}
	
	pay() {
		//TODO implement method
	}
	
	chooseRoom() {
	
	}
	
	checkPaymentStatus() {
		//TODO implement method
	}
	
	saveChanges() {
	
	}
	
	
}

new Vue({
	el: 'article',
	data: {
		rooms: [],
	},
	watch: {},
	methods: {},
	mounted() {
	
	}
});
