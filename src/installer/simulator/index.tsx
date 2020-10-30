import React, { useCallback, useEffect, useState } from 'react';
import Integration from '../types';
import { IProcessingDetail, ISelfManagedAgent, ISession, IUpgradeRequired, ToastOptions } from '../../types';
import Installer from '../index';
import styles from './../styles.less';
import { Config } from 'index';
import { default as Toast } from './toast/index'
import { useToasts, ToastProvider, Options } from 'react-toast-notifications';

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

const defaultGetPrivateKey = () => {
	return Promise.resolve(null);
};

const setInstallLocation = async () => {
};

const setUpgradeComplete = async () => {
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


interface ToastParams {
	message: string;
	options: ToastOptions;
}

const ToastContainer = ({ toastParams }: { toastParams: ToastParams }) => {
	const { addToast } = useToasts();

	useEffect(() => {
		if (toastParams) {
			const opts: ToastOptions = toastParams.options;
			addToast(toastParams.message, {
				appearance: opts.appearance,
				autoDismiss: opts.autoDismiss,
				onDismiss: (id: string) => {
					if (opts.onDismiss) {
						opts.onDismiss(id);
					}
				}
			});
		}
	}, [toastParams])
	return (<></>);
}
const SimulatorInstaller = ({
	id = '1234567890',
	integration,
	processingDetail,
	upgradeRequired,
	onValidate,
	selfManagedAgent,
	getPrivateKey = defaultGetPrivateKey,
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
	id?: string,
	integration: Integration,
	processingDetail?: IProcessingDetail,
	upgradeRequired?: Maybe<IUpgradeRequired>,
	onValidate?: (config: Config) => Promise<any>,
	selfManagedAgent?: Maybe<ISelfManagedAgent>,
	session?: Maybe<ISession>,
	getPrivateKey?: Maybe<() => Promise<string>>,
}) => {
	integration.installed = window.localStorage.getItem(`installer.${integration.refType}`) === 'true';

	const [toastParams, setToastParams] = useState<ToastParams>()
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
	// the ToastContainer is a workaround only for the simulator. The toast only works inside a ToastProvider,
	// no need to change the webapp since it has it at the root of the hierarchy
	const addToast = (message: string, options: ToastOptions) => {
		setToastParams({ message, options })
	}
	return (
		<>
			<ToastProvider
				autoDismiss
				placement="bottom-right"
				components={{ Toast }}
			>
				<ToastContainer toastParams={toastParams}></ToastContainer>
				<Installer
					id={id}
					className={styles.Simulator}
					integration={integration}
					processingDetail={processingDetail}
					upgradeRequired={upgradeRequired}
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
					setUpgradeComplete={setUpgradeComplete}
					addToast={addToast}
				/>
			</ToastProvider>
		</>
	);
};

export default SimulatorInstaller;