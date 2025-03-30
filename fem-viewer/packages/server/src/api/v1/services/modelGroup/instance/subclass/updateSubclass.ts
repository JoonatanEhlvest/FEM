import { Instance, Iref, ColorPicker } from "@fem-viewer/types/Instance";
import BaseSubclassUpdateService, {
	SubclassUpdateConfig,
} from "./baseSubclassUpdateService";
import { XMLEditor } from "@fem-viewer/parser/src/editor";
import { getSubclassTypeFromBaseInstanceClass } from "@fem-viewer/types/InstanceClass";

class UpdateInstanceSubclassService extends BaseSubclassUpdateService {
	/**
	 * Define valid color picker modes for instance subclass
	 */
	protected getValidColorPickerModes(): string[] {
		return ["Default", "Individual", "Subclass"];
	}

	protected config: SubclassUpdateConfig = {
		parameterName: "subclassInstanceId",
		errorMessage:
			"Subclass instance ID parameter is required when colorPickerMode is 'Subclass'",
		getExpectedSubclassType: getSubclassTypeFromBaseInstanceClass,
		createUpdateOperations: (
			editor: XMLEditor,
			instanceId: string,
			iref: Iref | null,
			subclassInstance: Instance | null,
			instance: Instance,
			colorPickerMode: ColorPicker
		) => {
			// Handle non-Subclass modes
			if (colorPickerMode !== "Subclass") {
				const operations = [
					{
						operation: () =>
							editor.updateInstanceSubclass(instanceId, null),
						description: "Remove subclass reference",
					},
					{
						operation: () =>
							editor.updateInstanceReferencedBGColor(
								instanceId,
								""
							),
						description: "Clear referenced background color",
					},
					{
						operation: () =>
							editor.updateInstanceReferencedGhostBGColor(
								instanceId,
								""
							),
						description: "Clear referenced ghost background color",
					},
					{
						operation: () =>
							editor.updateInstanceColorPicker(
								instanceId,
								colorPickerMode
							),
						description: `Set color picker to ${colorPickerMode}`,
					},
				];

				// If it's a Process instance, also clear the Referenced Subclass Name
				if (instance.class.includes("Process")) {
					operations.push({
						operation: () =>
							editor.updateInstanceReferencedSubclassName(
								instanceId,
								""
							),
						description: "Clear Referenced Subclass Name attribute",
					});
				}

				return operations;
			}

			// For Subclass mode, set the reference to the provided subclass
			const updateOperations = [
				{
					operation: () =>
						editor.updateInstanceSubclass(instanceId, iref),
					description: "Update subclass reference",
				},
				{
					operation: () =>
						editor.updateInstanceReferencedBGColor(
							instanceId,
							subclassInstance.individualBGColor
						),
					description: "Update referenced background color",
				},
				{
					operation: () =>
						editor.updateInstanceReferencedGhostBGColor(
							instanceId,
							subclassInstance.individualGhostBGColor
						),
					description: "Update referenced ghost background color",
				},
				{
					operation: () =>
						editor.updateInstanceColorPicker(
							instanceId,
							"Subclass"
						),
					description: "Set color picker to Subclass",
				},
			];

			// Only add the Referenced Subclass Name update for Process instances
			if (instance.class.includes("Process")) {
				updateOperations.push({
					operation: () =>
						editor.updateInstanceReferencedSubclassName(
							instanceId,
							subclassInstance.name
						),
					description: "Update Referenced Subclass Name attribute",
				});
			}

			return updateOperations;
		},
	};

	protected isDebugEnabled(): boolean {
		return false;
	}
}

export default UpdateInstanceSubclassService;
