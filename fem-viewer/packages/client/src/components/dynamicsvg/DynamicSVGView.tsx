/* Dynamic SVG viewer for model data */

import React, { useEffect, useRef, useState } from "react";
import useFEM from "../../state/useFEM";
import styles from "./dynamicsvg.module.css";
import Header from "../header/Header";
import InstanceRenderer from "./renderers/InstanceRenderer";
import { CM_TO_PX } from "./types/constants";
import ConnectorRenderer from "./renderers/connectors/ConnectorRenderer";
import { useSVGZoom } from "./hooks/useSVGZoom";

const DynamicSVGView: React.FC = () => {
	const {
		getCurrentModel,
		getZoom,
		setZoom,
		getCurrentInstance,
		setCurrentInstance,
	} = useFEM();

	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Get the current model and zoom level
	const model = getCurrentModel();
	const zoom = getZoom();

	// State for SVG dimensions
	const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

	// Initialize zoom behavior
	const { resetZoom, zoomIn, zoomOut } = useSVGZoom(svgRef, setZoom);

	// Calculate dimensions from model's worldArea if available
	useEffect(() => {
		if (
			model?.attributes.worldArea &&
			dimensions.width === 1000 &&
			dimensions.height === 800
		) {
			const { width, height } = model.attributes.worldArea;
			setDimensions({
				width: width * CM_TO_PX,
				height: height * CM_TO_PX,
			});
		}
	}, [model]);

	// Set up resize observer
	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver(() => {
			// Update container size if needed in future
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	// Handle instance click
	const handleInstanceClick = (instanceId: string) => {
		if (!model) return;
		const instance = model.instances.find((i) => i.id === instanceId);
		if (instance) {
			setCurrentInstance(instance);
		}
	};

	if (!model) {
		return (
			<div className={styles["dynamicsvg-container"]}>
				<div className={styles["no-model"]}>No model selected</div>
			</div>
		);
	}

	return (
		<div className={styles["dynamicsvg-container"]}>
			<Header>
				<div className={styles["header-content"]}>
					<div>Dynamic SVG Viewer - {model.name}</div>
				</div>
			</Header>
			<div className={styles["svg-container"]} ref={containerRef}>
				<svg
					ref={svgRef}
					className={styles["svg-element"]}
					viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMid meet"
				>
					<g>
						{/* Render instances */}
						{model.instances.map((instance) => (
							<InstanceRenderer
								key={instance.id}
								instance={instance}
								model={model}
								onClick={() => handleInstanceClick(instance.id)}
								isSelected={
									getCurrentInstance()?.id === instance.id
								}
								zoom={zoom}
							/>
						))}

						{/* Render connectors */}
						{model.connectors &&
							model.connectors.map((connector) => {
								// TODO: Rename to fromId and toId to fromName and toName
								const fromInstance = model.instances.find(
									(i) => i.name === connector.fromId
								);
								const toInstance = model.instances.find(
									(i) => i.name === connector.toId
								);

								if (!fromInstance || !toInstance) {
									// Log missing instances in development
									if (
										process.env.NODE_ENV === "development"
									) {
										console.warn(
											`Connector ${connector.id} has missing instances:`,
											{
												fromId: connector.fromId,
												toId: connector.toId,
											}
										);
									}
									return null;
								}

								return (
									<ConnectorRenderer
										key={connector.id}
										connector={connector}
										fromInstance={fromInstance}
										toInstance={toInstance}
										zoom={zoom}
									/>
								);
							})}
					</g>
				</svg>

				{/* Zoom controls */}
				<div className={styles["zoom-controls"]}>
					<button className={styles["zoom-button"]} onClick={zoomOut}>
						-
					</button>
					<button
						className={styles["zoom-button"]}
						onClick={resetZoom}
					>
						Reset
					</button>
					<button className={styles["zoom-button"]} onClick={zoomIn}>
						+
					</button>

					<div className={styles["zoom-level"]}>
						{Math.round(zoom * 100)}%
					</div>
				</div>
			</div>
		</div>
	);
};

export default DynamicSVGView;
