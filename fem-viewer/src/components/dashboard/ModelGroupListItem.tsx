import axios from "axios";
import React, { FC, useState } from "react";
import { useForm } from "../../hooks/useForm";
import useFEM from "../../state/useFEM";
import { ModelGroup } from "./Dashboard";
import styles from "./dashboard.module.css";

type Props = {
	modelGroup: ModelGroup;
};

const ModelGroupListItem: FC<Props> = ({ modelGroup }) => {
	const { state, handleChange } = useForm({ usernameToShareWith: "" });
	const { setError } = useFEM();

	const handleShare = (modelGroupId: ModelGroup["modelGroup"]["id"]) => {
		axios
			.patch("/api/v1/modelgroup/share", {
				modelGroupId,
				usernameToShareWith: state.usernameToShareWith,
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	};

	return (
		<div className={styles["modelgroup-item-container"]}>
			<div>Name: {modelGroup.modelGroup.name}</div>
			<div>
				<div>Shares</div>
				{modelGroup.modelGroup.shares.map((share) => {
					let shareUsername = share.sharedByName;
					if (modelGroup.owner) {
						shareUsername = share.sharedToName;
					}

					return <div>{shareUsername}</div>;
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
