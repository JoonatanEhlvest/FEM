import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import FEMState, { initialState } from "./state/FEMState";
import { checkLoggedIn } from "./utlitity/session";

const renderApp = (preloadedState: FEMState) => {
	const container = document.getElementById("root");
	if (!container) throw new Error("Root element not found");
	const root = createRoot(container);
	root.render(
		<React.StrictMode>
			<App preloadedState={preloadedState} />
		</React.StrictMode>
	);
};

(async () => renderApp(await checkLoggedIn(initialState)))();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
