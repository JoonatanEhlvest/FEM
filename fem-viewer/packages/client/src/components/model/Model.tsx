import React, { CSSProperties, FC, useEffect } from "react";
import { Instance } from "@fem-viewer/types";
import { Model as ModelType } from "@fem-viewer/types";
import Asset from "../hitboxes/asset/Asset";
import Pool from "../hitboxes/pool/Pool";
import Process from "../hitboxes/process/Process";
import styles from "./model.module.css";
import useFEM from "../../state/useFEM";
import { getStyle, getTransform } from "../../parser/preprocessing";
import Note from "../hitboxes/note/Note";
import FEMState from "../../state/FEMState";

type Props = {
	model: ModelType;
	parentDimensions: DOMRectReadOnly | null;
};

// FIXME: Rendering for referenced instances
const renderInstanceType = (
	instance: Instance,
	model: ModelType,
	zoom: FEMState["zoom"],
	isCurrentInstance: boolean,
	allOccurrencesHighlightedInstances: FEMState["allOccurrencesHighlightedInstances"]
) => {
	const sharedStyles: CSSProperties = getStyle(
		instance,
		model,
		zoom,
		isCurrentInstance,
		allOccurrencesHighlightedInstances
	);

	switch (instance.class) {
		case "Pool":
			return <Pool instance={instance} sharedStyles={sharedStyles} />;
		case "Process_Subclass":
		case "Process":
			return <Process instance={instance} sharedStyles={sharedStyles} />;
		case "Asset_Subclass":
		case "Asset":
			return <Asset instance={instance} sharedStyles={sharedStyles} />;
		case "Note":
			return <Note instance={instance} sharedStyles={sharedStyles} />;
		default:
			return <div style={sharedStyles}></div>;
	}
};

/**
 * This handles positioning of elements in the viewer.
 * renderInstanceType handles rendering of correct component based on instance class
 * Instance classes (Process, Asset, Pool etc.) are responsible for actually visualizing an instance.
 */
const Model: FC<Props> = ({ model, parentDimensions }) => {
	const {
		setCurrentInstance,
		getZoom,
		getCurrentInstance,
		setReferenceBackNavigation,
		clearAllOccurrencesHighlighting,
		state,
	} = useFEM();

	const isCurrentInstance = (instance: FEMState["currentInstance"]) => {
		return instance?.id === getCurrentInstance()?.id;
	};

	const handleClick = (i: Instance, model: ModelType) => {
		setCurrentInstance(i);
		clearAllOccurrencesHighlighting();

		if (model && i) {
			setReferenceBackNavigation({
				modelToGoTo: model,
				instanceToGoTo: i,
			});
		}
	};

	return (
		<div key={model.id} className={styles["model-container"]}>
			{model.instances.map((i) => (
				<div
					key={i.id}
					className={styles["instance"]}
					onClick={() => handleClick(i, model)}
				>
					{renderInstanceType(
						i,
						model,
						getZoom(),
						isCurrentInstance(i),
						state.allOccurrencesHighlightedInstances
					)}
				</div>
			))}
		</div>
	);
};

export default Model;
