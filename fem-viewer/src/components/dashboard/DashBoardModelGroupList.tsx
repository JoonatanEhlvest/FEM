import React, { FC } from "react";
import { ModelGroup } from "./Dashboard";
import styles from "./dashboard.module.css";
import ModelGroupListItem from "./ModelGroupListItem";

interface Props {
	modelGroups: ModelGroup[];
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

	return (
		<div className={styles["modelgrouplist-container"]}>
			<div className={styles["modelgrouplist-header"]}>
				Your Model Groups
			</div>
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
