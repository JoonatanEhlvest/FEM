import { Instance, Iref } from "@fem-viewer/types/Instance";
import BaseSubclassUpdateService, {
	SubclassUpdateConfig,
} from "./baseSubclassUpdateService";
import { XMLEditor, EditResult } from "@fem-viewer/parser/src/editor";
import { getBorderSubclassTypeFromBaseInstanceClass } from "@fem-viewer/types/InstanceClass";

class UpdateInstanceBSubclassService extends BaseSubclassUpdateService {
	protected config: SubclassUpdateConfig = {
		parameterName: "bsubclassInstanceId",
		errorMessage: "Border subclass instance ID is required",
		getExpectedSubclassType: getBorderSubclassTypeFromBaseInstanceClass,
		createUpdateOperations: (
			editor: XMLEditor,
			instanceId: string,
			iref: Iref,
			subclassInstance: Instance
		) => [
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
		],
	};

	protected isDebugEnabled(): boolean {
		return false;
	}
}

export default UpdateInstanceBSubclassService;
