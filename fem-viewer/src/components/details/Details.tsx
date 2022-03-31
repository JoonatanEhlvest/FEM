import Instance, { InterrefType, isSubclass } from "../../state/types/Instance";
import Reference from "../../state/types/Reference";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import Cell from "./Cell";
import styles from "./details.module.css";
import arrowRight from "./arrow-right.svg";

const Details = () => {
	const {
		getCurrentInstance,
		setCurrentInstance,
		goToReference,
		getInstancesThatReference,
		state,
	} = useFEM();

	const instance = getCurrentInstance();

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

	const renderInterModelReference = () => {
		if (!instance) return;
		return Object.entries(state.references).map(([refName, iref]) => {
			const refs = getInstancesThatReference(
				instance,
				refName as InterrefType
			);

			if (refs.length === 0) return;
			return (
				<div>
					<Cell
						title={refName}
						value={
							<div>
								{refs.map((ref) => {
									return (
										<div>
											{ref.referencedByModel} -{" "}
											{ref.referencedByInstance}
											<img
												src={arrowRight}
												alt="follow Reference"
											/>
										</div>
									);
								})}
							</div>
						}
					/>
				</div>
			);
		});
	};

	const renderInstanceSpecificReference = () => {
		if (!instance) return;
		if (!instance.Interrefs) return;
		return (
			<div>
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
								<div>{refName}</div>
								<div>{ref.tmodelname} - </div>
								<div>{ref.tobjname}</div>
								<img src={arrowRight} alt="follow Reference" />
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
									<Cell
										title={"Class"}
										value={instance.class}
									/>
									<Cell
										title={"Name"}
										value={instance.name}
									/>
									<Cell
										title={getTitle(instance)}
										value={getValue(instance)}
									/>
									<Cell
										title={"isGroup"}
										value={instance.isGroup ? "Yes" : "No"}
									/>
									<Cell
										title={"isGhost"}
										value={instance.isGhost ? "Yes" : "No"}
									/>
								</div>
							}
						/>
						<Cell
							title="Inter-model references"
							value={<div>{renderInterModelReference()}</div>}
						/>
						<Cell
							title="Single ref"
							value={
								<div>{renderInstanceSpecificReference()}</div>
							}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default Details;
