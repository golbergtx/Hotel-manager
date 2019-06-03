class DateFormater {
	static getFormatDate(date, delimiter = " : ") {
		if (!(date instanceof Date)) return "-";
		let day = date.getDate();
		let month = date.getMonth() + 1;
		if (day <= 9) day = `0${day}`;
		if (month <= 9) month = `0${month}`;
		return `${day}${delimiter}${month}${delimiter}${date.getFullYear()}`;
	}
}

module.exports = DateFormater;