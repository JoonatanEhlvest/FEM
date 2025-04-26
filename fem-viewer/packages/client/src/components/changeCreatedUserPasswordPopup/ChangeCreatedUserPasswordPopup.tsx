import React, { FC } from "react";
import http from "../../http";
import { CreatedUser } from "../dashboard/DashboardCreatedUsersList";
import useFEM from "../../state/useFEM";
import { useForm } from "../../hooks/useForm";
import styles from "./changeCreatedUserPasswordPopup.module.css";

type Props = {
	createdUser: CreatedUser;
	isOpen: boolean;
	onClose: () => void;
};

const ChangeCreatedUserPasswordPopup: FC<Props> = ({
	createdUser,
	isOpen,
	onClose,
}) => {
	const { setError, setPopup } = useFEM();
	const { state, handleChange, clearState } = useForm({
		password: "",
		confirmPassword: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!state.password || !state.confirmPassword) {
			setError({
				status: 422,
				message: "Please fill in all fields",
			});
			return;
		}

		if (state.password !== state.confirmPassword) {
			setError({
				status: 422,
				message: "Passwords don't match",
			});
			return;
		}

		http.patch(`/api/v1/users/${createdUser.id}/password`, {
			password: state.password,
		})
			.then((res) => {
				setPopup({ message: res.data.message });
				onClose();
				clearState();
			})
			.catch((err) => {
				setError({
					status: err.response?.status || 500,
					message: err.response?.data?.message || "An error occurred",
				});
			});
	};

	if (!isOpen) return null;

	return (
		<div className={styles["popup-overlay"]}>
			<div className={styles["popup-container"]}>
				<h2>Change Password for {createdUser.username}</h2>
				<form onSubmit={handleSubmit}>
					<div className={styles["form-group"]}>
						<label htmlFor="password">New Password</label>
						<input
							type="password"
							id="password"
							name="password"
							value={state.password}
							onChange={handleChange}
							minLength={6}
						/>
					</div>
					<div className={styles["form-group"]}>
						<label htmlFor="confirmPassword">
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							value={state.confirmPassword}
							onChange={handleChange}
							minLength={6}
						/>
					</div>
					<div className={styles["popup-actions"]}>
						<button type="submit">Change Password</button>
						<button type="button" onClick={onClose}>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ChangeCreatedUserPasswordPopup;
