import "./App.css";
import AppRouter from "./components/router/AppRouter";
import FEMProvider from "./state/FEMProvider";

function App() {
	return (
		<div className="App">
			<FEMProvider>
				<AppRouter />
			</FEMProvider>
		</div>
	);
}

export default App;
