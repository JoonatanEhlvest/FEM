import { Instance, Model } from "@fem-viewer/types";
import { getBaseInstanceClass } from "@fem-viewer/types/InstanceClass";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { ProcessRenderer } from "../instances/ProcessRenderer";
import { AssetRenderer } from "../instances/AssetRenderer";
import { PoolRenderer } from "../instances/PoolRenderer";
import { ExternalActorRenderer } from "../instances/ExternalActorRenderer";
import { NoteRenderer } from "../instances/NoteRenderer";

export class InstanceRendererFactory {
	static createRenderer(props: InstanceRendererProps) {
		const baseClass = getBaseInstanceClass(props.instance.class);

		switch (baseClass) {
			case "Process":
				return new ProcessRenderer(props);
			case "Asset":
				return new AssetRenderer(props);
			case "Pool":
				return new PoolRenderer(props);
			case "External Actor":
				return new ExternalActorRenderer(props);
			case "Note":
				return new NoteRenderer(props);
			default:
				// Default to Asset renderer for unknown types
				return new AssetRenderer(props);
		}
	}
}
