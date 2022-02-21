import useFEM from "../../state/useFEM";
import Model from "../Model";
import styles from "./viewer.module.css";

const Viewer = () => {
	const { getCurrentModel } = useFEM();

	const model = getCurrentModel();

	return (
		<div className={styles["viewer-container"]}>
			Current Model: {model && <Model model={model} />}
		</div>
	);
};

export default Viewer;
