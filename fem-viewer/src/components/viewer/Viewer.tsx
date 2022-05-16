import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Navigate } from "react-router-dom";
import Popup from "reactjs-popup";
import useFEM from "../../state/useFEM";
import Model from "../model/Model";
import RenderSVG from "../svgrenderer/svgrenderer";
import DetailsPopup from "./DetailsPopup";
import Header from "./Header";
import styles from "./viewer.module.css";

const Viewer = () => {
	const {
		getCurrentModel,
		getCurrentSvgElement,
		getZoom,
		getCurrentInstance,
	} = useFEM();
	const viewerContainerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState<DOMRectReadOnly | null>(null);

	const observer = useRef(
		new ResizeObserver((entries) => {
			setDimensions(entries[0].contentRect);
		})
	);

	useEffect(() => {
		if (viewerContainerRef.current) {
			observer.current.observe(viewerContainerRef.current);
		}
		const curr = observer.current;

		return () => {
			if (viewerContainerRef.current)
				curr.unobserve(viewerContainerRef.current);
		};
	}, [viewerContainerRef, observer]);

	const model = getCurrentModel();
	const svg = getCurrentSvgElement();

	return (
		<div className={styles["viewer-container-wrapper"]}>
			<Header model={model} />
			<div
				className={styles["viewer-container"]}
				ref={viewerContainerRef}
			>
				{svg ? (
					<RenderSVG
						image={getCurrentSvgElement()}
						zoom={getZoom()}
					/>
				) : (
					<div> No svg provided for model</div>
				)}
				{model && svg && (
					<Model model={model} parentDimensions={dimensions} />
				)}
				<div id="popup-root" />
			</div>
		</div>
	);
};

export default Viewer;
