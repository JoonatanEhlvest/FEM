import * as session from "express-session";
import mysqlStoreConstructor from "express-mysql-session";

const MySQLStore = mysqlStoreConstructor(session);

const options: mysqlStoreConstructor.Options = {
	connectionLimit: 10,
	password: process.env.DB_PASSWORD,
	user: process.env.DB_USER,
	database: process.env.MYSQL_DB,
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	createDatabaseTable: true,
};

const sessionStore = new MySQLStore(options);

export default sessionStore;
