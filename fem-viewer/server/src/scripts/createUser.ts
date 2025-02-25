import db from "../db";
import yargs from "yargs";
import { UserRole } from "@prisma/client";
import { hashPassword } from "../passportSetup";
import { ArgumentsCamelCase } from "yargs";

interface Args extends ArgumentsCamelCase {
	username: string;
	password: string;
	role: string;
}

const createUser = async () => {
	const argv = await yargs
		.command("createuser", "Creates an user", {
			username: {
				description: "Username of the user to create",
				alias: "u",
				type: "string",
				demandOption: true,
				requiresArg: true,
			},
			password: {
				description: "Password of the user to create",
				alias: "p",
				type: "string",
				demandOption: true,
				requiresArg: true,
			},
			role: {
				description: "Role of the user to create (ADMIN, DEVELOPER, USER)",
				alias: "r",
				type: "string",
				demandOption: true,
				choices: Object.values(UserRole),
			},
		})
		.help()
		.alias("help", "h")
		.strict()
		.parse() as Args;

	if (argv.username.length < 6) {
		console.error("Username must be longer than 6 characters");
		return;
	}

	if (argv.password.length < 6) {
		console.error("Password must be longer than 6 characters");
		return;
	}

	try {
		const hash = await new Promise<string>((resolve) => {
			hashPassword(argv.password, resolve);
		});

		const user = await db.user.create({
			data: {
				username: argv.username,
				password: hash,
				role: argv.role as UserRole,
			},
		});

		console.log("User created:", user);
	} catch (err) {
		console.error("Error creating user:", err);
	}
};

createUser().catch((err) => {
	console.error("Fatal error:", err);
});
