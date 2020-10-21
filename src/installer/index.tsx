import React, { useEffect, useRef, useState } from 'react';
import Button from '@pinpt/uic.next/Button';
import Dialog from '@pinpt/uic.next/Dialog';
import Icon from '@pinpt/uic.next/Icon';
import Loader from '@pinpt/uic.next/Loader';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useCallbackOne as useCallback } from 'use-memo-one';
import { Header } from './components';
import Integration from './types';
import Graphql from '../graphql';
export { default as Integration } from './types';
import { IProcessingDetail, IAppAuthorization, OAuthVersion, ISelfManagedAgent, ISession, IInstalledLocation, IUpgradeRequired, ToastOptions } from '../types';
import { Config } from '../config';
import styles from './styles.less';
import { Message } from '@pinpt/uic.next';

const debug = typeof (document) === 'object' ? /(\.edge\.pinpoint\.com|\.ppoint\.io|\.pinpt\.vercel\.app)/.test(document.location.origin) : false;

type Maybe<T> = T | undefined | null;

const SOURCE = 'agent.websdk';

export interface InstallerProps {
	id: string;
	className?: Maybe<string>;
	integration: Integration;
	processingDetail?: Maybe<IProcessingDetail>;
	authorization?: Maybe<IAppAuthorization>;
	session?: Maybe<ISession>;
	upgradeRequired?: Maybe<IUpgradeRequired>;
	hideHeader?: boolean;
	location?: Maybe<IInstalledLocation>;
	setInstallEnabled: (integration: Integration, val: boolean) => Promise<void>;
	getConfig: (integration: Integration) => Promise<Config>;
	setConfig: (integration: Integration, config: Config) => Promise<void>;
	onRemove: (integration: Integration) => Promise<void>;
	onInstall: (integration: Integration) => Promise<void>;
	onAuth1Connect: (integration: Integration, url: string) => Promise<void>;
	onValidate: (integration: Integration, config: Config) => Promise<any>;
	setSelfManagedAgentRequired: () => void;
	selfManagedAgent?: Maybe<ISelfManagedAgent>;
	setPrivateKey: (integration: Integration, key: string) => Promise<void>;
	getPrivateKey: (integration: Integration) => Promise<string | null>;
	setInstallLocation: (integration: Integration, location: IInstalledLocation) => Promise<void>;
	setUpgradeComplete: (integration: Integration) => Promise<void>;
	addToast: (message:string, options:ToastOptions) => void;
}

const Frame = React.memo(React.forwardRef(({ url, name, onLoad }: any, ref: any) => {
	return (
		<iframe
			ref={ref}
			title={`integration-${name}`}
			src={url}
			onLoad={onLoad}
			sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-modals allow-forms allow-same-origin"
			style={{ display: 'none' }}
			className={styles.Frame}
		>
		</iframe>
	);
}));

const fetchQuery = `query fetch($url: String!, $method: String, $headers: [AgentFetchHeaderInput!]) {
	custom {
		agent {
			fetch(method: $method, url: $url, headers: $headers) {
				statusCode
				body
				headers {
					key
					value
				}
			}
		}
	}
}`;

const privateKeyQuery = `query privatekey {
	custom {
		agent {
			privateKey
		}
	}
}`;


