import {
	Instance,
	Iref,
	ColorPicker,
	BorderColorPicker,
} from "@fem-viewer/types/Instance";
import BaseInstanceUpdateService, {
	UpdateOperation,
} from "../baseInstanceUpdateService";
import ApplicationError from "../../../../../../error/ApplicationError";
import { XMLEditor, EditResult } from "@fem-viewer/parser/src/editor";
import createParser from "@fem-viewer/parser";
import { Model } from "@fem-viewer/types/Model";
import {
	BaseInstanceClass,
	BorderSubclass,
	InstanceSubclass,
} from "@fem-viewer/types/InstanceClass";

export type SubclassUpdateConfig = {
	parameterName: string;
	errorMessage: string;
	getExpectedSubclassType: (
		baseInstanceClass: BaseInstanceClass
	) => InstanceSubclass | BorderSubclass;
	createUpdateOperations: (
		editor: XMLEditor,
		instanceId: string,
		iref: Iref | null,
		subclassInstance: Instance | null,
		instance: Instance,
		colorPickerMode: ColorPicker | BorderColorPicker
	) => UpdateOperation[];
};

abstract class BaseSubclassUpdateService extends BaseInstanceUpdateService {
	protected abstract config: SubclassUpdateConfig;

	/**
	 * Validate the request parameters
	 */
	protected validateParams(): void {
		const { colorPickerMode } = this.req.body;
		this.validateColorPickerMode(colorPickerMode);

		// Only require subclass ID when in Subclass mode
		if (colorPickerMode === "Subclass") {
			const subclassId = this.req.body[this.config.parameterName];
			if (!subclassId) {
				throw new ApplicationError(this.config.errorMessage, 400);
			}
		}
	}

	/**
	 * Get the valid color picker modes for this service
	 * This should be overridden by child classes
	 */
	protected abstract getValidColorPickerModes(): string[];

	/**
	 * Get the error message for invalid color picker mode
	 */
	protected getInvalidColorPickerModeMessage(
		colorPickerMode: string
	): string {
		const validModes = this.getValidColorPickerModes().join(", ");
		return `Invalid colorPickerMode: ${colorPickerMode}. Must be one of: ${validModes}`;
	}

	/**
	 * Validate the color picker mode using the template method pattern
	 */
	protected validateColorPickerMode(
		colorPickerMode: ColorPicker | BorderColorPicker | string
	): void {
		// Check if provided
		if (!colorPickerMode) {
			throw new ApplicationError("colorPickerMode is required", 400);
		}

		// Check if valid
		const validModes = this.getValidColorPickerModes();
		if (!validModes.includes(colorPickerMode)) {
			throw new ApplicationError(
				this.getInvalidColorPickerModeMessage(colorPickerMode),
				400
			);
		}
	}

	protected async performUpdate(
		modelXML: string,
		instanceId: string,
		editor: XMLEditor
	): Promise<EditResult> {
		const { colorPickerMode } = this.req.body;
		const subclassInstanceId = this.req.body[this.config.parameterName];

		// Get instance details
		const instance = editor.findInstanceById(instanceId);
		if (!instance) {
			throw new ApplicationError("Instance not found", 404);
		}

		// Handle non-Subclass modes (Default or Individual)
		if (colorPickerMode !== "Subclass") {
			const updateOperations = this.config.createUpdateOperations(
				editor,
				instanceId,
				null,
				null,
				instance,
				colorPickerMode
			);

			return this.processUpdateOperations(updateOperations);
		}

		// For Subclass mode, we need to find the referenced subclass
		// Determine the appropriate subclass type for the instance
		const expectedSubclassType = this.config.getExpectedSubclassType(
			instance.class
		);

		// Parse the model XML to find the subclass instance and model by ID
		const parser = createParser(modelXML);
		const models = parser.parseModels();

		let exactSubclassInstance: Instance | null = null;
		let subclassModel: Model | null = null;

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
			throw new ApplicationError(
				`${this.config.parameterName} not found`,
				404
			);
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

		// Get the update operations from the config
		const updateOperations = this.config.createUpdateOperations(
			editor,
			instanceId,
			iref,
			exactSubclassInstance,
			instance,
			colorPickerMode
		);

		// Process all operations - all must succeed
		return this.processUpdateOperations(updateOperations);
	}
}

export default BaseSubclassUpdateService;
