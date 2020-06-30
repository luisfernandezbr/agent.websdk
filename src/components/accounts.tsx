import React, { useCallback, useState } from 'react';
import { Button, ListPanel, Theme } from '@pinpt/uic.next';
import { useIntegration } from '../useIntegration';
import { Checkbox } from './checkbox';
import { AskDialog } from './ask_dialog';
import { Config } from '../config';

export interface Account {
	id: string;
	name: string;
	description: string;
	avatarUrl: string;
	totalCount: number;
	type: 'USER' | 'ORG';
	public: boolean;
}

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
		<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
			<Checkbox checked={selected} onChange={onChange} />
			<img alt="" style={{marginLeft: '1rem'}} src={account.avatarUrl} width={20} height={20} />
			<span style={{marginLeft: '1rem'}}>{account.name}</span>
		</div>
	);
};

const tagStyles: React.CSSProperties = {
	display: 'inline-flex',
	boxSizing: 'border-box',
	fontSize: '11px',
	lineHeight: '1',
	color: 'rgb(48, 40, 57)',
	textAlign: 'center',
	whiteSpace: 'nowrap',
	verticalAlign: 'middle',
	fontWeight: 'normal',
	padding: '0.4em 0.8em 0.4em',
	borderRadius: '2em',
	background: 'rgb(231, 225, 236)',
	marginRight: '0.5rem',
	marginLeft: 'auto',
};

const buildAccountRow = (entity: string, account: Account, config: Config, onClick: (account: Account) => void) => {
	return {
		key: account.id,
		left: <AccountSelector account={account} config={config} />,
		center: (
			<div style={{display: 'flex'}}>
				<span style={{marginLeft: '1rem', color: Theme.Royal300}}>{account.description}</span>
				<span style={tagStyles}>{account.public ? 'public' : 'private'}</span>
			</div>
		),
		right: (
			<div style={{width: '19rem', display: 'flex', justifyContent: 'flex-end'}}>
				<span style={{color: Theme.Mono500}}>{new Intl.NumberFormat().format(account.totalCount)} {entity}
				<Button onClick={() => onClick(account)} style={{marginLeft: '1rem', padding: '1px 5px'}}>+ Exclusions</Button></span>
			</div>
		),
	};
};

export const AccountsTable = ({title, accounts, button, entity, config}: {title: string, accounts: Account[], button?: React.ReactElement, entity: string, config: Config}) => {
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
		<>
			<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{fontSize: '1.4rem', marginBottom: '2rem'}}>
					{title}
				</div>
				<span style={{marginLeft: 'auto', marginBottom: '1rem'}}>{button}</span>
			</div>
			<ListPanel title="Accounts" rows={rows} empty={<>No accounts found</>} />
			<AskDialog
				textarea={true}
				value={exclusions}
				show={showAddExclusionModal}
				title="Add a set of ignore rules"
				text={`Enter ${entity} exclusion rules using .gitignore pattern:`}
				buttonOK="Add"
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
		</>
	);
};
