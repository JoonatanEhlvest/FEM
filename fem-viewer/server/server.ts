import express, { Express } from "express";
import { Server } from 'http';
import path from "path";
import dotenv from "dotenv";
import startup from "./src/startup";
import { CLIENT_PATH } from "./applicationPaths";
import uploadRouter from "./src/api/v1/routers/uploadRouter";
import userRouter from "./src/api/v1/routers/userRouter";
import authRouter from "./src/api/v1/routers/auth";
import modelGroupRouter from "./src/api/v1/routers/modelGroupRouter";
import session from "express-session";
import sessionStore from "./src/sessionStorage";
import passport from "passport";
import setupPassport from "./src/passportSetup";

/**
 * Singleton class to store the server instance.
 * This is used to prevent the server from starting multiple times
 * and to allow the server to be accessed from other files (used in tests).
 */
class ServerInstance {
	private static instance: ServerInstance;
	private app: Express;
	private server: Server | null = null;

	private constructor() {
		// Load environment variables based on NODE_ENV
		if (process.env.NODE_ENV === 'test') {
			dotenv.config({ path: '.env.test' });
		} else {
			dotenv.config();
		}

		const PRODUCTION = process.env.NODE_ENV === "production";
		startup();
		
		this.app = express();
		
		// Setup middleware
		this.app.use(express.static(path.join(CLIENT_PATH, "build")));
		this.app.use(express.static(path.join(CLIENT_PATH, "public")));
		
		this.app.use((_, res, next) => {
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

		this.app.use(express.json());

		this.app.use(
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

		this.app.use(passport.initialize());
		this.app.use(passport.session());
		setupPassport(passport);

		// Setup routes
		this.app.use("/api/v1", uploadRouter);
		this.app.use("/api/v1", authRouter);
		this.app.use("/api/v1", userRouter);
		this.app.use("/api/v1", modelGroupRouter);

		this.app.use((req, res, next) => {
			res.sendFile(path.join(CLIENT_PATH, "build", "index.html"));
		});
	}

	public static getInstance(): ServerInstance {
		if (!ServerInstance.instance) {
			ServerInstance.instance = new ServerInstance();
		}
		return ServerInstance.instance;
	}

	public getApp(): Express {
		return this.app;
	}

	public start(port: number = Number(process.env.PORT) || 5000): Server {
		if (!this.server) {
			this.server = this.app.listen(port, (error) => {
				if (error) {
					throw error; // e.g. EADDRINUSE
				}
				console.log(`Server started on ${port}`);
			});
		}
		else {
			console.log(`Server already running on ${port}`);
		}
		return this.server;
	}

	public getServer(): Server | null {
		return this.server;
	}
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
	ServerInstance.getInstance().start();
}

export default ServerInstance;
