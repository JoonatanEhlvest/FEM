import http from "../../http";
import React, { FC, useState } from "react";
import { useForm } from "../../hooks/useForm";
import useFEM from "../../state/useFEM";
import styles from "./dashboard.module.css";
import { Parser } from "../../parser";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Popup from "reactjs-popup";
import ConfirmationPopup from "../confirmationPopup/ConfirmationPopup";
import { ModelGroup } from "../../state/FEMState";

type Props = {
	modelGroup: ModelGroup;
	removeModelGroup: (id: string) => void;
};

const ModelGroupListItem: FC<Props> = ({ modelGroup, removeModelGroup }) => {
	const { state, handleChange } = useForm({ usernameToShareWith: "" });
	const { setError, addModelGroup, resetModels, setPopup } = useFEM();
	const [loadingModel, setLoadingModel] = useState(false);
	const navigate = useNavigate();

	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleShare = (modelGroupId: ModelGroup["modelGroup"]["id"]) => {
		http.patch("/api/v1/modelgroup/share", {
			modelGroupId,
			usernameToShareWith: state.usernameToShareWith,
		})
			.then((res) => {
				setPopup({
					message: "Sharing successful",
				});
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	};

	const handleView = () => {
		console.log("Loading models");
		resetModels();
		const modelGroupId = modelGroup.modelGroup.id;
		setLoadingModel(true);
		addModelGroup(modelGroupId, navigate)
			.then(() => {
				setLoadingModel(false);
			})
			.catch(() => setLoadingModel(false));
	};

	const handleDelete = () => {
		const modelGroupName = modelGroup.modelGroup.name;
		const modelGroupId = modelGroup.modelGroup.id;
		axios
			.delete(`/api/v1/modelgroup/${modelGroupId}`, {
				data: {
					modelGroupName,
				},
			})
			.then((res) => {
				setPopup({ message: "Deletion successful" });
				removeModelGroup(res.data.modelGroup.id);
			})
			.catch((err) => {
				setError({
					status: err.response.staus,
					message: err.reponse.data.message,
				});
			});
	};

	return (
		<div className={styles["modelgroup-item-container"]}>
			<div className={styles["modelgroup-left-container"]}>
				<div>Name: {modelGroup.modelGroup.name}</div>
				<img
					style={{ pointerEvents: loadingModel ? "none" : "auto" }}
					onClick={handleView}
					src={require("./view.svg").default}
					alt="view model"
				/>
				{modelGroup.owner && (
					<button onClick={() => setShowConfirmation(true)}>
						Delete
					</button>
				)}
				<ConfirmationPopup
					message={`Are you sure you want to delete ${modelGroup.modelGroup.name} ?`}
					showCondition={showConfirmation}
					handleConfirm={handleDelete}
					toggleConfirmation={setShowConfirmation}
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
