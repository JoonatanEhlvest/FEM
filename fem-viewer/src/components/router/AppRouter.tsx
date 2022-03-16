import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppContainer from "../appContainer/AppContainer";
import FileUpload from "../fileUpload/FileUpload";

const AppRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/viewer/:id" element={<AppContainer />} />
				<Route path="/upload" element={<FileUpload />} />
			</Routes>
		</BrowserRouter>
	);
};

export default AppRouter;
