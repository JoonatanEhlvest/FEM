import { Model } from "@fem-viewer/types";
import BaseService from "../../baseService";
import UnauthorizedError from "../../../../../error/UnauthorizedError";
import ApplicationError from "../../../../../error/ApplicationError";
import fs from "fs/promises";
import path from "path";
import createParser, { createXMLEditor, XMLEditor } from "@fem-viewer/parser";
import { EditResult } from "@fem-viewer/parser/src/editor";
import { UPLOAD_DIR } from "../../../../../../applicationPaths";

/**
 * Represents an operation to be performed on an instance
 */
export type UpdateOperation = {
	operation: () => EditResult;
	description: string;
};

/**
 * Base class for instance update services that handles common operations
 * like loading the model group, checking authorization, file I/O, and XML update process.
 */
abstract class BaseInstanceUpdateService extends BaseService {
	/**
	 * Execute the update service
	 */
	async execute(): Promise<any> {
		const { modelGroupId, instanceId } = this.req.params;

		// Validate service-specific parameters
		this.validateParams();

		const modelGroup = await this.db.modelGroup.findUnique({
			where: {
				id: modelGroupId,
			},
			include: {
				files: {
					select: {
						name: true,
					},
				},
			},
		});

		if (!modelGroup) {
			throw new ApplicationError("Model group not found", 404);
		}

		// Check if user has access to this model group
		const userModelGroup = await this.db.modelGroupsOnUsers.findFirst({
			where: {
				modelGroupId,
				userId: this.req.user.id,
			},
		});

		if (!userModelGroup) {
			throw new UnauthorizedError(
				"User does not have access to this model group"
			);
		}

		// Read the xml file
		const xmlFile = modelGroup.files.find((file) =>
			file.name.endsWith(".xml")
		);
		if (!xmlFile) {
			throw new ApplicationError("XML file not found", 404);
		}

		const xmlFilePath = path.join(
			UPLOAD_DIR,
			modelGroup.name,
			xmlFile.name
		);

		// Read the XML data directly from the file to ensure no caching
		const xmlData = await fs.readFile(xmlFilePath, "utf-8");

		// Create the editor
		const editor = createXMLEditor(xmlData, {
			preserveDoctype: true,
			debug: this.isDebugEnabled(),
		});

		// Call the service-specific implementation to perform the update
		const result = await this.performUpdate(xmlData, instanceId, editor);

		if (!result.success) {
			throw new ApplicationError(
				result.error || "Failed to update instance description",
				400
			);
		}

		// Write the updated XML back to the file
		await fs.writeFile(xmlFilePath, result.xml);

		// Parse the updated XML to get the models for the response
		const updatedParser = createParser(result.xml);
		const updatedModels = updatedParser.parseModels();

		const response: {
			models: Model[];
		} = { models: updatedModels };

		return response;
	}

	/**
	 * Process a series of update operations where all must succeed
	 * @param operations Array of update operations to process
	 * @returns The result of the last operation
	 */
	protected processUpdateOperations(
		operations: UpdateOperation[]
	): EditResult {
		if (!operations.length) {
			throw new ApplicationError("No operations to execute", 400);
		}

		let result: EditResult;

		// Execute each operation - all must succeed
		for (const op of operations) {
			// Execute the operation
			result = op.operation();

			// Check for success
			if (!result.success) {
				throw new ApplicationError(
					result.error || `Failed during ${op.description}`,
					400
				);
			}
		}

		return result;
	}

	/**
	 * Validate service-specific parameters
	 * @throws ApplicationError if validation fails
	 */
	protected abstract validateParams(): void;

	/**
	 * Perform the specific XML update operation
	 * @param modelXML The raw XML string of the model
	 * @param instanceId The ID of the instance to update
	 * @param editor The XML editor instance
	 * @returns The result of the update operation
	 */
	protected abstract performUpdate(
		modelXML: string,
		instanceId: string,
		editor: XMLEditor
	): Promise<EditResult>;

	/**
	 * Determine if debug mode is enabled
	 * @returns Whether debug mode is enabled
	 */
	protected isDebugEnabled(): boolean {
		return false;
	}
}

export default BaseInstanceUpdateService;
