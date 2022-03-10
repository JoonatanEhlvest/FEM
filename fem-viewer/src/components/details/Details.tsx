import Reference from "../../state/types/Reference";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
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
					<div>
						<div>{instance.class}</div>
						<div>{instance.id}</div>
						<div>{instance.denomination}</div>
						{instance.reference && (
							<div>
								Reference
								<div>Model: {instance.reference.modelName}</div>
								<div>
									instance:{" "}
									{instance.reference.referencedInstanceName}
								</div>
								<div
									onClick={() =>
										handleGoToReference(instance.reference)
									}
								>
									GO TO REFERENCE
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Details;
