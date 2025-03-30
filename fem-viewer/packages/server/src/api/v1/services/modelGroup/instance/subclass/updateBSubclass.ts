import { Instance, Iref, BorderColorPicker } from "@fem-viewer/types/Instance";
import BaseSubclassUpdateService, {
	SubclassUpdateConfig,
} from "./baseSubclassUpdateService";
import { XMLEditor } from "@fem-viewer/parser/src/editor";
import { getBorderSubclassTypeFromBaseInstanceClass } from "@fem-viewer/types/InstanceClass";

class UpdateInstanceBSubclassService extends BaseSubclassUpdateService {
	/**
	 * Define valid color picker modes for border subclass
	 */
	protected getValidColorPickerModes(): string[] {
		return ["Individual", "Subclass"];
	}

	protected config: SubclassUpdateConfig = {
		parameterName: "bsubclassInstanceId",
		errorMessage:
			"Border subclass instance ID parameter is required when colorPickerMode is 'Subclass'",
		getExpectedSubclassType: getBorderSubclassTypeFromBaseInstanceClass,
		createUpdateOperations: (
			editor: XMLEditor,
			instanceId: string,
			iref: Iref | null,
			subclassInstance: Instance | null,
			instance: Instance,
			colorPickerMode: BorderColorPicker
		) => {
			// Handle Individual mode
			if (colorPickerMode !== "Subclass") {
				return [
					{
						operation: () =>
							editor.updateInstanceBSubclass(instanceId, null),
						description: "Remove border subclass reference",
					},
					{
						operation: () =>
							editor.updateInstanceReferencedBColor(
								instanceId,
								""
							),
						description: "Clear referenced border color",
					},
					{
						operation: () =>
							editor.updateInstanceBorderColorPicker(
								instanceId,
								colorPickerMode
							),
						description: `Set border color picker to ${colorPickerMode}`,
					},
				];
			}

			// For Subclass mode
			return [
				{
					operation: () =>
						editor.updateInstanceBSubclass(instanceId, iref),
					description: "Update border subclass reference",
				},
				{
					operation: () =>
						editor.updateInstanceReferencedBColor(
							instanceId,
							subclassInstance.borderColor
						),
					description: "Update referenced border color",
				},
				{
					operation: () =>
						editor.updateInstanceBorderColorPicker(
							instanceId,
							"Subclass"
						),
					description: "Set border color picker to Subclass",
				},
			];
		},
	};

	protected isDebugEnabled(): boolean {
		return false;
	}
}

export default UpdateInstanceBSubclassService;
