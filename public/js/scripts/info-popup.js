export default {
	data() {
		return {
			infoPopupMessage: "",
			openedInfoPopup: false
		}
	},
	methods: {
		openInfoPopup(message) {
			this.infoPopupMessage = message;
			this.openedInfoPopup = true;
			setTimeout(() => this.closeInfoPopup(), 3000);
		},
		closeInfoPopup() {
			this.openedInfoPopup = false;
		}
	},
	template: '<div class="info-popup" :class="{\'show\' : openedInfoPopup}"><p v-text="infoPopupMessage"></p></div>'
}
