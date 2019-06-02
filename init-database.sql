ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
CREATE DATABASE hotel;
USE hotel;

CREATE TABLE `hotel`.`users` (
	login VARCHAR(30) NOT NULL,
	password VARCHAR(30) NOT NULL,
	name VARCHAR(30) NOT NULL,
	isAdmin BOOL DEFAULT false
);

CREATE TABLE `hotel`.`rooms` (
	number INT PRIMARY KEY NOT NULL,
	category VARCHAR(30) NOT NULL,
	price DECIMAL NOT NULL
);

CREATE TABLE `hotel`.`guests` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	firstName VARCHAR(30) NOT NULL,
	lastName VARCHAR(30) NOT NULL,
	phone VARCHAR(30) NOT NULL,
	address VARCHAR(30) NOT NULL,
	passportDetails VARCHAR(30) NOT NULL,
	dateOfBirth DATE NOT NULL,
	discountCode VARCHAR(30)
);

CREATE TABLE `hotel`.`registrations` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	roomNumber INT NOT NULL,
	price DECIMAL  NOT NULL,
    priceServices DECIMAL NOT NULL,
	dateOfArrival DATE NOT NULL,
	dateOfDeparture DATE NOT NULL,
	methodOfPayment VARCHAR(30),
	guestsID VARCHAR(30) NOT NULL,
	servicesJSON JSON,
	FOREIGN KEY (roomNumber) REFERENCES rooms (number)
	ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `hotel`.`restaurantService` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(30) NOT NULL,
	cost DECIMAL NOT NULL,
	category VARCHAR(30) NOT NULL
);

CREATE TABLE `hotel`.`laundryService` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(30) NOT NULL,
	cost DECIMAL NOT NULL,
	category VARCHAR(30) NOT NULL
);

INSERT users(login, password, name, isAdmin)
VALUES ("admin", "admin" , "Tatyana", true);

INSERT rooms(number, category, price)
VALUES
(1, "Эконом", 300),
(2, "Эконом", 400),
(3, "Эконом", 400),
(4, "Эконом", 400),
(5, "Стандарт", 600),
(6, "Стандарт", 600),
(7, "Стандарт", 600),
(8, "Люкс", 800),
(9, "Люкс", 800),
(10, "Люкс", 800);

INSERT guests(firstName, lastName, phone, address, passportDetails, dateOfBirth, discountCode)
VALUES
("Остап", "Поляков", "0932671435", "Войково 12", "ВН 354928", "1990-01-18", "234285"),
("Герасим", "Лыткин", "0935673421", "Победы 44", "ВН 259851", "1980-02-24", "545634"),
("Родион", "Комаров", "0931762435", "Мира 7", "ВН 105378", "1996-03-20", null),
("Иван", "Воронов", "0937631524", "Бородинская 1", "ВН 966710", "1978-05-05", null),
("Эдуард", "Петров", "0931357246", "Трубниковский 42", "ВН 279772", "1988-06-03", "305809"),
("Борис", "Владимиров", "0935364712", "Трудовая 77", "ВН 384258", "1967-07-13", "435839"),
("Максим", "Хохлов", "0935416327", "Графитный 2", "ВН 369927", "1987-08-04", null),
("Денис", "Пахомов", "0933746152", "Голиковский 34", "ВН 861454", "1976-09-28", null),
("Николай", "Фокин", "0936723145", "Новоселки 23", "ВН 976009", "1993-10-01", null),
("Александр", "Князев", "0935472631", "Маликова 17", "ВН 689592", "1995-11-15", "095424");

INSERT registrations(roomNumber, price, priceServices, dateOfArrival, dateOfDeparture, methodOfPayment, guestsID, servicesJSON)
VALUES
(1, 400, 0, "2019-03-01", "2019-04-10", "Наличный", "1", '{"enableBreakfast":true,"enableTransfer":true,"restaurant":{"8":{"name":"Кукурудзяна лазанья ","cost":32,"count":3},"13":{"name":"Торт","cost":35,"count":2}},"laundry":{"3":{"name":"Піджак","cost":160,"count":4},"8":{"name":"Сорочка","cost":75,"count":2}}}'),
(2, 400, 200, "2019-03-02", "2019-04-15", "Безналичный", "2", '{"enableBreakfast":false,"enableTransfer":false,"restaurant":{},"laundry":{}}'),
(3, 400, 0, "2019-03-03", "2019-04-20", "Наличный", "3", '{"enableBreakfast":false,"enableTransfer":false,"restaurant":{},"laundry":{}}'),
(4, 600, 0, "2019-03-04", "2019-04-25", "Безналичный", "4", '{"enableBreakfast":false,"enableTransfer":false,"restaurant":{},"laundry":{}}'),
(5, 600, 0, "2019-03-05", "2019-04-30", "Наличный", "5,6,7", '{"enableBreakfast":false,"enableTransfer":false,"restaurant":{},"laundry":{}}');

INSERT restaurantService(name, cost, category)
VALUES
("Віскі", 30, "Бар"),
("Сок", 40, "Бар"),
("Вода", 45, "Бар"),
("Борщ", 20, "Супи"),
("Харчо", 22, "Супи"),
("Солянка", 25, "Супи"),
("Фарширований перець", 30, "Гарячі страви"),
("Кукурудзяна лазанья ", 32, "Гарячі страви"),
("Млинці з сиром", 28, "Гарячі страви"),
("Цезар", 22, "Салати"),
("Мимоза", 15, "Салати"),
("Кальмари", 17, "Салати"),
("Торт", 35, "Десерти"),
("Заварне", 38, "Десерти");

INSERT laundryService(name, cost, category)
VALUES
("Піджак", 90, "Прання"),
("Піджак", 75, "Прасування"),
("Піджак", 160, "Хімчистка"),
("Брюки", 80, "Прання"),
("Брюки", 60, "Прасування"),
("Брюки", 185, "Хімчистка"),
("Сорочка", 90, "Прання"),
("Сорочка", 75, "Прасування"),
("Сорочка", 110, "Хімчистка"),
("Футболка", 70, "Прання"),
("Футболка", 50, "Прасування"),
("Футболка", 95, "Хімчистка")