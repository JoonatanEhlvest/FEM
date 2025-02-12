import express from "express";
import path from "path";
import dotenv from "dotenv";
import startup from "./src/startup";
import { CLIENT_PATH, PROJECT_ROOT } from "./applicationPaths";
import uploadRouter from "./src/api/v1/routers/uploadRouter";
import userRouter from "./src/api/v1/routers/userRouter";
import authRouter from "./src/api/v1/routers/auth";
import modelGroupRouter from "./src/api/v1/routers/modelGroupRouter";
import session from "express-session";
import sessionStore from "./src/sessionStorage";
import passport from "passport";
import setupPassport from "./src/passportSetup";

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'test') {
	dotenv.config({ path: '.env.test' });
} else {
	dotenv.config();
}

const PRODUCTION = process.env.NODE_ENV === "production";
startup();

const app = express();

app.use(express.static(path.join(CLIENT_PATH, "build")));
app.use(express.static(path.join(CLIENT_PATH, "public")));

app.use((_, res, next) => {
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Credentials, Settsc-Cookie"
	);
	res.header("Access-Control-Allow-Credentials", "true");
	res.header(
		"Access-Control-Allow-Headers",
		"Content-Type, Accept, Access-Control-Allow-Credentials, Cross-Origin"
	);
	res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
	next();
});

app.use(express.json());

app.use(
	session({
		name: process.env.SESSION_NAME,
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		secret: process.env.SESSION_SECRET || "secret",
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
			sameSite: true,
			secure: PRODUCTION,
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());
setupPassport(passport);

app.use("/api/v1", uploadRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", modelGroupRouter);

app.use((req, res, next) => {
	res.sendFile(path.join(CLIENT_PATH, "build", "index.html"));
});

// Move server creation to separate function for testing
const server = app.listen(process.env.PORT || 5000, () => {
	if (process.env.NODE_ENV !== 'test') {
		console.log(`Server started on ${process.env.PORT || 5000}`);
	}
});

// Export for testing
export { app, server };
