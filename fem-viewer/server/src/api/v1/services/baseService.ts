import { PrismaClient } from "@prisma/client";
import { Request } from "express";

export default class BaseService {
	req: Request;
	db: PrismaClient;

	constructor(req: Request, db: PrismaClient) {
		this.req = req;
		this.db = db;
	}

	execute() {
		throw new Error("execute method unimplemented for Service");
	}
}
