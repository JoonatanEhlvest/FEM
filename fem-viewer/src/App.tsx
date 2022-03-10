import { useState } from "react";
import "./App.css";
import AppContainer from "./components/appContainer/AppContainer";
import FileUpload from "./components/fileUpload/FileUpload";
import FEMProvider from "./state/FEMProvider";

function App() {
	const [filesUploaded, setFilesUploaded] = useState(false);

	return (
		<div className="App">
			<FEMProvider>
				{filesUploaded ? (
					<AppContainer />
				) : (
					<FileUpload toggleViewer={setFilesUploaded} />
				)}
			</FEMProvider>
		</div>
	);
}

export default App;
