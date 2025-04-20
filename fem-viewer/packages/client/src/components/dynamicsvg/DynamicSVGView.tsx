/* Dynamic SVG viewer for model data */

import React, { useEffect, useRef, useState } from "react";
import useFEM from "../../state/useFEM";
import styles from "./dynamicsvg.module.css";
import InstanceRenderer from "./renderers/InstanceRenderer";
import { CM_TO_PX } from "./types/constants";
import ConnectorRenderer from "./renderers/ConnectorRenderer";
import { useSVGZoom } from "./hooks/useSVGZoom";
import SVGViewHeader from "./header/SVGViewHeader";

// Interface for combined elements with their indices for proper layering
interface LayerElement {
	type: "instance" | "connector";
	index: number;
	element: React.ReactElement;
}

const DynamicSVGView: React.FC = () => {
	const {
		getCurrentModel,
		getZoom,
		setZoom,
		getCurrentInstance,
		setCurrentInstance,
		state,
		clearAllOccurrencesHighlighting,
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
			clearAllOccurrencesHighlighting();
			setCurrentInstance(instance);
		}
	};

	// Render layered elements based on indices
	const renderLayeredElements = () => {
		if (!model) return null;

		// Array to hold all renderable elements with their z-index (position.index)
		const layerElements: LayerElement[] = [];

		// Add instances to the layer elements array
		model.instances.forEach((instance) => {
			const index = instance.position?.index || 0;
			layerElements.push({
				type: "instance",
				index,
				element: (
					<InstanceRenderer
						key={instance.id}
						instance={instance}
						model={model}
						onClick={() => handleInstanceClick(instance.id)}
						isSelected={getCurrentInstance()?.id === instance.id}
						zoom={zoom}
						allOccurrencesHighlightedInstances={
							state.allOccurrencesHighlightedInstances
						}
					/>
				),
			});
		});

		// Add connectors to the layer elements array
		if (model.connectors) {
			model.connectors.forEach((connector) => {
				const fromInstance = model.instances.find(
					(i) => i.name === connector.fromName
				);
				const toInstance = model.instances.find(
					(i) => i.name === connector.toName
				);

				if (!fromInstance || !toInstance) {
					// Log missing instances in development
					if (process.env.NODE_ENV === "development") {
						console.warn(
							`Connector ${connector.id} has missing instances:`,
							{
								fromName: connector.fromName,
								toName: connector.toName,
							}
						);
					}
					return;
				}

				// Use connector's positions.index as z-index, defaulting to 0 if missing
				const connectorIndex =
					connector.positions?.index !== undefined
						? connector.positions.index
						: 0;

				layerElements.push({
					type: "connector",
					index: connectorIndex,
					element: (
						<ConnectorRenderer
							key={connector.id}
							connector={connector}
							fromInstance={fromInstance}
							toInstance={toInstance}
							zoom={zoom}
						/>
					),
				});
			});
		}

		// Sort all elements by their index for proper layering
		// Elements with lower indices will be rendered first (behind)
		layerElements.sort((a, b) => a.index - b.index);

		// Return the sorted elements
		return layerElements.map((item) => item.element);
	};

	if (!model) {
		return (
			<div className={styles["dynamicsvg-container"]}>
				<SVGViewHeader
					model={undefined}
					zoom={zoom}
					onZoomIn={zoomIn}
					onZoomOut={zoomOut}
					onResetZoom={resetZoom}
				/>
				<div className={styles["svg-container"]} ref={containerRef}>
					<div className={styles["no-model"]}>No model selected</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles["dynamicsvg-container"]}>
			<SVGViewHeader
				model={model}
				zoom={zoom}
				onZoomIn={zoomIn}
				onZoomOut={zoomOut}
				onResetZoom={resetZoom}
			/>
			<div className={styles["svg-container"]} ref={containerRef}>
				<svg
					ref={svgRef}
					className={styles["svg-element"]}
					viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMid meet"
				>
					{/* Define filters */}
					<defs>
						{/* Yellow glow filter for highlighted instances (all occurrences of referenced instance) */}
						<filter
							id="yellow-glow"
							x="-50%"
							y="-50%"
							width="200%"
							height="200%"
						>
							<feGaussianBlur stdDeviation="8" result="blur" />
							<feFlood
								floodColor="#FFDF00"
								floodOpacity="0.9"
								result="glow-color"
							/>
							<feComposite
								in="glow-color"
								in2="blur"
								operator="in"
								result="glow"
							/>
							<feMerge>
								<feMergeNode in="glow" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>

						{/* Blue glow filter for selected instances */}
						<filter
							id="blue-glow"
							x="-50%"
							y="-50%"
							width="200%"
							height="200%"
						>
							<feGaussianBlur stdDeviation="8" result="blur" />
							<feFlood
								floodColor="#2196f3"
								floodOpacity="0.9"
								result="glow-color"
							/>
							<feComposite
								in="glow-color"
								in2="blur"
								operator="in"
								result="glow"
							/>
							<feMerge>
								<feMergeNode in="glow" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>
					<g>
						{/* Render all elements sorted by their indices */}
						{renderLayeredElements()}
					</g>
				</svg>
			</div>
		</div>
	);
};

export default DynamicSVGView;
