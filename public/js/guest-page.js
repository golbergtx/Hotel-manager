import Guest from "./data/Guest.js";
import DateFormater from "./data/Date-formater.js";
import infoPopup from "./scripts/info-popup.js"

Vue.component('info-popup', infoPopup);

new Vue({
	el: "article",
	data: {
		guests: [],
		displayedGuests: [],
		nameFilter: "",
		editGuestIndex: null,
		isEditGuestMode: false,
		editGuestData: {
			firstName: "",
			lastName: "",
			phone: "",
			address: "",
			passportDetails: "",
			dateOfBirth: "",
			discountCode: ""
		},
		openedGuestPopup: false,
		popupHeader: "",
	},
	watch: {
		nameFilter(val) {
			if (val !== "") this.displayedGuests = Guest.getGuestByFirstName(this.guests, val);
			else this.displayedGuests = this.guests;
		},
	},
	methods: {
		createGuest() {
			this.popupHeader = "Додати гостя:";
			this.isEditGuestMode = false;
			this.openGuestPopup();
		},
		editGuest(index) {
			this.popupHeader = "Редагувати гостя:";
			this.isEditGuestMode = true;
			this.editGuestIndex = index;
			this.editGuestData = Object.assign({}, this.displayedGuests[index]);
			this.editGuestData.dateOfBirth = DateFormater.getFormatDate(this.editGuestData.dateOfBirth, "-", true);
			this.openGuestPopup(index);
		},
		deleteGuest(index) {
			this.sendData("delete-guest", JSON.stringify({guestID: this.displayedGuests[index].id}), () => {
					this.displayedGuests.splice(index, 1);
				}
			)
		},
		
		openGuestPopup(index) {
			this.openedGuestPopup = true;
		},
		closeGuestPopup() {
			this.resetGuest();
			this.openedGuestPopup = false;
		},
		resetGuest() {
			for (let key in this.editGuestData) {
				this.editGuestData[key] = "";
			}
		},
		
		saveGuestData() {
			if (!this.isValidEditGuestData()) {
				alert("Заповніть всі поля!");
				return
			}
			if (this.isEditGuestMode) {
				this.updateGuest();
			}
			else {
				this.addGuest()
			}
		},
		
		isValidEditGuestData() {
			return this.editGuestData.firstName !== "" &
				this.editGuestData.lastName !== "" &
				this.editGuestData.lastName !== "" &
				this.editGuestData.phone !== "" &
				this.editGuestData.address !== "" &
				this.editGuestData.passportDetails !== "" &
				this.editGuestData.dateOfBirth !== "";
		},
		
		addGuest() {
			this.sendData("add-guest", JSON.stringify(this.editGuestData), (response, status) => {
				if (status === 200) {
					this.guests.push(new Guest(JSON.parse(response).id,
						this.editGuestData.firstName,
						this.editGuestData.lastName,
						this.editGuestData.phone,
						this.editGuestData.address,
						this.editGuestData.passportDetails,
						new Date(this.editGuestData.dateOfBirth),
						this.editGuestData.discountCode
					));
					
					this.$refs.infoPopup.openInfoPopup("Додано!");
					this.closeGuestPopup();
				} else {
					this.$refs.infoPopup.openInfoPopup("Oops! Something went wrong");
				}
			});
		},
		updateGuest() {
			this.sendData("update-guest", JSON.stringify(this.editGuestData), (response, status) => {
				if (status === 200) {
					const guest = this.displayedGuests[this.editGuestIndex];
					guest.firstName = this.editGuestData.firstName;
					guest.lastName = this.editGuestData.lastName;
					guest.phone = this.editGuestData.phone;
					guest.address = this.editGuestData.address;
					guest.passportDetails = this.editGuestData.passportDetails;
					guest.dateOfBirth = new Date(this.editGuestData.dateOfBirth);
					guest.discountCode = this.editGuestData.discountCode;
					
					this.$refs.infoPopup.openInfoPopup("Оновлено!");
					this.closeGuestPopup();
				} else {
					this.$refs.infoPopup.openInfoPopup("Oops! Something went wrong");
				}
			});
		},
		
		sendData(action, data, callback) {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", action);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(data);
			xhr.onloadend = () => {
				if (callback) callback(xhr.response, xhr.status);
			}
		},
		getGuestsData() {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "get-guests", false);
			xhr.send();
			if (xhr.status === 200) {
				return JSON.parse(xhr.response, (key, value) => {
					if (key.startsWith("date")) return new Date(value);
					return value
				});
			} else {
				alert("Oops! Something went wrong");
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
				guest.dateOfBirth,
				guest.discountCode
			);
		});
		this.displayedGuests = this.guests;
	}
});