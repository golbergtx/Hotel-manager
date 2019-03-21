ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
CREATE DATABASE hotel;
USE hotel;

CREATE TABLE `hotel`.`users` (
	login VARCHAR(30) NOT NULL,
	password VARCHAR(30) NOT NULL,
	name VARCHAR(30) NOT NULL
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
	dateOfBirth DATE NOT NULL
);

CREATE TABLE `hotel`.`registrations` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	roomNumber INT NOT NULL,
	price DECIMAL  NOT NULL,
	dateOfArrival DATE NOT NULL,
	dateOfDeparture DATE NOT NULL,
	methodOfPayment VARCHAR(30) NOT NULL,
	guestID INT  NOT NULL,
	FOREIGN KEY (roomNumber) REFERENCES rooms (number)
	ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (guestID) REFERENCES guests (id)
	ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT users(login, password, name)
VALUES ("admin", "admin" , "Tatyana");

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

INSERT guests(firstName, lastName, phone, address, passportDetails, dateOfBirth)
VALUES
("Остап", "Поляков", "0932671435", "Войково 12", "ВН 354928", "1990-01-18"),
("Герасим", "Лыткин", "0935673421", "Победы 44", "ВН 259851", "1980-02-24"),
("Родион", "Комаров", "0931762435", "Мира 7", "ВН 105378", "1996-03-20"),
("Иван", "Воронов", "0937631524", "Бородинская 1", "ВН 966710", "1978-05-05"),
("Эдуард", "Петров", "0931357246", "Трубниковский 42", "ВН 279772", "1988-06-03"),
("Борис", "Владимиров", "0935364712", "Трудовая 77", "ВН 384258", "1967-07-13"),
("Максим", "Хохлов", "0935416327", "Графитный 2", "ВН 369927", "1987-08-04"),
("Денис", "Пахомов", "0933746152", "Голиковский 34", "ВН 861454", "1976-09-28"),
("Николай", "Фокин", "0936723145", "Новоселки 23", "ВН 976009", "1993-10-01"),
("Александр", "Князев", "0935472631", "Маликова 17", "ВН 689592", "1995-11-15");

INSERT registrations(roomNumber, price, dateOfArrival, dateOfDeparture, methodOfPayment, guestID)
VALUES
(1, 400, "2019-03-01", "2019-04-10", "pay", 1),
(2, 400, "2019-03-02", "2019-04-15", "pay", 2),
(3, 400, "2019-03-03", "2019-04-20", "pay", 3),
(4, 600, "2019-03-04", "2019-04-25", "pay", 4),
(5, 600, "2019-03-05", "2019-04-30", "pay", 5);