const Installer = (props: InstallerProps) => {
	const ref = useRef<any>();
	const [isInstalled, setIsInstalled] = useState(props.integration?.installed);
	const [installEnabled, setInstallEnabled] = useState(false);
	const currentConfig = useRef<Config>({});
	const [showDialog, setShowDialog] = useState(false);
	const loaded = useRef(false);
	const oauthURL = useRef('');
	const [ready, setReady] = useState(false);

	const onLoad = useCallback(() => {
		if ((!loaded.current && ref.current) || ready) {
			const redirected = document.location.search.indexOf('integration=redirect') > 0;
			const url = document.location.href;
			if (redirected) {
				let currenturl = document.location.href;
				const i = currenturl.indexOf('?');
				if (i > 0) {
					currenturl = currenturl.substring(0, i);
				}
				window.history.pushState(null, window.document.title, currenturl);
			}
			ref.current.contentWindow.postMessage({
				command: 'INIT',
				source: SOURCE,
				id: props.id,
				url,
				installed: isInstalled,
				redirected,
				processingDetail: props.processingDetail,
				selfManagedAgent: props.selfManagedAgent,
				upgradeRequired: props.upgradeRequired,
				location: props.location,
				session: props.session,
			}, '*');
			loaded.current = true;
		}
		return () => {
			loaded.current = false;
			ref.current = false;
		};
	}, [ready, ref.current, isInstalled, loaded.current, props]);

	const deliverMessageToFrame = useCallback((command: string, args: any) => {
		if (ref.current) {
			if (debug) console.log('deliverMessageToFrame', command, args);
			ref.current.contentWindow.postMessage({ command, source: SOURCE, ...args }, '*');
		} else {
			if (debug) console.log('deliverMessageToFrame SKIPPED because ref.current is null', command, args);
		}
	}, [ref.current]);

	useEffect(() => {
		const handler = async (e: any) => {
			const { data } = e;
			const { scope, command, refType, source } = data;
			if (scope === 'INTEGRATION' && source === SOURCE) {
				if (debug) console.log('Installer:: handler received', data);
				switch (command) {
					case 'init': {
						ref.current.style.display = '';
						setReady(true);
						break;
					}
					case 'setInstallEnabled': {
						if (!ready) {
							ref.current.style.display = '';
							setReady(true);
						}
						const { value } = data;
						await props.setInstallEnabled(props.integration, value);
						setInstallEnabled(value);
						break;
					}
					case 'getConfig': {
						if (ref.current) {
							let config = await props.getConfig(props.integration);
							if (!config) {
								config = {};
							}
							currentConfig.current = config;
							deliverMessageToFrame('getConfig', { config });
						} else {
							if (debug) console.log('Installer:: getConfig ignored because iframe is being unloaded');
						}
						break;
					}
					case 'setConfig': {
						if (!ready) {
							ref.current.style.display = '';
							setReady(true);
						}
						const { value } = data;
						props.setConfig(props.integration, value);
						if (JSON.stringify(currentConfig.current) !== JSON.stringify(value)) {
							currentConfig.current = value;
							if (ref.current) {
								deliverMessageToFrame('setConfig', { config: value });
							} else {
								if (debug) console.log('Installer:: setConfig ignored because iframe is being unloaded');
							}
						}
						break;
					}
					case 'setAppOAuthURL': {
						if (!ready) {
							ref.current.style.display = '';
							setReady(true);
						}
						const { url } = data;
						oauthURL.current = url;
						break;
					}
					case 'getRedirectURL': {
						if (ref.current) {
							const redirectURL = document.location.href;
							const sep = redirectURL.indexOf('?') > 0 ? '&' : '?';
							const url = redirectURL + (redirectURL.indexOf('integration=') < 0 ? sep + 'integration=redirect' : '');
							deliverMessageToFrame('getRedirectURL', { url });
						} else {
							if (debug) console.log('Installer:: getRedirectURL ignored because iframe is being unloaded');
						}
						break;
					}
					case 'getAppOAuthURL': {
						if (ref.current) {
							const { redirectTo, version, baseuri } = data;
							let url: string
							if (oauthURL.current) {
								url = oauthURL.current;
							} else {
								const oauthVersion = version === OAuthVersion.Version1 ? 'oauth1' : 'oauth';
								url = `${props.session.authUrl}/${oauthVersion}/${refType}`;
								if (version === OAuthVersion.Version1) {
									url += `/${props.id}/${encodeURIComponent(baseuri)}`;
								}
							}
							const user_id = props.session.user.id;
							const customer_id = props.session.customer.id;
							const sep = url.indexOf('?') > 0 ? '&' : '?';
							url += `${sep}redirect_to=${encodeURIComponent(redirectTo)}&customer_id=${customer_id}&user_id=${user_id}&integration_instance_id=${props.id}&mapping=true`;
							deliverMessageToFrame('getAppOAuthURL', { url });
						} else {
							if (debug) console.log('Installer:: getAppOAuthURL ignored because iframe is being unloaded');
						}
						break;
					}
					case 'setRedirectTo': {
						const { url } = data;
						window.location.href = url;
						break;
					}
					case 'setOAuth1Connect': {
						if (ref.current) {
							const { url } = data;
							try {
								await props.onAuth1Connect(props.integration, url);
							} catch (err) {
								deliverMessageToFrame('setOAuth1Connect', { err });
							}
						} else {
							if (debug) console.log('Installer:: setOAuth1Connect ignored because iframe is being unloaded');
						}
						break;
					}
					case 'setValidate': {
						if (ref.current) {
							const { config } = data;
							try {
								const result = await props.onValidate(props.integration, config);
								deliverMessageToFrame('setValidate', { result });
							} catch (err) {
								console.error(err);
								deliverMessageToFrame('setValidate', { err });
							}
						} else {
							if (debug) console.log('Installer:: setValidate ignored because iframe is being unloaded');
						}
						break;
					}
					case 'setSelfManagedAgentRequired': {
						props.setSelfManagedAgentRequired();
						if (ref.current) {
							deliverMessageToFrame('setSelfManagedAgentRequired', {});
						} else {
							if (debug) console.log('Installer:: setSelfManagedAgentRequired ignored because iframe is being unloaded');
						}
						break;
					}
					case 'createPrivateKey': {
						try {
							// we should probably pass this in since it can be overriden by environment
							const [data] = await Graphql.query(props.session.graphqlUrl, privateKeyQuery);
							const privateKey = data?.custom.agent.privateKey;
							if (ref.current) {
								deliverMessageToFrame('createPrivateKey', { result: privateKey });
							} else {
								if (debug) console.log('Installer:: createPrivateKey ignored because iframe is being unloaded');
							}
						} catch (err) {
							if (ref.current) {
								deliverMessageToFrame('createPrivateKey', { err });
							} else {
								console.error(err);
								if (debug) console.log('Installer:: createPrivateKey ignored because iframe is being unloaded');
							}
						}
						break;
					}
					case 'setPrivateKey': {
						const { value } = data;
						await props.setPrivateKey(props.integration, value);
						if (ref.current) {
							deliverMessageToFrame('setPrivateKey', {});
						} else {
							if (debug) console.log('Installer:: setPrivateKey ignored because iframe is being unloaded');
						}
						break;
					}
					case 'getPrivateKey': {
						const value = await props.getPrivateKey(props.integration);
						if (ref.current) {
							deliverMessageToFrame('getPrivateKey', { value });
						} else {
							if (debug) console.log('Installer:: getPrivateKey ignored because iframe is being unloaded');
						}
						break;
					}
					case 'setInstallLocation': {
						const { value } = data;
						await props.setInstallLocation(props.integration, value);
						if (ref.current) {
							deliverMessageToFrame('setInstallLocation', {});
						} else {
							if (debug) console.log('Installer:: setInstallLocation ignored because iframe is being unloaded');
						}
						break;
					}
					case 'setUpgradeComplete': {
						await props.setUpgradeComplete(props.integration);
						if (ref.current) {
							deliverMessageToFrame('setUpgradeComplete', {});
						} else {
							if (debug) console.log('Installer:: setUpgradeComplete ignored because iframe is being unloaded');
						}
						break;
					}
					case 'addToast': {
						if (ref.current) {
							const {message,options} = data;
							props.addToast(message, options);
						} else {
							if (debug) console.log('Installer:: setUpgradeComplete ignored because iframe is being unloaded');
						}
						break;
					}
					case 'fetch': {
						const { url, method, headers } = data;
						const h: any[] = [];
						if (headers) {
							Object.keys(headers).forEach((key: any) => {
								// can't set any pinpt- headers
								if (key.indexOf('pinpt-') < 0) {
									h.push({
										key,
										value: headers[key],
									});
								}
							});
						}
						const vars = {
							url,
							method,
							headers: h,
						};
						try {
							const graphHeaders: any = {};
							const [data, statusCode] = await Graphql.query(props.session.graphqlUrl, fetchQuery, vars, graphHeaders);
							const o = data?.custom?.agent?.fetch;
							if (ref.current) {
								deliverMessageToFrame('fetch', { statusCode: o?.statusCode ?? statusCode, headers: o?.headers, body: o?.body });
							} else {
								if (debug) console.log('Installer:: fetch ignored because iframe is being unloaded');
							}
						} catch (err) {
							if (ref.current) {
								deliverMessageToFrame('fetch', { err });
							} else {
								console.error(err);
							}
						}
						break;
					}
					default: break;
				}
			}
		}
		window.addEventListener('message', handler);
		return () => {
			if (debug) console.log('Installer:: cleanup');
			ref.current = null;
			window.removeEventListener('message', handler);
		};
	}, []);
	const dialogCancel = useCallback(() => {
		loaded.current = false; // force a reload
		setShowDialog(false);
	}, []);
	const dialogSubmit = useCallback(async () => {
		setShowDialog(false);
		// this is a removal
		setIsInstalled(false);
		setInstallEnabled(false);
		await props.onRemove(props.integration);
		loaded.current = false;
	}, []);
	const handleInstall = useCallback(async (action: 'install' | 'remove') => {
		if (action === 'remove') {
			setShowDialog(true);
		} else {
			await props.onInstall(props.integration);
			setIsInstalled(true);
		}
	}, [props, setShowDialog, setIsInstalled]);
	const handleAuthChange = useCallback(() => {
		if (ref.current) {
			ref.current.contentWindow.postMessage({ command: 'handleAuthChange', source: SOURCE }, '*');
		}
	}, [ref.current]);
	if (showDialog) {
		return (
			<Dialog>
				<h1>Confirm Account Deletion</h1>
				<p>
					Are you sure you want to remove <strong>{props.integration.name}</strong>?
				</p>
				<div className="buttons">
					<Button color="Mono" weight={500} onClick={dialogCancel}>Cancel</Button>
					<Button color="Red" weight={500} onClick={dialogSubmit}>
						<>
							<Icon icon={faTrash} />
							Delete Account
						</>
					</Button>
				</div>
			</Dialog>
		);
	}
	const authDate = props.authorization?.authorizer?.created;
	const authName = props.authorization?.authorizer?.name;
	return (
		<div className={[styles.Wrapper, props.className].join(' ')}>
			{!props.hideHeader && (
				<Header
					name={props.integration.name}
					tags={props.integration.tags}
					description={props.integration.description}
					installed={isInstalled}
					authorized={authDate > 0}
					authDate={authDate}
					authName={authName}
					enabled={installEnabled}
					icon={props.integration.icon}
					publisher={props.integration.publisher}
					hasError={props.integration.errored}
					errorMessage={props.integration.errorMessage}
					handleInstall={handleInstall}
					handleChangeAuth={handleAuthChange}
				/>
			)}
			{!ready && <Loader centered />}
			<Frame
				ref={ref}
				name={props.integration.name}
				url={props.integration.uiURL}
				onLoad={onLoad}
			/>
		</div>
	);
};

export default React.memo(Installer);