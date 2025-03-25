import { Iref } from "@fem-viewer/types/Instance";
import BaseInstanceUpdateService from "./baseInstanceUpdateService";
import ApplicationError from "../../../../../error/ApplicationError";
import { XMLEditor, EditResult } from "@fem-viewer/parser/src/editor";
import createParser from "@fem-viewer/parser";
import { getSubclassTypeFromInstanceClass } from "@fem-viewer/types/InstanceClass";

type UpdateOperation = {
	operation: () => EditResult;
	description: string;
};

class UpdateInstanceSubclassService extends BaseInstanceUpdateService {
	/**
	 * Validate that required subclassInstanceId parameter is present
	 */
	protected validateParams(): void {
		const { subclassInstanceId } = this.req.body;

		if (!subclassInstanceId) {
			throw new ApplicationError("Subclass instance ID is required", 400);
		}
	}

	/**
	 * Process a series of update operations where all must succeed
	 * @param operations Array of update operations to process
	 * @returns The result of the last operation
	 */
	private processUpdateOperations(operations: UpdateOperation[]): EditResult {
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
	 * Update the instance subclass and related attributes
	 */
	protected async performUpdate(
		modelXML: string,
		instanceId: string,
		editor: XMLEditor
	): Promise<EditResult> {
		const { subclassInstanceId } = this.req.body;

		// Get instance details
		const instance = editor.findInstanceById(instanceId);
		if (!instance) {
			throw new ApplicationError("Instance not found", 404);
		}

		// Determine the appropriate subclass type for the instance
		const expectedSubclassType = getSubclassTypeFromInstanceClass(
			instance.class
		);

		// Parse the model XML to find the subclass instance and model by ID
		const parser = createParser(modelXML);
		const models = parser.parseModels();

		let exactSubclassInstance = null;
		let subclassModel = null;

		for (const model of models) {
			const instance = model.instances.find(
				(inst) => inst.id === subclassInstanceId
			);
			if (instance) {
				exactSubclassInstance = instance;
				subclassModel = model;
				break;
			}
		}

		if (!exactSubclassInstance) {
			throw new ApplicationError("Subclass instance not found", 404);
		}

		// Validate that the subclass instance is of the correct type
		if (exactSubclassInstance.class !== expectedSubclassType) {
			throw new ApplicationError(
				`Invalid subclass type. Expected ${expectedSubclassType} but got ${exactSubclassInstance.class}`,
				400
			);
		}

		// Extract all the needed information
		const tmodelname = subclassModel.name;
		const tmodeltype = subclassModel.modeltype;
		const tmodelver = subclassModel.version;
		const tclassname = exactSubclassInstance.class;
		const tobjname = exactSubclassInstance.name;

		// Create the Iref object with directly extracted values
		const iref: Iref = {
			type: "objectreference",
			tmodeltype: tmodeltype,
			tmodelname: tmodelname,
			tmodelver: tmodelver,
			tclassname: tclassname,
			tobjname: tobjname,
		};

		// Extract colors from the subclass instance
		const referencedBGColor = exactSubclassInstance.individualBGColor;
		const referencedGhostBGColor =
			exactSubclassInstance.individualGhostBGColor;

		// Define a series of update operations to perform - all must succeed
		const updateOperations: UpdateOperation[] = [
			{
				operation: () =>
					editor.updateInstanceInterref(
						instanceId,
						"Referenced Subclass",
						iref
					),
				description: "Update subclass reference",
			},
			{
				operation: () =>
					editor.updateInstanceReferencedBGColor(
						instanceId,
						referencedBGColor
					),
				description: "Update referenced background color",
			},
			{
				operation: () =>
					editor.updateInstanceReferencedGhostBGColor(
						instanceId,
						referencedGhostBGColor
					),
				description: "Update referenced ghost background color",
			},
			{
				operation: () =>
					editor.updateInstanceColorPicker(instanceId, "Subclass"),
				description: "Set color picker to Subclass",
			},
		];

		// Only add the Referenced Subclass Name update for Process instances
		if (instance.class.includes("Process")) {
			updateOperations.push({
				operation: () =>
					editor.updateInstanceExpressionAttributeValue(
						instanceId,
						"Referenced Subclass Name",
						tobjname
					),
				description: "Update Referenced Subclass Name attribute",
			});
		}

		// Process all operations - all must succeed
		return this.processUpdateOperations(updateOperations);
	}

	/**
	 * Enable debug mode for subclass updates
	 */
	protected isDebugEnabled(): boolean {
		return true;
	}
}

export default UpdateInstanceSubclassService;
