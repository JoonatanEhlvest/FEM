import React, { FC } from "react";
import * as Dialog from '@radix-ui/react-dialog';
import styles from "./confirmationPopup.module.css";

type Props = {
	showCondition: boolean;
	handleConfirm: () => void;
	toggleConfirmation: (value: boolean) => void;
	message: string;
};

const ConfirmationPopup: FC<Props> = ({
	showCondition,
	handleConfirm,
	toggleConfirmation,
	message,
}) => {
	return (
		<Dialog.Root open={showCondition} onOpenChange={toggleConfirmation}>
			<Dialog.Portal>
				<Dialog.Overlay className={styles["dialog-overlay"]} />
				<Dialog.Content className={styles["dialog-content"]}>
					<div>{message}</div>
					<div className={styles["btn-container"]}>
						<button
							className={styles["btn-confirm"]}
							onClick={handleConfirm}
						>
							Delete
						</button>
						<Dialog.Close asChild>
							<button className={styles["btn-close"]}>
								X
							</button>
						</Dialog.Close>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default ConfirmationPopup;
