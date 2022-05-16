import Instance, { InterrefType, isSubclass } from "../../state/types/Instance";
import Reference from "../../state/types/Reference";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import Cell from "./Cell";
import styles from "./details.module.css";
import arrowRight from "./arrow-right.svg";
import { useState } from "react";
import model from "./model.svg";
import InstanceClass from "../../state/types/InstanceClass";
import attrConfig from "../../assets/instanceAttrConfig.json";

const Details = () => {
	const {
		getCurrentInstance,
		setCurrentInstance,
		goToReference,
		getInstancesThatReference,
		goToAllOccurrences,
		state,
	} = useFEM();

	const instance = getCurrentInstance();

	const [dropdowns, setDropdowns] = useState({
		interrefsOpen: false,
		singlerefsOpen: false,
	});

	const handleGoToReference = (ref: Reference | null) => {
		if (ref === null) {
			return;
		}
		goToReference(ref);
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
	};

	const toggleDropdown = (dropdown: keyof typeof dropdowns) => {
		setDropdowns((prev) => ({
			...prev,
			[dropdown]: !prev[dropdown],
		}));
	};

	const renderAllOccurrences = () => {
		if (!instance) return;
		return (
			<div className={styles["ref-container"]}>
				<div
					className={styles["ref-header"]}
					onClick={() => toggleDropdown("interrefsOpen")}
				>
					All Occurrences
				</div>
				{dropdowns.interrefsOpen &&
					Object.entries(state.references).map(([refName, iref]) => {
						const refs = getInstancesThatReference(
							instance,
							refName as InterrefType
						);
						if (refs.length === 0) return;

						const refsByModelName: {
							[key: string]: Array<Reference>;
						} = {};

						refs.forEach((ref) => {
							if (refsByModelName[ref.referencedByModel]) {
								refsByModelName[ref.referencedByModel].push(
									ref
								);
							} else {
								refsByModelName[ref.referencedByModel] = [ref];
							}
						});

						console.log(refsByModelName);
						return (
							<div className={styles["interref-container"]}>
								<div className={styles["interref-title"]}>
									{refName}
								</div>
								{Object.entries(refsByModelName).map(
									([refModelName, refs]) => {
										return (
											<div
												className={styles["ref-item"]}
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
														styles["ref-item-model"]
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
					})}
			</div>
		);
	};

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
						ref: instance.Interrefs["Referened Pool"],
						refName: " Referenced Pool",
					},
					{
						ref: instance.Interrefs["Referenced External Actor"],
						refName: "Referenced External Actor",
					},
				].map(({ ref, refName }) => {
					if (ref)
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
				})}
			</div>
		);
	};

	return (
		<div style={{ flexGrow: 1 }}>
			<div className={styles["details-container"]}>
				<Header>
					<div className={styles["header-content"]}>
						<div>Details</div>
						<button onClick={handleClosePopup}>X</button>
					</div>
				</Header>

				{instance && (
					<div className={styles["details-content"]}>
						<Cell
							title="General Information"
							value={
								<div>
									{Object.entries(
										attrConfig[instance.class]
									).map(([attr, shouldShow]) => {
										if (!shouldShow) return;
										return (
											<Cell
												key={`${instance.id}-${attr}`}
												title={
													attr
														.charAt(0)
														.toUpperCase() +
													attr.slice(1)
												}
												value={
													instance[
														attr as keyof Instance
													] as string
												}
											/>
										);
									})}
								</div>
							}
						/>

						{renderAllOccurrences()}

						{renderInstanceSpecificReference()}
					</div>
				)}
			</div>
		</div>
	);
};

export default Details;
