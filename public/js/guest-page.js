import Guest from "/js/data/Guest.js";

new Vue({
	el: 'article',
	data: {
		guests: [],
		displayedGuests: [],
		nameFilter: "",
		editGuestIndex: null,
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
			this.sendGuestData("delete-guest", {guestID: this.displayedGuests[index].id}, () => {
				this.displayedGuests.splice(index, 1);
			})
		},
		openGuestPopup(type, index) {
			this.editType = type;
			this.editGuestIndex = index;
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
				this.sendGuestData("update-guest", this.guest, () => {
					this.displayedGuests[this.editGuestIndex].firstName = this.guest.firstName;
					this.displayedGuests[this.editGuestIndex].lastName = this.guest.lastName;
					this.displayedGuests[this.editGuestIndex].phone = this.guest.phone;
					this.displayedGuests[this.editGuestIndex].address = this.guest.address;
					this.displayedGuests[this.editGuestIndex].passportDetails = this.guest.passportDetails;
					this.displayedGuests[this.editGuestIndex].dateOfBirth = this.guest.dateOfBirth;
					this.resetGuest();
				});
			} else if (this.editType === "create") {
				this.sendGuestData("add-guest", this.guest, (result) => {
					this.guests.push(new Guest(JSON.parse(result).id,
						this.guest.firstName,
						this.guest.lastName,
						this.guest.phone,
						this.guest.address,
						this.guest.passportDetails,
						this.guest.dateOfBirth
					));
					this.resetGuest();
				});
			}
			this.closeGuestPopup();
		},
		sendGuestData(action, data, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', action);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));
			xhr.onloadend = () => {
				if (xhr.status === 200) callback && callback(xhr.response);
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
		}
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