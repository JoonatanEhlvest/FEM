import { Request, Router } from "express";
import db from "../../../db";
import passport from "passport";
import { hashPassword } from "../../../passportSetup";
import { Prisma, UserRole } from "@prisma/client";
import { checkAuth, authorize } from "./shared";

const router = Router();

router.post(
	"/register",
	[checkAuth, authorize(["ADMIN", "DEVELOPER"])],
	async (req: Request, res, next) => {
		const userRole = req.user.role;
		try {
			const { username, password, role } = req.body;

			if (userRole === "DEVELOPER" && (role as UserRole) !== "VIEWER") {
				return res.status(422).json({
					message:
						"Developer accounts can only create Viewer accounts",
				});
			}

			if (!username || !password) {
				return res.status(422).json({
					message: "username or password not provided in body",
				});
			}

			if (username.length < 6) {
				return res
					.status(422)
					.json({ message: "Username must be atleast 6 characters" });
			}

			if (password.length < 6) {
				return res
					.status(422)
					.json({ message: "Password must be atleast 6 characters" });
			}

			hashPassword(password, async (hash) => {
				db.user
					.create({
						data: {
							username: username,
							password: hash,
							role,
							createdBy: {
								connect: {
									id: req.user.id,
								},
							},
						},
					})
					.then((user) => {
						console.log("User created: ", user);
						return res
							.status(200)
							.json({ username: user.username });
					})
					.catch((err) => {
						console.log(err);
						if (
							err instanceof Prisma.PrismaClientKnownRequestError
						) {
							if (err.code === "P2002") {
								return res.status(422).json({
									message: "Username already taken",
								});
							}
						}
						return res.status(500).json({ message: err });
					});
			});
		} catch (err) {
			return res.status(500).json({ message: "Unable to register user" });
		}
	}
);

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

router.delete("/logout", checkAuth, (req, res) => {
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
		return res.json({ user: req.user });
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
