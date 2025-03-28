import {
	Instance,
	InterrefType,
	isSubclass,
	ColorPicker,
	BorderColorPicker,
	isBorderSubclass,
} from "@fem-viewer/types/Instance";
import { Reference } from "@fem-viewer/types";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import styles from "./details.module.css";
import arrowRight from "./arrow-right.svg";
import editIcon from "./edit-icon.svg";
import { useCallback, useEffect, useState, ReactNode } from "react";
import model from "./model.svg";
import {
	InstanceClass,
	getBaseInstanceClass,
	getSubclassTypeFromBaseInstanceClass,
	getBorderSubclassTypeFromBaseInstanceClass,
} from "@fem-viewer/types/InstanceClass";
import attrConfig from "../../assets/instanceAttrConfig.json";
import { UserRole } from "../dashboard/Dashboard";

interface SubclassEditorProps<T extends ColorPicker | BorderColorPicker> {
	title: string;
	isEditing: boolean;
	availableSubclasses: { id: string; name: string }[];
	selectedSubclassId: string;
	setSelectedSubclassId: (id: string) => void;
	selectedColorPickerMode: T;
	setSelectedColorPickerMode: (mode: T) => void;
	isUpdating: boolean;
	updateError: string;
	onUpdate: () => Promise<void>;
	onCancel: () => void;
	onEdit: () => void;
	currentValue: string;
	colorPickerOptions: { value: T; label: string }[];
	hasEditPermission: boolean;
}

interface DescriptionEditorProps {
	description: string;
	isEditing: boolean;
	editedDescription: string;
	isUpdating: boolean;
	updateError: string;
	hasEditPermission: boolean;
	onEdit: () => void;
	onCancel: () => void;
	onSave: () => Promise<void>;
	onDescriptionChange: (value: string) => void;
}

const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
	description,
	isEditing,
	editedDescription,
	isUpdating,
	updateError,
	hasEditPermission,
	onEdit,
	onCancel,
	onSave,
	onDescriptionChange,
}) => {
	return (
		<tr>
			<td className={styles["general-information-item-title"]}>
				Description
			</td>
			<td className={styles["general-information-item-value"]}>
				{isEditing ? (
					<div className={styles["description-editor"]}>
						<textarea
							value={editedDescription}
							onChange={(e) =>
								onDescriptionChange(e.target.value)
							}
							className={styles["description-textarea"]}
							rows={4}
							placeholder="Enter description..."
							autoFocus
						/>
						<div className={styles["description-actions"]}>
							<button
								onClick={onSave}
								disabled={isUpdating}
								className={styles["save-button"]}
							>
								{isUpdating ? "Saving..." : "Save"}
							</button>
							<button
								onClick={onCancel}
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
							{description || "No description"}
						</div>
						{/* Only show edit icon if user has permission */}
						{hasEditPermission && (
							<img
								src={editIcon}
								alt="Edit"
								title="Edit description"
								className={styles["edit-icon"]}
								onClick={onEdit}
							/>
						)}
					</div>
				)}
			</td>
		</tr>
	);
};

