import React from 'react';
import Integration from './types';
import Installer from './index';
import styles from './styles.less';

const setInstallEnabled = async (integration: Integration) => {
};

const getConfig = async (integration: Integration) => {
	return Promise.resolve(JSON.parse(window.localStorage.getItem(`installer.config.${integration.refType}`) || '{}'));
};

const setConfig = async (integration: Integration, config: { [key: string]: any }) => {
	window.localStorage.setItem(`installer.config.${integration.refType}`, JSON.stringify(config));
};

const onRemove = async (integration: Integration) => {
	window.localStorage.removeItem(`installer.${integration.refType}`);
	window.localStorage.removeItem(`installer.config.${integration.refType}`);
};

const onInstall = async (integration: Integration) => {
	window.localStorage.setItem(`installer.${integration.refType}`, 'true');
};

const SimulatorInstaller = ({ integration }: { integration: Integration }) => {
	integration.installed = window.localStorage.getItem(`installer.${integration.refType}`) === 'true';
	return (
		<Installer
			className={styles.Simulator}
			integration={integration}
			setInstallEnabled={setInstallEnabled}
			getConfig={getConfig}
			setConfig={setConfig}
			onRemove={onRemove}
			onInstall={onInstall}
		/>
	);
};

export default SimulatorInstaller;