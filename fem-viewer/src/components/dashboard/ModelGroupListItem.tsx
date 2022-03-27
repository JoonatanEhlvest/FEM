import http from "../../http";
import React, { FC, useState } from "react";
import { useForm } from "../../hooks/useForm";
import useFEM from "../../state/useFEM";
import { ModelGroup } from "./Dashboard";
import styles from "./dashboard.module.css";
import { Parser } from "../../parser";
import { useNavigate } from "react-router-dom";

type Props = {
	modelGroup: ModelGroup;
};

const ModelGroupListItem: FC<Props> = ({ modelGroup }) => {
	const { state, handleChange } = useForm({ usernameToShareWith: "" });
	const { setError, addSvg, addModel, resetModels } = useFEM();
	const navigate = useNavigate();

	const handleShare = (modelGroupId: ModelGroup["modelGroup"]["id"]) => {
		http.patch("/api/v1/modelgroup/share", {
			modelGroupId,
			usernameToShareWith: state.usernameToShareWith,
		}).catch((err) => {
			setError({
				status: err.response.status,
				message: err.response.data.message,
			});
		});
	};

	const handleView = () => {
		resetModels();
		const modelGroupId = modelGroup.modelGroup.id;
		http.get(`/api/v1/modelgroup/${modelGroupId}`)
			.then((res) => {
				const svgs = res.data.data.svgs;
				svgs.forEach((svg: any) => {
					addSvg(svg.name, svg.data);
				});
				const parser = new Parser(res.data.data.xml);
				parser.getModels().forEach((model: any) => {
					addModel(model);
				});
				navigate("/viewer");
			})
			.catch((err) =>
				setError({
					status: err.response.status,
					message: err.response.data.message,
				})
			);
	};

	return (
		<div className={styles["modelgroup-item-container"]}>
			<div className={styles["modelgroup-left-container"]}>
				<div>Name: {modelGroup.modelGroup.name}</div>
				<img
					onClick={handleView}
					src={require("./view.svg").default}
					alt="view model"
				/>
			</div>
			<div>
				<div>{modelGroup.owner ? "Shared To" : "Shared by"}</div>
				{modelGroup.modelGroup.shares.map((share) => {
					let shareUsername = share.sharedByName;
					if (modelGroup.owner) {
						shareUsername = share.sharedToName;
					}

					return (
						<div key={share.sharedByName + share.sharedToName}>
							{shareUsername}
						</div>
					);
				})}
			</div>

			{modelGroup.owner && (
				<div className={styles["share-container"]}>
					<div className={styles["input-container"]}>
						<input
							onChange={handleChange}
							value={state.usernameToShareWith}
							name="usernameToShareWith"
							placeholder="Username"
							type="text"
						/>
						<span></span>
					</div>

					<button
						onClick={() => handleShare(modelGroup.modelGroup.id)}
					>
						Share
					</button>
				</div>
			)}
		</div>
	);
};

export default ModelGroupListItem;