const SubclassEditor = <T extends ColorPicker | BorderColorPicker>({
	title,
	isEditing,
	availableSubclasses,
	selectedSubclassId,
	setSelectedSubclassId,
	selectedColorPickerMode,
	setSelectedColorPickerMode,
	isUpdating,
	updateError,
	onUpdate,
	onCancel,
	onEdit,
	currentValue,
	colorPickerOptions,
	hasEditPermission,
}: SubclassEditorProps<T>) => {
	if (availableSubclasses.length === 0) return null;

	return (
		<tr>
			<td className={styles["general-information-item-title"]}>
				{title}
			</td>
			<td className={styles["general-information-item-value"]}>
				{isEditing ? (
					<div className={styles["select-container"]}>
						<div className={styles["picker-mode-selector"]}>
							{colorPickerOptions.map((option) => (
								<label key={option.value}>
									<input
										type="radio"
										name={`${
											title
												.toLowerCase()
												.replace(/\s+/g, "") // Remove all whitespace
										}ColorPickerMode`}
										value={option.value}
										checked={
											selectedColorPickerMode ===
											option.value
										}
										onChange={() =>
											setSelectedColorPickerMode(
												option.value
											)
										}
									/>
									{option.label}
								</label>
							))}
						</div>

						{selectedColorPickerMode === "Subclass" && (
							<select
								className={styles["select"]}
								value={selectedSubclassId}
								onChange={(e) =>
									setSelectedSubclassId(e.target.value)
								}
							>
								<option value="">-- Select {title} --</option>
								{availableSubclasses.map((subclass) => (
									<option
										key={subclass.id}
										value={subclass.id}
									>
										{subclass.name}
									</option>
								))}
							</select>
						)}
						<div className={styles["buttons-container"]}>
							<button
								className={styles["update-button"]}
								onClick={onUpdate}
								disabled={
									isUpdating ||
									(selectedColorPickerMode === "Subclass" &&
										!selectedSubclassId)
								}
							>
								{isUpdating ? "Updating..." : "Update"}
							</button>
							<button
								className={styles["cancel-button"]}
								onClick={onCancel}
								disabled={isUpdating}
							>
								Cancel
							</button>
						</div>
						{updateError && (
							<div className={styles["error"]}>{updateError}</div>
						)}
					</div>
				) : (
					<div className={styles["show-value"]}>
						<div className={styles["value"]}>{currentValue}</div>
						{hasEditPermission && (
							<img
								src={editIcon}
								alt="Edit"
								title={`Edit ${title.toLowerCase()}`}
								className={styles["edit-icon"]}
								onClick={onEdit}
							/>
						)}
					</div>
				)}
			</td>
		</tr>
	);
};

/*  Find all subclasses and border subclasses for the current instance */
const useSubclasses = (instance: Instance | undefined, models: any[]) => {
	const [subclasses, setSubclasses] = useState<
		{ id: string; name: string }[]
	>([]);
	const [borderSubclasses, setBorderSubclasses] = useState<
		{ id: string; name: string }[]
	>([]);

	useEffect(() => {
		if (!instance) {
			setSubclasses([]);
			setBorderSubclasses([]);
			return;
		}

		// Get the base instance class to find matching subclasses
		const baseClass = getBaseInstanceClass(instance.class);
		const subclassType = getSubclassTypeFromBaseInstanceClass(baseClass);
		const borderSubclassType =
			getBorderSubclassTypeFromBaseInstanceClass(baseClass);

		// Collect subclasses across all models
		const subclassInstances: { id: string; name: string }[] = [];
		const borderSubclassInstances: { id: string; name: string }[] = [];

		models.forEach((model) => {
			model.instances.forEach((inst: Instance) => {
				// Regular subclasses
				if (
					inst.class === subclassType &&
					!subclassInstances.some(
						(selectedInstance) => selectedInstance.id === inst.id
					)
				) {
					subclassInstances.push({ id: inst.id, name: inst.name });
				}

				// Border subclasses
				if (
					inst.class === borderSubclassType &&
					!borderSubclassInstances.some(
						(selectedInstance) => selectedInstance.id === inst.id
					)
				) {
					borderSubclassInstances.push({
						id: inst.id,
						name: inst.name,
					});
				}
			});
		});

		// Sort alphabetically
		setSubclasses(
			subclassInstances.sort((a, b) => a.name.localeCompare(b.name))
		);
		setBorderSubclasses(
			borderSubclassInstances.sort((a, b) => a.name.localeCompare(b.name))
		);
	}, [instance, models]);

	return { subclasses, borderSubclasses };
};

/**
 * Resolves a subclass reference from an instance's Interrefs
 * @param instance The instance containing the subclass reference
 * @param models The list of models to search in
 * @param isBorder Whether this is a border subclass reference
 * @returns The ID of the resolved subclass instance, or empty string if not found
 */
