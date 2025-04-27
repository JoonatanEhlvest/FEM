import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isAssociationConnector } from "@fem-viewer/types/Connector";
import { Segment } from "../../types/ConnectorTypes";
import React from "react";

export class AssociationRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "blue",
				strokeWidth: 1,
				strokeDasharray: "6,4",
				opacity: 1,
				fill: "none",
			},
			labelStyle: {
				...this.getDefaultLabelStyle(),
				maxWidthCm: 2.5,
			},
		};
	}

	protected renderAdditionalDefs(): React.ReactNode {
		const { connector } = this.props;
		const { viewBoxWidth } = this.getArrowStyleSettings();

		if (
			isAssociationConnector(connector) &&
			connector.direction === "Symmetric"
		) {
			const markerId = `start-marker-${connector.id}`;
			return this.renderMarker(markerId, viewBoxWidth, 180);
		}

		return null;
	}

	protected getAdditionalSegmentAttributes(
		segment: Segment,
		index: number,
		isFirstSegment: boolean,
		isLastSegment: boolean
	): React.SVGProps<SVGPathElement> {
		const { connector } = this.props;
		if (
			!isAssociationConnector(connector) ||
			connector.direction !== "Symmetric"
		) {
			return {};
		}

		if (isFirstSegment) {
			return {
				markerStart: `url(#start-marker-${connector.id})`,
			};
		}

		return {};
	}

	/**
	 * Override to display the note for Association connectors
	 */
	protected getLabels(): string[] {
		const { connector } = this.props;
		const labels: string[] = [];

		// For Association connectors, display the note if available
		if (isAssociationConnector(connector)) {
			labels.push(connector.note);
		}

		return labels;
	}

	public render(): React.ReactElement {
		return (
			<>
				{super.render()}
				{this.renderAdditionalDefs()}
			</>
		);
	}
}
