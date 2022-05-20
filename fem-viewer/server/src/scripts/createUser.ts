import db from "../db";
import yargs from "yargs";
import { UserRole } from "@prisma/client";
import { hashPassword } from "../passportSetup";

const argv = yargs
	.command("createuser", "Creates an user", {
		username: {
			description: "Username of the user to create",
			alias: "u",
			type: "string",
		},
		password: {
			description: "Password of the user to create",
			alias: "p",
			type: "string",
		},
		role: {
			description: "Role of the user to create (ADMIN, DEVELOPER, USER)",
			alias: "r",
			type: "string",
		},
	})
	.help()
	.alias("help", "h").argv;

(() => {
	if (argv.username === undefined) {
		console.log("Username not provided");
		return;
	}
	if (argv.password === undefined) {
		console.log("Password not provided");
		return;
	}
	if (argv.role === undefined) {
		console.log("Role not provided");
		return;
	}

	let error = false;

	if ((argv.username as string).length < 6) {
		console.log("Username must be longer than 6 characters");
		error = true;
	}

	if ((argv.password as string).length < 6) {
		console.log("Password must be longer than 6 characters");
		error = true;
	}

	if (!Object.values(UserRole).includes(argv.role as UserRole)) {
		console.log("Role must be in [ADMIN, DEVELOPER, VIEWER]");
		error = true;
	}

	if (error) return;

	hashPassword(argv.password as string, (hash) => {
		db.user
			.create({
				data: {
					username: argv.username as string,
					password: hash,
					role: argv.role as UserRole,
				},
			})
			.then((user) => {
				console.log("User created: ", user);
			})
			.catch((err) => {
				console.log(err);
			});
	});
})();
