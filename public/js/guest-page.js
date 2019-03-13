import Guest from "/js/data/Guest.js";

new Vue({
	el: 'article',
	data: {
		guests: [],
		displayedGuests: [],
		nameFilter: "",
		editGuestID: null,
		guest: {
			firstName: "",
			lastName: "",
			phone: "",
			address: "",
			passportDetails: "",
			dateOfBirth: ""
		},
		openedGuestPopup: false
	},
	watch: {
		nameFilter(val) {
			if (val !== "") this.displayedGuests = Guest.getGuestByFirstName(this.guests, val);
			else this.displayedGuests = this.guests;
		},
	},
	methods: {
		createGuest() {
			this.openGuestPopup("create");
		},
		editGuest(index) {
			this.openGuestPopup("edit", index);
		},
		deleteGuest(index) {
		
		},
		openGuestPopup(type, index) {
			this.editType = type;
			if (this.editType === "edit") this.guest = Object.assign({}, this.displayedGuests[index]);
			this.openedGuestPopup = true;
		},
		closeGuestPopup() {
			this.openedGuestPopup = false;
		},
		resetGuest() {
			this.guest = {
				firstName: "",
				lastName: "",
				phone: "",
				address: "",
				passportDetails: "",
				dateOfBirth: ""
			};
		},
		saveGuestData() {
			if (this.editType === "edit") {
				this.updateGuestData(this.guest, () => {
					this.closeGuestPopup();
					this.resetGuest();
				});
			} else if (this.editType === "create") {
				this.createGuestData(this.guest, (result) => {
					this.closeGuestPopup();
					this.resetGuest();
					this.guests // push
					console.log(result);
				});
			}
		},
		
		createGuestData(guest, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'add-guest');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(guest));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback(xhr.response);
			}
		},
		updateGuestData(guest, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'update-guest');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(guest));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback();
			}
		},
		deleteRGuestData(roomNumber, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'delete-registration');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify({roomNumber: roomNumber}));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback();
			}
		},
		getGuestsData() {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'get-guests', false);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send();
			if (xhr.status === 200) {
				return JSON.parse(xhr.response);
			}
		},
	},
	mounted() {
		const guestData = this.getGuestsData();
		this.guests = guestData.map(guest => {
			return new Guest(guest.id,
				guest.firstName,
				guest.lastName,
				guest.phone,
				guest.address,
				guest.passportDetails,
				guest.dateOfBirth
			);
		});
		this.displayedGuests = this.guests;
	}
});