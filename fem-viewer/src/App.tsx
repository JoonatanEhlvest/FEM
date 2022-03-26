import { FC } from "react";
import "./App.css";
import AppRouter from "./components/router/AppRouter";
import FEMProvider from "./state/FEMProvider";
import FEMState from "./state/FEMState";

type Props = {
	preloadedState: FEMState;
};

const App: FC<Props> = (props: Props) => {
	return (
		<div className="App">
			<FEMProvider preloadedState={props.preloadedState}>
				<AppRouter />
			</FEMProvider>
		</div>
	);
};

export default App;