const resolveSubclassReference = (
	instance: Instance,
	models: any[],
	isBorder: boolean = false
): string => {
	const refKey = isBorder ? "Referenced Bsubclass" : "Referenced Subclass";
	const ref = instance?.Interrefs?.[refKey];

	if (!ref) return "";

	const subclassName = ref.tobjname;
	const baseClass = getBaseInstanceClass(instance.class);
	const subclassType = isBorder
		? getBorderSubclassTypeFromBaseInstanceClass(baseClass)
		: getSubclassTypeFromBaseInstanceClass(baseClass);

	// Find the subclass instance by name and class
	const subclassInstance = models
		.flatMap((model) => model.instances)
		.find(
			(inst) => inst.name === subclassName && inst.class === subclassType
		);

	return subclassInstance?.id || "";
};

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
		updateInstanceSubclass,
		updateInstanceBSubclass,
		getCurrentModelGroup,
		getUser,
		state,
	} = useFEM();

	const instance = getCurrentInstance();
	const currentModelGroup = getCurrentModelGroup();
	const user = getUser();

	// Check if user has edit permissions (admin or developer)
	const hasEditPermission = Boolean(
		user &&
			(user.role === UserRole.ADMIN || user.role === UserRole.DEVELOPER)
	);

	const [dropdowns, setDropdowns] = useState({
		interrefsOpen: false,
		singlerefsOpen: false,
	});

	// State for description editing
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [editedDescription, setEditedDescription] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateError, setUpdateError] = useState("");

	// State for subclass editing
	const [isEditingSubclass, setIsEditingSubclass] = useState(false);
	const [selectedSubclassId, setSelectedSubclassId] = useState("");
	const [isUpdatingSubclass, setIsUpdatingSubclass] = useState(false);
	const [subclassUpdateError, setSubclassUpdateError] = useState("");

	// State for border subclass editing
	const [isEditingBorderSubclass, setIsEditingBorderSubclass] =
		useState(false);
	const [selectedBorderSubclassId, setSelectedBorderSubclassId] =
		useState("");
	const [isUpdatingBorderSubclass, setIsUpdatingBorderSubclass] =
		useState(false);
	const [borderSubclassUpdateError, setBorderSubclassUpdateError] =
		useState("");

	// State for color picker mode
	const [selectedColorPickerMode, setSelectedColorPickerMode] =
		useState<ColorPicker>("Individual");
	const [selectedBorderColorPickerMode, setSelectedBorderColorPickerMode] =
		useState<BorderColorPicker>("Individual");

	// Use custom hook to find available subclasses
	const {
		subclasses: availableSubclasses,
		borderSubclasses: availableBorderSubclasses,
	} = useSubclasses(instance, state.models);

	// Reset state when instance changes
	useEffect(() => {
		setDropdowns({ interrefsOpen: false, singlerefsOpen: false });

		// Reset editing state when instance changes
		setIsEditingDescription(false);
		setEditedDescription("");
		setUpdateError("");
		setIsEditingSubclass(false);
		setIsEditingBorderSubclass(false);

		if (!instance) return;

		// Set selected subclass from current instance
		setSelectedSubclassId(resolveSubclassReference(instance, state.models));

		// Set selected border subclass from current instance
		setSelectedBorderSubclassId(
			resolveSubclassReference(instance, state.models, true)
		);
	}, [instance, state.models]);

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

	const toggleDropdown = useCallback((dropdown: keyof typeof dropdowns) => {
		setDropdowns((prev) => ({
			...prev,
			[dropdown]: !prev[dropdown],
		}));
	}, []);

	// Handle starting description edit
	const handleEditDescription = () => {
		if (instance) {
			setEditedDescription(instance.description);
			setIsEditingDescription(true);
		}
	};

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

	const handleCancelEdit = () => {
		setIsEditingDescription(false);
		setEditedDescription("");
		setUpdateError("");
	};

	// Subclass editing handlers
	const handleUpdateSubclass = async () => {
		if (!instance || !currentModelGroup) return;

		// If color picker mode is not Subclass, we don't need a subclass ID
		const subclassId =
			selectedColorPickerMode === "Subclass" ? selectedSubclassId : null;

		setIsUpdatingSubclass(true);
		setSubclassUpdateError("");

		try {
			const result = await updateInstanceSubclass(
				currentModelGroup.modelGroup.id,
				instance.id,
				subclassId,
				selectedColorPickerMode
			);

			if (result.success) {
				setIsEditingSubclass(false);
			} else {
				setSubclassUpdateError(
					result.error || "Failed to update subclass"
				);
			}
		} catch (error) {
			console.error("Error updating subclass:", error);
			setSubclassUpdateError("An unexpected error occurred");
		} finally {
			setIsUpdatingSubclass(false);
		}
	};

	const handleCancelSubclassEdit = () => {
		setIsEditingSubclass(false);
		if (instance) {
			setSelectedSubclassId(
				resolveSubclassReference(instance, state.models)
			);
		} else {
			setSelectedSubclassId("");
		}
		setSubclassUpdateError("");
	};

	// Border subclass editing handlers
	const handleUpdateBorderSubclass = async () => {
		if (!instance || !currentModelGroup) return;

		// If color picker mode is not Subclass, we don't need a subclass ID
		const bsubclassId =
			selectedBorderColorPickerMode === "Subclass"
				? selectedBorderSubclassId
				: null;

		setIsUpdatingBorderSubclass(true);
		setBorderSubclassUpdateError("");

		try {
			const result = await updateInstanceBSubclass(
				currentModelGroup.modelGroup.id,
				instance.id,
				bsubclassId,
				selectedBorderColorPickerMode
			);

			if (result.success) {
				setIsEditingBorderSubclass(false);
			} else {
				setBorderSubclassUpdateError(
					result.error || "Failed to update border subclass"
				);
			}
		} catch (error) {
			console.error("Error updating border subclass:", error);
			setBorderSubclassUpdateError("An unexpected error occurred");
		} finally {
			setIsUpdatingBorderSubclass(false);
		}
	};

	const handleCancelBorderSubclassEdit = () => {
		setIsEditingBorderSubclass(false);
		if (instance) {
			setSelectedBorderSubclassId(
				resolveSubclassReference(instance, state.models, true)
			);
		} else {
			setSelectedBorderSubclassId("");
		}
		setBorderSubclassUpdateError("");
	};

	/* Find and display all instances that reference the current instance */
	const renderAllOccurrences = useCallback(() => {
		if (!instance || instance.isGhost) return null;

		const allRefs = Object.entries(state.references);
		let refsFound = 0;

		const renderContent = () => {
			if (!dropdowns.interrefsOpen) return null;

			const content: ReactNode[] = allRefs.map(([refName, iref], i) => {
				const referencingInstances = getInstancesThatReference(
					instance,
					refName as InterrefType
				);

				// Skip if no references found, unless it's the last iteration and we haven't found any refs yet
				if (referencingInstances.length === 0) {
					if (i === allRefs.length - 1 && refsFound === 0) {
						return (
							<div key={`empty-${refName}`}>Nothing found</div>
						);
					}
					return null;
				}

				// Increment counter for found refs
				refsFound++;

				// Group references by model name
				const refsByModelName: Record<string, Reference[]> = {};

				referencingInstances.forEach((ref) => {
					if (!refsByModelName[ref.referencedByModel]) {
						refsByModelName[ref.referencedByModel] = [];
					}
					refsByModelName[ref.referencedByModel].push(ref);
				});

				return (
					<div key={refName} className={styles["interref-container"]}>
						<div className={styles["interref-title"]}>Models</div>
						{Object.entries(refsByModelName).map(
							([modelName, modelRefs]) => (
								<div
									key={modelName}
									className={styles["ref-item"]}
									onClick={() =>
										goToAllOccurrences(modelName, modelRefs)
									}
								>
									<img
										className={styles["ref-item-model-img"]}
										src={model}
										alt=""
									/>
									<div className={styles["ref-item-model"]}>
										{modelName}{" "}
									</div>
									<img
										className={styles["ref-link"]}
										src={arrowRight}
										alt="follow Reference"
									/>
								</div>
							)
						)}
					</div>
				);
			});

			return content;
		};

		return (
			<div className={styles["ref-container"]}>
				<div
					className={styles["ref-header"]}
					onClick={() => toggleDropdown("interrefsOpen")}
				>
					All Occurrences
				</div>
				{renderContent()}
			</div>
		);
	}, [
		instance,
		dropdowns.interrefsOpen,
		state.references,
		getInstancesThatReference,
		goToAllOccurrences,
		toggleDropdown,
	]);

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

	const renderDescriptionEditor = () => {
		// Find the description index in the titles array
		const descriptionIndex = titles.findIndex(
			(title) => title === "Description"
		);
		if (descriptionIndex === -1) return null;

		return (
			<DescriptionEditor
				description={values[descriptionIndex] || ""}
				isEditing={isEditingDescription}
				editedDescription={editedDescription}
				isUpdating={isUpdating}
				updateError={updateError}
				hasEditPermission={hasEditPermission}
				onEdit={handleEditDescription}
				onCancel={handleCancelEdit}
				onSave={handleSaveDescription}
				onDescriptionChange={setEditedDescription}
			/>
		);
	};

	// Render the subclass editor
	const renderSubclassEditor = () => {
		if (!instance || isSubclass(instance) || isBorderSubclass(instance))
			return null;

		const currentValue =
			instance.colorPicker === "Default"
				? "Default"
				: instance.colorPicker === "Individual"
				? "Individual"
				: instance?.Interrefs?.["Referenced Subclass"]?.tobjname ||
				  "No subclass selected";

		return (
			<SubclassEditor<ColorPicker>
				title="Subclass"
				isEditing={isEditingSubclass}
				availableSubclasses={availableSubclasses}
				selectedSubclassId={selectedSubclassId}
				setSelectedSubclassId={setSelectedSubclassId}
				selectedColorPickerMode={selectedColorPickerMode}
				setSelectedColorPickerMode={setSelectedColorPickerMode}
				isUpdating={isUpdatingSubclass}
				updateError={subclassUpdateError}
				onUpdate={handleUpdateSubclass}
				onCancel={handleCancelSubclassEdit}
				onEdit={() => {
					setIsEditingSubclass(true);
					setSelectedColorPickerMode(
						instance.colorPicker || "Individual"
					);
				}}
				currentValue={currentValue}
				colorPickerOptions={[
					{ value: "Default", label: "Default" },
					{ value: "Individual", label: "Individual" },
					{ value: "Subclass", label: "Subclass" },
				]}
				hasEditPermission={hasEditPermission}
			/>
		);
	};

	// Render the border subclass editor
	const renderBorderSubclassEditor = () => {
		if (!instance || isSubclass(instance) || isBorderSubclass(instance))
			return null;

		const currentValue =
			instance.borderColorPicker === "Individual"
				? "Individual"
				: instance?.Interrefs?.["Referenced Bsubclass"]?.tobjname ||
				  "No border subclass selected";

		return (
			<SubclassEditor<BorderColorPicker>
				title="Border Subclass"
				isEditing={isEditingBorderSubclass}
				availableSubclasses={availableBorderSubclasses}
				selectedSubclassId={selectedBorderSubclassId}
				setSelectedSubclassId={setSelectedBorderSubclassId}
				selectedColorPickerMode={selectedBorderColorPickerMode}
				setSelectedColorPickerMode={setSelectedBorderColorPickerMode}
				isUpdating={isUpdatingBorderSubclass}
				updateError={borderSubclassUpdateError}
				onUpdate={handleUpdateBorderSubclass}
				onCancel={handleCancelBorderSubclassEdit}
				onEdit={() => {
					setIsEditingBorderSubclass(true);
					setSelectedBorderColorPickerMode(
						instance.borderColorPicker || "Individual"
					);
				}}
				currentValue={currentValue}
				colorPickerOptions={[
					{ value: "Individual", label: "Individual" },
					{ value: "Subclass", label: "Subclass" },
				]}
				hasEditPermission={hasEditPermission}
			/>
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
									<tr key={title}>
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
							{renderSubclassEditor()}
							{renderBorderSubclassEditor()}
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
