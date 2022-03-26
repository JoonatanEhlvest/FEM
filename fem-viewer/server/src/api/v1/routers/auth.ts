import e, { Router } from "express";
import db from "../../../db";
import passport from "passport";
import { hashPassword } from "../../../passportSetup";
import { Prisma } from "@prisma/client";
import { authorizeUser } from "./shared";

const router = Router();

router.post("/register", async (req, res, next) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res
				.status(422)
				.json({ message: "username or password not provided in body" });
		}

		hashPassword(password, async (hash) => {
			db.user
				.create({
					data: {
						username: username,
						password: hash,
					},
				})
				.then((user) => {
					console.log("Register: ", user);
					req.login(user.id as any, (err) => {
						console.log("Login after Register: ", user);
						return res.json({ user: user.id });
					});
				})
				.catch((err) => {
					if (err instanceof Prisma.PrismaClientKnownRequestError) {
						if (err.code === "P2002") {
							return res
								.status(422)
								.json({ message: "Username already taken" });
						}
					}
					return res.status(500).json({ message: err });
				});
		});
	} catch (err) {
		return res.status(500).json({ message: "Unable to register user" });
	}
});

router.post("/login", async (req, res, next) => {
	passport.authenticate("local", (err, user) => {
		if (!user) {
			return res.status(422).json({ message: "Invalid credentials" });
		}
		req.login(user, (err) => {
			console.log("Login: ", user);
			return res.json({ user: user });
		});
	})(req, res, next);
});

router.delete("/logout", authorizeUser, (req, res) => {
	try {
		req.logOut();
		res.status(200).json({ message: "logged out" });
	} catch (e) {
		res.status(400).json({ message: e });
	}
});

router.get("/session", async (req, res) => {
	console.log("Session", req.user);
	if (req.isAuthenticated()) {
		return res.json({ user: req.user.id });
	}
	return res.json({ user: null });
});

router.get("/authenticated", async (req, res, next) => {
	if (req.isAuthenticated()) {
		return res.json({ session: req.session, user: req.user });
	} else {
		return res.status(401).json({ message: "Unauthenticated" });
	}
});

export default router;
