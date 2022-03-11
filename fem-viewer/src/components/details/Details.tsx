import Reference from "../../state/types/Reference";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import Cell from "./Cell";
import styles from "./details.module.css";

const Details = () => {
	const { getCurrentInstance, goToReference } = useFEM();

	const instance = getCurrentInstance();

	const handleGoToReference = (ref: Reference | null) => {
		if (ref === null) {
			return;
		}
		goToReference(ref);
	};

	return (
		<div style={{ flexGrow: 1 }}>
			<div className={styles["details-container"]}>
				<Header>
					<div>Details</div>
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
									<Cell title={"ID"} value={instance.id} />
									<Cell
										title={"Denomination"}
										value={instance.denomination}
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

						{instance.reference && (
							<Cell
								title={"Reference"}
								value={
									<div>
										<Cell
											title={"Model"}
											value={instance.reference.modelName}
										/>
										<Cell
											title={"Instance"}
											value={
												instance.reference
													.referencedInstanceName
											}
										/>
										<Cell
											title={"Reference type"}
											value={instance.reference.type}
										/>
										<Cell
											title={"Follow reference"}
											value={
												<div
													onClick={() =>
														handleGoToReference(
															instance.reference
														)
													}
												>
													<button>GO</button>
												</div>
											}
										/>
									</div>
								}
							/>
							// <div>
							// 	Reference
							// 	<div>Model: {instance.reference.modelName}</div>
							// 	<div>
							// 		instance:{" "}
							// 		{instance.reference.referencedInstanceName}
							// 	</div>
							// 	<div
							// 		onClick={() =>
							// 			handleGoToReference(instance.reference)
							// 		}
							// 	>
							// 		GO TO REFERENCE
							// 	</div>
							// </div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Details;
