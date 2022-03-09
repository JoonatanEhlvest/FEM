import { ReactElement, useEffect, useRef, useState } from "react";
import useFEM from "../../state/useFEM";
import Model from "../model/Model";
import renderSVG, { svgXML } from "../svgrenderer/svgrenderer";
import Header from "./Header";
import styles from "./viewer.module.css";

const Viewer = () => {
	const { getCurrentModel, getModelSvg, getCurrentSvgElement } = useFEM();
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
		<div style={{ width: "100%", height: "100%" }}>
			<Header model={model} />
			<div
				className={styles["viewer-container"]}
				ref={viewerContainerRef}
			>
				{svg && getCurrentSvgElement()}
				{model && <Model model={model} parentDimensions={dimensions} />}
			</div>
		</div>
	);
};

export default Viewer;
