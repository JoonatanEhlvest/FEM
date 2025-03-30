import { Model } from "@fem-viewer/types";
import BaseInstanceUpdateService from "./baseInstanceUpdateService";
import ApplicationError from "../../../../../error/ApplicationError";
import { XMLEditor, EditResult } from "@fem-viewer/parser/src/editor";

class UpdateInstanceDescriptionService extends BaseInstanceUpdateService {
	/**
	 * Validate that the required description parameter is present
	 */
	protected validateParams(): void {
		const { description } = this.req.body;

		if (!description && description !== "") {
			throw new ApplicationError("Description is required", 400);
		}
	}

	/**
	 * Update the instance description
	 */
	protected async performUpdate(
		modelGroupId: string,
		instanceId: string,
		editor: XMLEditor
	): Promise<EditResult> {
		const { description } = this.req.body;

		const result = editor.updateInstanceDescription(
			instanceId,
			description
		);

		if (!result.success) {
			throw new ApplicationError(
				result.error || "Failed to update instance description",
				400
			);
		}

		return result;
	}

	/**
	 * Disable debug mode for description updates to reduce noise
	 */
	protected isDebugEnabled(): boolean {
		return false;
	}
}

export default UpdateInstanceDescriptionService;
