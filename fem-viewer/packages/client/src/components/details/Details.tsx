import { Instance, InterrefType, isSubclass } from "@fem-viewer/types/Instance";
import { Reference } from "@fem-viewer/types";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import styles from "./details.module.css";
import arrowRight from "./arrow-right.svg";
import editIcon from "./edit-icon.svg";
import { useCallback, useEffect, useState } from "react";
import model from "./model.svg";
import { InstanceClass } from "@fem-viewer/types";
import attrConfig from "../../assets/instanceAttrConfig.json";
import { UserRole } from "../dashboard/Dashboard";

const Details = () => {
	const {
		getCurrentInstance,
		setCurrentInstance,
		goToReference,
		getInstancesThatReference,
		goToAllOccurrences,
		getReferenceBackNavigation,
		setCurrentModel,
		clearAllOccurrencesHighlighting,
		setReferenceBackNavigation,
		updateInstanceDescription,
		getCurrentModelGroup,
		getUser,
		state,
	} = useFEM();

	const instance = getCurrentInstance();
	const currentModelGroup = getCurrentModelGroup();
	const user = getUser();

	// Check if user has edit permissions (admin or developer)
	const hasEditPermission = user && (user.role === UserRole.ADMIN || user.role === UserRole.DEVELOPER);

	const [dropdowns, setDropdowns] = useState({
		interrefsOpen: false,
		singlerefsOpen: false,
	});

	// State for description editing
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [editedDescription, setEditedDescription] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateError, setUpdateError] = useState("");

	useEffect(() => {
		setDropdowns((prev) => ({
			interrefsOpen: false,
			singlerefsOpen: false,
		}));
		
		// Reset editing state when instance changes
		setIsEditingDescription(false);
		setEditedDescription("");
		setUpdateError("");
	}, [instance]);

	const handleGoToReference = (ref: Reference | null) => {
		if (ref === null) {
			return;
		}
		goToReference(ref);
		setDropdowns((prev) => ({
			interrefsOpen: false,
			singlerefsOpen: prev.singlerefsOpen,
		}));
	};

	const getTitle = (instance: Instance): string => {
		if (instance.class === "Note") {
			return "Description";
		}
		if (isSubclass(instance)) {
			return "Name";
		} else {
			return "Denomination";
		}
	};

	const getValue = (instance: Instance): string => {
		if (instance.class === "Note") {
			return instance.description;
		}
		if (isSubclass(instance)) {
			return instance.name;
		} else {
			return instance.denomination;
		}
	};

	const handleClosePopup = () => {
		setCurrentInstance(undefined);
		clearAllOccurrencesHighlighting();
		setReferenceBackNavigation(null);
	};

	const toggleDropdown = (dropdown: keyof typeof dropdowns) => {
		setDropdowns((prev) => ({
			...prev,
			[dropdown]: !prev[dropdown],
		}));
	};

	// Handle starting description edit
	const handleEditDescription = () => {
		if (instance) {
			setEditedDescription(instance.description);
			setIsEditingDescription(true);
		}
	};

	// Handle saving description edit
	const handleSaveDescription = async () => {
		if (!instance || !currentModelGroup) return;
		
		setIsUpdating(true);
		setUpdateError("");
		
		try {
			const result = await updateInstanceDescription(
				currentModelGroup.modelGroup.id,
				instance.id,
				editedDescription
			);
			
			if (result.success) {
				setIsEditingDescription(false);
			} else {
				setUpdateError(result.error || "Failed to update description");
			}
		} catch (error) {
			setUpdateError("An unexpected error occurred");
			console.error("Error updating description:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	// Handle canceling description edit
	const handleCancelEdit = () => {
		setIsEditingDescription(false);
		setEditedDescription("");
		setUpdateError("");
	};

	const renderAllOccurrences = useCallback(() => {
		if (!instance || instance.isGhost) return;
		let refsFound = 0;
		const numRefs = Object.keys(state.references).length;
		return (
			<div className={styles["ref-container"]}>
				<div
					className={styles["ref-header"]}
					onClick={() => toggleDropdown("interrefsOpen")}
				>
					All Occurrences
				</div>
				{dropdowns.interrefsOpen &&
					// Find instances that reference the current instance
					Object.entries(state.references).map(
						([refName, iref], i) => {
							const refs = getInstancesThatReference(
								instance,
								refName as InterrefType
							);

							if (
								i === numRefs - 1 && // If last iteration
								refsFound === 0 && // And still no refs found
								refs.length === 0 // And this iteration found none as well
							) {
								return <div>Nothing found</div>;
							}

							if (refs.length === 0) {
								return;
							} else {
								refsFound += 1;
							}

							// Group references by model name
							const refsByModelName: {
								[key: string]: Array<Reference>;
							} = {};

							refs.forEach((ref) => {
								if (refsByModelName[ref.referencedByModel]) {
									refsByModelName[ref.referencedByModel].push(
										ref
									);
								} else {
									refsByModelName[ref.referencedByModel] = [
										ref,
									];
								}
							});

							return (
								<div className={styles["interref-container"]}>
									<div className={styles["interref-title"]}>
										Models
									</div>
									{Object.entries(refsByModelName).map(
										([refModelName, refs]) => {
											return (
												<div
													className={
														styles["ref-item"]
													}
													onClick={() =>
														goToAllOccurrences(
															refModelName,
															refs
														)
													}
												>
													<img
														className={
															styles[
																"ref-item-model-img"
															]
														}
														src={model}
														alt=""
													/>
													<div
														className={
															styles[
																"ref-item-model"
															]
														}
													>
														{refModelName}{" "}
													</div>
													<img
														className={
															styles["ref-link"]
														}
														src={arrowRight}
														alt="follow Reference"
													/>
												</div>
											);
										}
									)}
								</div>
							);
						}
					)}
			</div>
		);
	}, [instance, dropdowns.interrefsOpen]);

	const renderInstanceSpecificReference = () => {
		if (!instance) return null;
		if (!instance.Interrefs) return null;

		// Define reference type and create a properly typed array
		interface RefItem {
			ref: NonNullable<any>;
			refName: string;
		}

		// Filter out undefined/null refs
		const validRefs: RefItem[] = [];

		const allRefs = [
					{
						ref: instance.Interrefs.referencedAsset,
						refName: "Referenced Asset",
					},
					{
						ref: instance.Interrefs.referencedProcess,
						refName: "Referenced Process",
					},
					{
						ref: instance.Interrefs.referencedNote,
						refName: "Referenced Note",
					},
					{
						ref: instance.Interrefs["Referenced Pool"],
						refName: " Referenced Pool",
					},
					{
						ref: instance.Interrefs["Referenced External Actor"],
						refName: "Referenced External Actor",
					},
					{
						ref: instance.Interrefs["Referenced Bsubclass"],
						refName: "Referenced Bsubclass",
					},
					{
						ref: instance.Interrefs["Referenced Subclass"],
						refName: "Referenced Subclass",
					},
		];

		// Manually filter to avoid TypeScript confusion
		for (const item of allRefs) {
			if (item.ref) {
				validRefs.push(item as RefItem);
			}
		}

		if (validRefs.length === 0) return null;

						return (
			<div className={styles["ref-container"]}>
				{validRefs.map(({ ref, refName }) => (
					<div key={refName}>
								<div
									className={styles["ref-header"]}
									onClick={() => {
										const reference: Reference = {
											modelName: "",
											type: ref.type,
											referencedInstanceName: "",
											referencedClass:
												ref.tclassname as InstanceClass,
											referencedByInstance: ref.tobjname,
											referencedByModel: ref.tmodelname,
										};
										handleGoToReference(reference);
									}}
								>
									{refName}
								</div>
										</div>
				))}
			</div>
		);
	};

	const backNav = getReferenceBackNavigation();
	const titles: string[] = [];
	const values: string[] = [];

	if (instance) {
		Object.entries(
			(attrConfig as any)[instance.class] as {
				[Property in keyof InstanceClass]: {
					display: boolean;
					alias: string;
				};
			}
		).forEach(([attr, props]) => {
			if (props.display) {
				titles.push(
					props.alias === ""
						? attr.charAt(0).toUpperCase() + attr.slice(1)
						: props.alias
				);
				values.push(instance[attr as keyof Instance] as string);
			}
		});
	}

	// Render the description editor
	const renderDescriptionEditor = () => {
		// Find the description index in the titles array
		const descriptionIndex = titles.findIndex(title => title === "Description");
		if (descriptionIndex === -1) return null;
		
		return (
			<tr>
				<td className={styles["general-information-item-title"]}>
					Description
				</td>
				<td className={styles["general-information-item-value"]}>
					{isEditingDescription ? (
						<div className={styles["description-editor"]}>
							<textarea
								value={editedDescription}
								onChange={(e) => setEditedDescription(e.target.value)}
								className={styles["description-textarea"]}
								rows={4}
								placeholder="Enter description..."
								autoFocus
							/>
							<div className={styles["description-actions"]}>
								<button 
									onClick={handleSaveDescription}
									disabled={isUpdating}
									className={styles["save-button"]}
								>
									{isUpdating ? "Saving..." : "Save"}
								</button>
								<button 
									onClick={handleCancelEdit}
									disabled={isUpdating}
									className={styles["cancel-button"]}
								>
									Cancel
								</button>
							</div>
							{updateError && (
								<div className={styles["update-error"]}>
									{updateError}
								</div>
							)}
						</div>
					) : (
						<div className={styles["description-display"]}>
							<div className={styles["description-text"]}>
								{values[descriptionIndex] || "No description"}
							</div>
							{/* Only show edit icon if user has permission */}
							{hasEditPermission && (
								<img 
									src={editIcon} 
									alt="Edit" 
									title="Edit description"
									className={styles["edit-icon"]}
									onClick={handleEditDescription}
								/>
							)}
						</div>
					)}
				</td>
			</tr>
		);
	};

	return (
		<div style={{ flexGrow: 1 }}>
			<div className={styles["details-container"]}>
				<Header>
					<div className={styles["header-content"]}>
						<div>Details</div>
						{backNav && (
							<button
								className={styles["back-nav"]}
								onClick={() => {
									setCurrentModel(backNav.modelToGoTo.id);
									setCurrentInstance(backNav.instanceToGoTo);
									clearAllOccurrencesHighlighting();
								}}
							>
								{backNav.modelToGoTo.name}
							</button>
						)}
						<button onClick={handleClosePopup}>X</button>
					</div>
				</Header>

				{instance && (
					<div className={styles["details-content"]}>
						<div className={styles["general-information-title"]}>
							General Information
						</div>
						<table>
							{titles.map((title, i) => {
								// Skip the description as we'll render it separately
								if (title === "Description") return null;
								
								return (
									<tr>
										<td
											className={
												styles[
													"general-information-item-title"
												]
											}
										>
											{title}
										</td>
										<td
											className={
												styles[
													"general-information-item-value"
												]
											}
										>
											{values[i]}
										</td>
									</tr>
								);
							})}
							{renderDescriptionEditor()}
						</table>

						{renderAllOccurrences()}

						{renderInstanceSpecificReference()}
					</div>
				)}
			</div>
		</div>
	);
};

export default Details;
