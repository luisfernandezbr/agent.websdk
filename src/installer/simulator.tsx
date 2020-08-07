import React from 'react';
import Integration from './types';
import { IProcessingDetail, ISelfManagedAgent, ISession } from '../types';
import Installer from './index';
import styles from './styles.less';
import { Config } from 'index';

type Maybe<T> = T | undefined | null;

const sleep = (t: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, t);
	});
};

const setInstallEnabled = async () => {
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

const onAuth1Connect = async (integration: Integration, url: string) => {
	await sleep(2000);
};

const onValidateDefault = async (integration: Integration, config: Config) => {
	await sleep(2000);
	return {
		simulator: true,
	};
};

const setSelfManagedAgentRequired = () => {
	alert('In the app we would navigate to the self-managed agent install page');
};

const setPrivateKey = async () => {
};

const getPrivateKey =() => {
	return Promise.resolve(null);
};

const setInstallLocation = async () => {
};

const getEnv = () => {
	if ((window as any).PinpointEnv) {
		return (window as any).PinpointEnv;
	}
	const href = document.location.href;
	if (href.indexOf('.edge.pinpoint') > 0) {
		return 'edge';
	} else if (href.indexOf('.ppoint.io') > 0) {
		return 'edge';
	} else {
		return 'stable';
	}
};

const SimulatorInstaller = ({
	integration,
	processingDetail,
	onValidate,
	selfManagedAgent,
	session = {
		customer: {
			id: (window as any).PinpointAuth?.customer?.id ?? '1234',
			name: (window as any).PinpointAuth?.customer?.name ?? 'Test',
		},
		user: {
			id: (window as any).PinpointAuth?.user?.id ?? '999',
			name: (window as any).PinpointAuth?.user?.name ?? 'Test McTester',
			avatar_url: (window as any).PinpointAuth?.user?.avatar_url,
		},
		env: getEnv(),
		graphqlUrl: 'https://graph.api.pinpoint.com/graphql',
		authUrl: 'https://auth.api.pinpoint.com'
	}
}: {
	integration: Integration,
	processingDetail?: IProcessingDetail,
	onValidate?: (config: Config) => Promise<any>,
	selfManagedAgent?: Maybe<ISelfManagedAgent>,
	session?: Maybe<ISession>,
}) => {
	integration.installed = window.localStorage.getItem(`installer.${integration.refType}`) === 'true';
	var conf: Config = JSON.parse(window.localStorage.getItem(`installer.config.${integration.refType}`))?.oauth2_auth || {};
	var auth = {};
	if (conf.oauth2_auth) {
		auth = conf.oauth2_auth
	} else if (conf.oauth1_auth) {
		auth = conf.oauth1_auth
	} else if (conf.basic_auth) {
		auth = conf.basic_auth
	} else if (conf.apikey_auth) {
		auth = conf.apikey_auth
	}
	return (
		<Installer
			id="1234567790"
			className={styles.Simulator}
			integration={integration}
			processingDetail={processingDetail}
			authorization={auth}
			setInstallEnabled={setInstallEnabled}
			getConfig={getConfig}
			setConfig={setConfig}
			onRemove={onRemove}
			onInstall={onInstall}
			onAuth1Connect={onAuth1Connect}
			onValidate={onValidate ?? onValidateDefault}
			setSelfManagedAgentRequired={setSelfManagedAgentRequired}
			selfManagedAgent={selfManagedAgent}
			session={session}
			setPrivateKey={setPrivateKey}
			getPrivateKey={getPrivateKey}
			setInstallLocation={setInstallLocation}
		/>
	);
};

export default SimulatorInstaller;