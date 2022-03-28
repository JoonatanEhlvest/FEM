import { render } from "@testing-library/react";
import React from "react";
import { FC, ReactElement, useEffect, useState } from "react";
import FEMState from "../../state/FEMState";

export type svgXML = { [key: string]: string | Array<svgXML> | svgXML };

const getStrProp = (s: svgXML, prop: string): string => {
	const ret = (s[":@"] as svgXML)[prop];
	if (typeof ret === "string") {
		return ret;
	}

	return "";
};

const getObjProp = (s: svgXML, prop: string): svgXML => {
	const ret = s[prop];
	if (typeof ret === "object" && !Array.isArray(ret)) {
		return ret;
	}

	return {};
};

const getArrProp = (s: svgXML, prop: string): Array<svgXML> => {
	const ret = s[prop];
	if (Array.isArray(ret)) {
		return ret;
	} else if (typeof ret === "object") {
		return [ret];
	}

	return [];
};

const formatStringToCamelCase = (str: string) => {
	const splitted = str.split("-");
	if (splitted.length === 1) return splitted[0];
	return (
		splitted[0] +
		splitted
			.slice(1)
			.map((word) => word[0].toUpperCase() + word.slice(1))
			.join("")
	);
};

const getStyleObjectFromString = (str: string) => {
	if (str === undefined) return {};
	const style: { [key: string]: string } = {};
	str.split(";").forEach((el) => {
		const [property, value] = el.split(":");

		if (!property) return;

		const formattedProperty = formatStringToCamelCase(property.trim());
		style[formattedProperty] = value.trim();
	});

	return style;
};

const removeProp = (obj: svgXML, prop: string): svgXML => {
	const { [prop]: removed, ...restObject } = obj;
	return restObject;
};

type Props = {
	image: svgXML | undefined;
	zoom: FEMState["zoom"];
};

const getElemType = (elem: svgXML): [string | null, string | null] => {
	const types = [
		"rect",
		"ellipse",
		"text",
		"polygon",
		"polyline",
		"line",
		"path",
	];
	for (const type of types) {
		if (elem[type]) {
			let text = null;
			if (getArrProp(elem, type).length > 0) {
				text = getArrProp(elem, type)[0]["#text"] as string;
			}
			return [type, text];
		}
	}
	return [null, null];
};

const renderG = (g: svgXML[], zoom: FEMState["zoom"]) => {
	return (
		<g transform={`scale(${zoom})`}>
			{g.map((elem, i) => {
				const props = getObjProp(elem, ":@");
				const style = getStyleObjectFromString(
					getStrProp(elem, "style")
				);

				const [type, text] = getElemType(elem);
				if (!type) return;

				return React.createElement(type, {
					...props,
					style,
					children: text,
					key: `svgElem-${i}`,
				});
			})}
		</g>
	);
};

const RenderSVG: FC<Props> = ({ image, zoom }): ReactElement => {
	const SCROLL_BUFFER_SIZE = 100;
	if (image) {
		const svgTag = image[1] as svgXML as svgXML;
		// const g = ((svgTag as svgXML).svg as svgXML).g as svgXML;
		const g = getArrProp(getArrProp(svgTag, "svg")[0], "g");
		// const ellipses = getArrProp(g, "ellipse");
		// const rects = getArrProp(g, "rect");
		// const texts = getArrProp(g, "text");
		// const paths = getArrProp(g, "path");
		// const lines = getArrProp(g, "line");
		// const polygons = getArrProp(g, "polygon");
		// const polylines = getArrProp(g, "polyline");
		const width = parseFloat(getStrProp(svgTag, "width"));
		const height = parseFloat(getStrProp(svgTag, "height"));

		return (
			<svg
				viewBox={`0 0 ${width * zoom}px ${height * zoom}px`}
				preserveAspectRatio="xMidYMid meet"
				xmlns={getStrProp(svgTag, "xmlns")}
				version={getStrProp(svgTag, "version")}
				width={`${width * zoom + SCROLL_BUFFER_SIZE}px`}
				height={`${height * zoom + SCROLL_BUFFER_SIZE}px`}
			>
				{renderG(g, zoom)}
				{/* <g transform={`scale(${zoom})`}>
					{ellipses.map((e, i) => {
						return (
							<ellipse
								key={`ellipse-${i}`}
								{...e}
								style={getStyleObjectFromString(
									e.style as string
								)}
							/>
						);
					})}
					{rects.map((r, i) => {
						return (
							<rect
								key={`rect-${i}`}
								{...r}
								style={getStyleObjectFromString(
									r.style as string
								)}
							/>
						);
					})}

					{paths.map((p, i) => {
						return (
							<path
								key={`path-${i}`}
								{...p}
								style={getStyleObjectFromString(
									p.style as string
								)}
							/>
						);
					})}
					{lines.map((p, i) => {
						return (
							<line
								key={`line-${i}`}
								{...p}
								style={getStyleObjectFromString(
									p.style as string
								)}
							></line>
						);
					})}
					{polygons.map((p, i) => {
						return (
							<polygon
								key={`polygon-${i}`}
								{...p}
								style={getStyleObjectFromString(
									p.style as string
								)}
							></polygon>
						);
					})}
					{polylines.map((p, i) => {
						return (
							<polygon
								key={`polylines-${i}`}
								{...p}
								style={getStyleObjectFromString(
									p.style as string
								)}
							></polygon>
						);
					})}
					{texts.map((t, i) => {
						return (
							<text
								key={`text-${i}`}
								{...removeProp(t, "#text")}
								style={getStyleObjectFromString(
									t.style as string
								)}
							>
								{getStrProp(t, "#text")}
							</text>
						);
					})}
				</g> */}
			</svg>
		);
	}

	return <div>Couldn't parse image</div>;
};

export default RenderSVG;
