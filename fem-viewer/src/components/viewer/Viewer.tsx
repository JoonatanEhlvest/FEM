import { useEffect, useRef, useState } from "react";
import useFEM from "../../state/useFEM";
import Model from "../model/Model";
import styles from "./viewer.module.css";

const Viewer = () => {
	const { getCurrentModel } = useFEM();
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

	return (
		<div className={styles["viewer-container"]} ref={viewerContainerRef}>
			Current Model:{" "}
			{model && <Model model={model} parentDimensions={dimensions} />}
		</div>
	);
};

export default Viewer;
