import { Instance, InterrefType, isSubclass } from "@fem-viewer/types/Instance";
import { Reference } from "@fem-viewer/types";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import styles from "./details.module.css";
import arrowRight from "./arrow-right.svg";
import { useCallback, useEffect, useState } from "react";
import model from "./model.svg";
import { InstanceClass } from "@fem-viewer/types";
import attrConfig from "../../assets/instanceAttrConfig.json";

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

		state,
	} = useFEM();

	const instance = getCurrentInstance();

	const [dropdowns, setDropdowns] = useState({
		interrefsOpen: false,
		singlerefsOpen: false,
	});

	useEffect(() => {
		setDropdowns((prev) => ({
			interrefsOpen: false,
			singlerefsOpen: false,
		}));
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
		if (!instance) return;
		if (!instance.Interrefs) return;
		return (
			<div className={styles["ref-container"]}>
				{/* <div
					className={styles["ref-header"]}
					onClick={() => toggleDropdown("singlerefsOpen")}
				>
					Single Ref
				</div> */}
				{[
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
				].map(({ ref, refName }) => {
					if (ref) {
						return (
							<div>
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
								{/* {dropdowns.singlerefsOpen && (
									<div className={styles["ref-item"]}>
										<img
											className={
												styles["ref-item-model-img"]
											}
											src={model}
											alt=""
										/>
										<div
											className={styles["ref-item-model"]}
										>
											{ref.tmodelname}
										</div>
										<div
											className={
												styles["ref-item-instance"]
											}
										>
											{ref.tobjname}
										</div>
										<img
											className={styles["ref-link"]}
											src={arrowRight}
											alt="follow Reference"
										/>{" "}
									</div>
								)} */}
							</div>
						);
					}
				})}
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
							{titles.map((title, i) => (
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
							))}
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
