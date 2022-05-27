import { PassportStatic } from "passport";
import passportLocal from "passport-local";
import db from "./db";
import bcrypt from "bcrypt";

export const hashPassword = (password: string, cb: (hash: string) => void) => {
	bcrypt.genSalt(10, (err, salt) => {
		if (!err) {
			bcrypt.hash(password, salt, (err, hash) => {
				if (!err) {
					cb(hash);
				} else {
					console.log("Error hashing password");
				}
			});
		}
	});
};

export const validatePassword = (
	password: string,
	hash: string,
	cb: (result: boolean) => void
) => {
	bcrypt.compare(password, hash, (err, result) => {
		if (!err) {
			cb(result);
		} else {
			throw new Error("Error comparing password");
		}
	});
};

const LocalStrategy = passportLocal.Strategy;

const setupPassport = (passport: PassportStatic) => {
	const verifyCallback: passportLocal.VerifyFunction = (
		username,
		password,
		done
	) => {
		db.user
			.findUnique({
				where: { username: username },
			})
			.then((user) => {
				if (!user) {
					return done(null, false);
				}
				validatePassword(password, user.password, (isValid) => {
					if (isValid) {
						return done(null, {
							id: user.id,
							role: user.role,
							username: user.username,
						});
					} else {
						return done(null, false);
					}
				});
			})
			.catch((err) => {
				return done(err);
			});
	};

	const strategy = new LocalStrategy(
		{ usernameField: "username", passwordField: "password" },
		verifyCallback
	);

	passport.use(strategy);

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user: Express.User, done) => {
		db.user
			.findUnique({
				where: { id: user.id as string },
			})
			.then((user) => {
				if (!user) {
					return done(null, false);
				}

				return done(null, user);
			})
			.catch((err) => {
				return done(err);
			});
	});
};

export default setupPassport;
