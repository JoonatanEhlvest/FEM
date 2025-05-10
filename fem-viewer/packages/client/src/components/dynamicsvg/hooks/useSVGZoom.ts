import { useEffect, RefObject, useState, useRef, useCallback } from "react";
import * as d3 from "d3";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.1;
export const DEFAULT_ZOOM = 1;

// Animation duration constants in milliseconds
const ANIMATION_DURATIONS = {
	ZOOM: 300,
	PAN: 500,
};

/**
 * Custom hook for SVG zoom functionality
 *
 * @param svgRef - Reference to the SVG element
 * @param setZoom - Function to update zoom level in state
 * @returns Object with zoom behavior and zoom control functions
 */
export const useSVGZoom = (
	svgRef: RefObject<SVGSVGElement | null>,
	setZoom: (zoom: number) => void
) => {
	// Store the current transform state to avoid resetting it
	const [transform, setTransform] = useState<d3.ZoomTransform>(
		d3.zoomIdentity
	);

	// Store the zoom behavior to reuse it across renders
	const zoomBehaviorRef = useRef<d3.ZoomBehavior<
		SVGSVGElement,
		unknown
	> | null>(null);

	// Track if initial setup has been done to prevent re-initializing
	const initializedRef = useRef(false);

	// Handle zoom events
	const handleZoom = useCallback(
		(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
			// Store the current transform
			setTransform(event.transform);

			// Apply transform to the first group element in the SVG
			if (!svgRef.current) return;

			const svg = d3.select(svgRef.current);
			const g = svg.select("g"); // Select the first g element

			if (!g.empty()) {
				// Format the transform properly for SVG
				g.attr(
					"transform",
					`translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k})`
				);
			}

			// Update zoom level in state
			setZoom(event.transform.k);
		},
		[setZoom, svgRef]
	);

	// Create zoom behavior once on mount
	useEffect(() => {
		if (initializedRef.current) return;

		// Initialize zoom behavior
		zoomBehaviorRef.current = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([MIN_ZOOM, MAX_ZOOM]) // Use constants for min and max zoom scale
			.on("zoom", handleZoom);

		initializedRef.current = true;

		return () => {
			// No need to clean up here as we'll do it in the next effect
		};
	}, [handleZoom]);

	// Apply zoom behavior when svgRef changes
	useEffect(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);
		const currentBehavior = zoomBehaviorRef.current;

		// Apply zoom behavior to the SVG
		svg.call(currentBehavior).on("dblclick.zoom", null); // Disable double-click zoom for better UX

		// Apply initial zoom level only if we haven't already
		if (transform === d3.zoomIdentity) {
			svg.call(
				currentBehavior.transform,
				d3.zoomIdentity.translate(0, 0).scale(DEFAULT_ZOOM)
			);
		} else {
			// Use the stored transform but do NOT apply it here to avoid a loop
			// We'll only restore on explicit user action
		}

		return () => {
			// Cleanup zoom behavior
			svg.on(".zoom", null);
		};
	}, [svgRef.current]); // Only depend on svgRef.current

	// Function to zoom in
	const zoomIn = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);

		// Calculate new transform by scaling the current one
		const newScale = transform.k * 1.2;
		const newTransform = d3.zoomIdentity
			.translate(transform.x, transform.y)
			.scale(Math.min(newScale, MAX_ZOOM)); // Use MAX_ZOOM constant

		// Smoothly transition to the new transform
		svg.transition()
			.duration(ANIMATION_DURATIONS.ZOOM)
			.call(zoomBehaviorRef.current.transform, newTransform);
	}, [transform]);

	// Function to zoom out
	const zoomOut = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);

		// Calculate new transform by scaling the current one
		const newScale = transform.k * 0.8;
		const newTransform = d3.zoomIdentity
			.translate(transform.x, transform.y)
			.scale(Math.max(newScale, MIN_ZOOM)); // Use MIN_ZOOM constant

		// Smoothly transition to the new transform
		svg.transition()
			.duration(ANIMATION_DURATIONS.ZOOM)
			.call(zoomBehaviorRef.current.transform, newTransform);
	}, [transform]);

	// Function to reset zoom
	const resetZoom = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);

		// Smoothly transition to identity transform with default zoom
		svg.transition()
			.duration(ANIMATION_DURATIONS.PAN)
			.call(
				zoomBehaviorRef.current.transform,
				d3.zoomIdentity.scale(DEFAULT_ZOOM)
			);
	}, []);

	return {
		zoomBehavior: zoomBehaviorRef.current,
		zoomIn,
		zoomOut,
		resetZoom,
	};
};
