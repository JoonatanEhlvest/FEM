import { Instance, Iref } from "@fem-viewer/types/Instance";
import BaseSubclassUpdateService, {
	SubclassUpdateConfig,
} from "./baseSubclassUpdateService";
import { XMLEditor, EditResult } from "@fem-viewer/parser/src/editor";
import { getSubclassTypeFromBaseInstanceClass } from "@fem-viewer/types/InstanceClass";

class UpdateInstanceSubclassService extends BaseSubclassUpdateService {
	protected config: SubclassUpdateConfig = {
		parameterName: "subclassInstanceId",
		errorMessage: "Subclass instance ID is required",
		getExpectedSubclassType: getSubclassTypeFromBaseInstanceClass,
		createUpdateOperations: (
			editor: XMLEditor,
			instanceId: string,
			iref: Iref,
			subclassInstance: Instance,
			instance: Instance
		) => {
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
						editor.updateInstanceExpressionAttributeValue(
							instanceId,
							"Referenced Subclass Name",
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
