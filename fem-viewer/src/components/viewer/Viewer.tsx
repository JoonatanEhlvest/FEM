import { useEffect, useRef, useState } from "react";
import useFEM from "../../state/useFEM";
import Model from "../model/Model";
import RenderSVG from "../svgrenderer/svgrenderer";
import Header from "./Header";
import styles from "./viewer.module.css";

const Viewer = () => {
	const { getCurrentModel, getCurrentSvgElement, getZoom } = useFEM();
	const viewerContainerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState<DOMRectReadOnly | null>(null);

	const [showHitboxes, setShowHitboxes] = useState(false);

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

	const toggleHitboxes = () => setShowHitboxes(!showHitboxes);

	return (
		<div className={styles["viewer-container-wrapper"]}>
			<Header model={model} toggleHitboxes={toggleHitboxes} />
			<div
				className={styles["viewer-container"]}
				ref={viewerContainerRef}
			>
				{svg && (
					<RenderSVG
						image={getCurrentSvgElement()}
						zoom={getZoom()}
					/>
				)}
				{model && (
					<Model
						model={model}
						parentDimensions={dimensions}
						showHitboxes={showHitboxes}
					/>
				)}
			</div>
		</div>
	);
};

export default Viewer;
