import React, { useCallback, useState } from 'react';
import { Button, ListPanel, Icon, Tooltip, Theme } from '@pinpt/uic.next';
import { useIntegration } from '../../useIntegration';
import { AskDialog } from '../AskDialog';
import { Config } from '../../config';
import styles from './styles.less';

export interface Account {
	id: string;
	name: string;
	description: string;
	avatarUrl?: string;
	totalCount: number;
	type: 'USER' | 'ORG';
	public: boolean;
}

interface AccountsTableProps {
	description: string,
	accounts: Account[],
	button?: React.ReactElement,
	entity: string,
	config: Config
}

const pluralize = (value: number, singular: string, plural?: string) => {
	return (value === 1) ? `${new Intl.NumberFormat().format(value)} ${singular}` : `${new Intl.NumberFormat().format(value)} ${plural || `${singular}s`}`;
};

const ucFirst = (str: string) => {
	return str?.length ? str.charAt(0).toUpperCase() + str.substr(1) : str;
};

const AccountSelector = ({account, config}: {account: Account, config: Config}) => {
	const { setConfig, setInstallEnabled, installed } = useIntegration();
	const [selected, setSelected] = useState<boolean>(!!config.accounts?.[account.id]);
	const onChange = useCallback((val: boolean) => {
		setSelected(val);
		if (val) {
			config.accounts[account.id] = account;
		} else {
			delete config.accounts[account.id];
		}
		setInstallEnabled(installed ? true : Object.keys(config.accounts).length > 0);
		setConfig(config);
	}, [setSelected, setConfig, setInstallEnabled, account, config, installed]);

	return (
		<input
			type="checkbox"
			checked={selected}
			onChange={() => {
				if (onChange) {
					onChange(!selected);
				}
			}}
		/>
	);
};

const buildAccountRow = (entity: string, account: Account, config: Config, onClick: (account: Account) => void) => {
	const accountError = false; // TODO

	return {
		key: account.id,
		className: accountError ? styles.Error : null,
		left: (
			<div className={styles.Account}>
				{
					!accountError ? (
						<AccountSelector account={account} config={config} />
					) : (
						<Tooltip
							content={(
								<>
									TODO: Error message goes here
								</>
							)}
						>
							<Icon icon={['fas', 'exclamation-triangle']} color={Theme.Red500} />
						</Tooltip>
					)
				}

				{ account.avatarUrl && <img alt={account.name} src={account.avatarUrl} /> }

				<span>
					{account.name}
				</span>
			</div>
		),
		center: (
			<span className={styles.Subtext}>{account.description}</span>
		),
		right: (
			<>
				<span className={styles.EntityCount}>
					{pluralize(account.totalCount, entity.toLowerCase())}
				</span>
				<Button
					onClick={() => onClick(account)}
					color="Red"
					weight={300}
				>
					Manage Exclusions
				</Button>
			</>
		),
	};
};

export const AccountsTable = ({description, accounts, entity, config}: AccountsTableProps) => {
	const { setConfig } = useIntegration();
	const [showAddExclusionModal, setShowAddExclusionModal] = useState(false);
	const [account, setAccount] = useState<Account>();
	const [exclusions, setExclusions] = useState('');
	const doShowAddExclusionModal = useCallback((account: Account) => {
		setShowAddExclusionModal(true);
		setAccount(account);
		setExclusions((config.exclusions || {})[account.id] || '');
	}, [config, setExclusions, setAccount, setShowAddExclusionModal]);

	const rows = accounts.map((account: Account) => {
		return buildAccountRow(entity, account, config, doShowAddExclusionModal)
	});

	return (
		<div className={styles.Wrapper}>
			<p className={styles.Description}>
				{description}
			</p>

			<ListPanel
				title="Accounts"
				rows={rows}
				empty={<>No accounts found</>}
				className={styles.Accounts}
			/>

			<AskDialog
				open={showAddExclusionModal}
				title={`Manage ${ucFirst(entity)} Exclusions`}
				text={(
					<>
						Enter your exclusion rules below using <a href="https://git-scm.com/docs/gitignore" target="_blank" rel="noopener noreferrer">.gitignore</a> syntax:
					</>
				)}
				textArea={true}
				value={exclusions}
				buttonSaveText="Save"
				onCancel={() => setShowAddExclusionModal(false)}
				onChange={(val: string) => setExclusions(val)}
				onSubmit={() => {
					const excl = config.exclusions || {};
					excl[account?.id!] = exclusions;
					config.exclusions = excl;
					setShowAddExclusionModal(false);
					setAccount(undefined);
					setExclusions('');
					setConfig(config);
				}}
			/>
		</div>
	);
};
