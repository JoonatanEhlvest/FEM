import { CSSProperties } from "react";
import Instance from "../../state/types/Instance";

interface SharedInstanceProps {
	instance: Instance;
	sharedStyles: CSSProperties;
}

export default SharedInstanceProps;
