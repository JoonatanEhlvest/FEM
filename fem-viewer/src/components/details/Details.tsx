import useFEM from "../../state/useFEM";
import styles from "./details.module.css";

const Details = () => {
	const { getCurrentInstance } = useFEM();

	const instance = getCurrentInstance();

	return (
		<div style={{ flexGrow: 1 }}>
			<div className={styles["details-container"]}>
				<div>Details</div>
				{instance && (
					<div>
						<div>{instance.class}</div>
						<div>{instance.id}</div>
						<div>{instance.denomination}</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Details;
