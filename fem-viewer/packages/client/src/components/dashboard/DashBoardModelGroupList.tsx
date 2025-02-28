import React, { FC } from "react";
import { User } from "../../state/FEMState";
import AuthComponent from "../auth/AuthComponent";
import { UserRole } from "./Dashboard";
import styles from "./dashboard.module.css";
import ModelGroupListItem from "./ModelGroupListItem";

interface Props {
	modelGroups: User["modelGroups"];
	removeModelGroup: (id: string) => void;
}

const split = <T,>(arr: Array<T>, filter: (item: T) => boolean): [T[], T[]] => {
	const first: T[] = [];
	const second: T[] = [];

	arr.forEach((item) => {
		if (filter(item)) {
			first.push(item);
		} else {
			second.push(item);
		}
	});

	return [first, second];
};

const DashBoardModelGroupList: FC<Props> = ({
	modelGroups,
	removeModelGroup,
}) => {
	const [ownedModelGroups, notOwnedModelGroups] = split(
		modelGroups,
		(m) => m.owner
	);

	const ownedModelGroupsRolesAllowed = [UserRole.DEVELOPER, UserRole.ADMIN];

	return (
		<div className={styles["modelgrouplist-container"]}>
			<AuthComponent rolesAllowed={ownedModelGroupsRolesAllowed}>
				<div className={styles["modelgrouplist-header"]}>
					Your Model Groups
				</div>
			</AuthComponent>
			<AuthComponent rolesAllowed={ownedModelGroupsRolesAllowed}>
				<div className={styles["modelgrouplist-list-container"]}>
					{ownedModelGroups.map((m) => {
						return (
							<ModelGroupListItem
								key={m.modelGroup.id}
								modelGroup={m}
								removeModelGroup={removeModelGroup}
							/>
						);
					})}
				</div>
			</AuthComponent>
			<div className={styles["modelgrouplist-header"]}>
				Model Groups Shared with you
			</div>
			<div className={styles["modelgrouplist-list-container"]}>
				{notOwnedModelGroups.map((m) => {
					return (
						<ModelGroupListItem
							key={m.modelGroup.id}
							modelGroup={m}
							removeModelGroup={removeModelGroup}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default DashBoardModelGroupList;
