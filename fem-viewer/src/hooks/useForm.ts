import { ChangeEvent, useState } from "react";

export const useForm = <T>(initialState: T) => {
	const [state, setState] = useState(initialState);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setState((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	return { state, handleChange };
};
