import { ReactElement } from "react";

export type svgXML = { [key: string]: string | Array<svgXML> | svgXML };

const getStrProp = (s: svgXML, prop: string): string => {
	const ret = s[prop];
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

const renderSVG = (image: svgXML | null): ReactElement => {
	if (image) {
		console.log(image);
		const svgTag = getObjProp(image, "svg");
		const g = getObjProp(svgTag, "g");
		const ellipses = getArrProp(g, "ellipse");
		const rects = getArrProp(g, "rect");
		const texts = getArrProp(g, "text");
		const paths = getArrProp(g, "path");
		const lines = getArrProp(g, "line");
		const polygons = getArrProp(g, "polygon");
		const polylines = getArrProp(g, "polyline");

		return (
			<svg
				xmlns={getStrProp(svgTag, "xmlns")}
				version={getStrProp(svgTag, "version")}
				width={getStrProp(svgTag, "width")}
				height={getStrProp(svgTag, "height")}
			>
				<g>
					{rects.map((r) => {
						return (
							<rect
								{...r}
								style={getStyleObjectFromString(
									r.style as string
								)}
								onClick={() => console.log(r)}
							/>
						);
					})}
					{ellipses.map((e) => {
						return (
							<ellipse
								{...e}
								style={getStyleObjectFromString(
									e.style as string
								)}
								onClick={() => console.log(e)}
							/>
						);
					})}
					{texts.map((t) => {
						return (
							<text
								{...t}
								style={getStyleObjectFromString(
									t.style as string
								)}
								onClick={() => console.log(t)}
							>
								{getStrProp(t, "#text")}
							</text>
						);
					})}
					{paths.map((p) => {
						return (
							<path
								{...p}
								style={getStyleObjectFromString(
									p.style as string
								)}
								onClick={() => console.log(p)}
							/>
						);
					})}
					{lines.map((p) => {
						return (
							<line
								{...p}
								style={getStyleObjectFromString(
									p.style as string
								)}
								onClick={() => console.log(p)}
							></line>
						);
					})}
					{polygons.map((p) => {
						return (
							<polygon
								{...p}
								style={getStyleObjectFromString(
									p.style as string
								)}
								onClick={() => console.log(p)}
							></polygon>
						);
					})}
					{polylines.map((p) => {
						return (
							<polygon
								{...p}
								style={getStyleObjectFromString(
									p.style as string
								)}
								onClick={() => console.log(p)}
							></polygon>
						);
					})}
				</g>
			</svg>
		);
	}

	return <div>Couldn't parse image</div>;
};

export default renderSVG;
