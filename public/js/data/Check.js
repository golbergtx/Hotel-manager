import logo from "./Logo-data.js";
import Registration from "./Registration.js";

export default class Check {
	static docDefinition = null;
	
	static makePDF(registration, roomCategory, guests, isDiscountActive) {
		const services = JSON.parse(registration.servicesJSON);
		const breakfast = services.enableBreakfast ? "Включений" : "Відсутній";
		const transfer = services.enableTransfer ? "Включений" : "Відсутній";
		const restaurant = [["Назва", "Ціна", "Кількість"]];
		const laundry = [["Назва", "Ціна", "Кількість"]];
		
		Object.values(services.restaurant).forEach(service => restaurant.push([service.name, service.cost, service.count]));
		Object.values(services.laundry).forEach(service => laundry.push([service.name, service.cost, service.count]));
		
		const wholeAmount = Registration.prototype.getSumPrice.call(registration);
		const wholeAmountWithDiscount = isDiscountActive ? `${Math.round(parseInt(wholeAmount) * 90) / 100} $` : wholeAmount;
		
		this.docDefinition = {
			content: [
				{
					image: logo.image,
					width: 219,
					height: 85,
					margin: [150, 0, 0, 0]
				},
				"_______________________________________________________________________________________________",
				{text: "Квитанція:", style: ["header"]},
				{
					table: {
						headerRows: 1,
						widths: [200, 100],
						body: [
							["Номер кімнати:", registration.roomNumber],
							["Категорія:", roomCategory],
							["Дата заселення:", Registration.prototype.getDateOfArrival.call(registration)],
							["Дата виселення:", Registration.prototype.getDateOfDeparture.call(registration)],
							["Ціна за добу: ", registration.price],
							["Метод оплати:  ", registration.methodOfPayment]
						]
					}
				},
				{text: "Додаткові послуги:", style: ["header"]},
				{text: `Сніданок:  ${breakfast}`, style: ["text"]},
				{text: `Трансфер:  ${transfer}`, style: ["text"]},
				{text: "Рум сервіс:", style: ["header"]},
				{
					table: {
						headerRows: 1,
						widths: [150, 70, 70],
						body: restaurant
					}
				},
				{text: "Пральня:", style: ["header"]},
				{
					table: {
						headerRows: 1,
						widths: [150, 70, 70],
						body: laundry
					}
				},
				{text: "Гості:", style: ["header"]},
				{
					ul: guests
				},
				"_______________________________________________________________________________________________",
				{text: `Загальна сума: ${wholeAmount}`, style: ["header"]},
				{text: `Загальна сума зі знижкою: ${wholeAmountWithDiscount}`, style: ["header"]},
			],
			styles: {
				header: {
					fontSize: 16,
					bold: true,
					margin: [0, 10, 0, 10]
				},
				text: {
					margin: [0, 5, 0, 5]
				}
			}
		};
	}
	
	static openPDF(registration, roomCategory, guests, isDiscountActive) {
		this.makePDF(registration, roomCategory, guests, isDiscountActive);
		pdfMake.createPdf(this.docDefinition).open();
	}
}
