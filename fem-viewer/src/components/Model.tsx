import React, { FC, useEffect } from "react";
import ModelType from "../state/types/Model";

type Props = {
	model: ModelType;
};

const Model: FC<Props> = ({ model }) => {
	useEffect(() => {
		console.log(model);
	});

	return (
		<div key={model.id}>
			<div>{model.name}</div>
			{model.instances.map((i) => (
				<div key={i.id}>
					{i.name} ------------- {i.position}
				</div>
			))}
		</div>
	);
};

export default Model;
