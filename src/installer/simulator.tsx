import React from 'react';
import Integration from './types';
import { IProcessingDetail } from '../types';
import Installer from './index';
import styles from './styles.less';
import { Config } from 'index';

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
	window.location.reload();
};

const onInstall = async (integration: Integration) => {
	window.localStorage.setItem(`installer.${integration.refType}`, 'true');
};

const SimulatorInstaller = ({ integration, processingDetail }: { integration: Integration, processingDetail?: IProcessingDetail }) => {
	integration.installed = window.localStorage.getItem(`installer.${integration.refType}`) === 'true';
	var conf: Config = JSON.parse(window.localStorage.getItem(`installer.config.${integration.refType}`))?.oauth2_auth || {};
	var auth = {};
	if (conf.oauth2_auth) {
		auth = conf.oauth2_auth
	} else if (conf.basic_auth) {
		auth = conf.basic_auth
	} else if (conf.apikey_auth) {
		auth = conf.apikey_auth
	}
	return (
		<Installer
			className={styles.Simulator}
			integration={integration}
			processingDetail={processingDetail}
			authorization={auth}
			setInstallEnabled={setInstallEnabled}
			getConfig={getConfig}
			setConfig={setConfig}
			onRemove={onRemove}
			onInstall={onInstall}
		/>
	);
};

export default SimulatorInstaller;