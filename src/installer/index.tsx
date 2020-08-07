import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Dialog, Icon, Loader } from '@pinpt/uic.next';
import { Header } from './components';
import Integration from './types';
import Graphql from '../graphql';
export { default as Integration } from './types';
import { IProcessingDetail, IAppAuthorization, OAuthVersion, ISelfManagedAgent, ISession, IInstalledLocation } from '../types';
import { Config } from '../config';
import styles from './styles.less';

const debug = true;

type Maybe<T> = T | undefined | null;

const SOURCE = 'agent.websdk';

export interface InstallerProps {
	id: string;
	className?: Maybe<string>;
	integration: Integration;
	processingDetail?: Maybe<IProcessingDetail>;
	authorization?: Maybe<IAppAuthorization>;
	session?: Maybe<ISession>;
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

const getDomain = (env: string) => env === 'edge' ? 'edge.pinpoint.com' : 'pinpoint.com';

const Installer = (props: InstallerProps) => {
	const ref = useRef<any>();
	const [isInstalled, setIsInstalled] = useState(props.integration.installed);
	const [installEnabled, setInstallEnabled] = useState(false);
	const currentConfig = useRef<Config>({});
	const [showDialog, setShowDialog] = useState(false);
	const [oauthURL, setOAuthURL] = useState('');
	const loaded = useRef(false);
	const [ready, setReady] = useState(false);

	const onLoad = useCallback(() => {
		if (!loaded.current) {
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
				session: props.session,
			}, '*');
			loaded.current = true;
		}
	}, [ref, isInstalled, loaded.current]);
	useEffect(() => {
		const handler = async (e: any) => {
			const { data } = e;
			const { scope, command, refType, source } = data;
			if (scope === 'INTEGRATION' && source === SOURCE ) {
				if (debug) console.log('Installer:: handler received', data, 'window', ref.current, 'stack', new Error().stack);
				switch (command) {
					case 'init': {
						ref.current.style.display = '';
						setReady(true);
						break;
					}
					case 'setInstallEnabled': {
						const { value } = data;
						await props.setInstallEnabled(props.integration, value);
						setInstallEnabled(value);
						break;
					}
					case 'getConfig': {
						let config = await props.getConfig(props.integration);
						if (!config) {
							config = {};
						}
						currentConfig.current = config;
						ref.current.contentWindow.postMessage({ command: 'getConfig', source: SOURCE, config }, '*');
						break;
					}
					case 'setConfig': {
						const { value } = data;
						props.setConfig(props.integration, value);
						if (JSON.stringify(currentConfig.current) !== JSON.stringify(value)) {
							currentConfig.current = value;
							ref.current.contentWindow.postMessage({ command: 'setConfig', source: SOURCE, config: value }, '*');
						}
						break;
					}
					case 'setAppOAuthURL': {
						const { url } = data;
						setOAuthURL(url);
						break;
					}
					case 'getRedirectURL': {
						const redirectURL = document.location.href;
						const sep = redirectURL.indexOf('?') > 0 ? '&' : '?';
						const url = redirectURL + (redirectURL.indexOf('integration=') < 0 ? sep + 'integration=redirect' : '');
						ref.current.contentWindow.postMessage({ command: 'getRedirectURL', source: SOURCE, url }, '*');
						break;
					}
					case 'getAppOAuthURL': {
						const { redirectTo, version, baseuri } = data;
						let url: string
						if (oauthURL !== '') {
							url = oauthURL;
						} else {
							const oauthVersion = version === OAuthVersion.Version1 ? 'oauth1' : 'oauth';
							url = `${props.session.authUrl}/${oauthVersion}/${refType}`;
							if (version === OAuthVersion.Version1) {
								url += `/${props.id}/${encodeURIComponent(baseuri)}`;
							}
						}
						const sep = url.indexOf('?') > 0 ? '&' : '?';
						url += `${sep}redirect_to=${encodeURIComponent(redirectTo)}`
						ref.current.contentWindow.postMessage({ command: 'getAppOAuthURL', source: SOURCE, url }, '*');
						break;
					}
					case 'setRedirectTo': {
						const { url } = data;
						window.location.href = url;
						break;
					}
					case 'setOAuth1Connect': {
						const { url } = data;
						try {
							await props.onAuth1Connect(props.integration, url);
						} catch (err) {
							ref.current.contentWindow.postMessage({ command: 'setOAuth1Connect', source: SOURCE, err }, '*');
						}
						break;
					}
					case 'setValidate': {
						const { config } = data;
						try {
							const result = await props.onValidate(props.integration, config);
							ref.current.contentWindow.postMessage({ command: 'setValidate', source: SOURCE, result }, '*');
						} catch (err) {
							ref.current.contentWindow.postMessage({ command: 'setValidate', source: SOURCE, err }, '*');
						}
						break;
					}
					case 'setSelfManagedAgentRequired': {
						props.setSelfManagedAgentRequired();
						ref.current.contentWindow.postMessage({ command: 'setSelfManagedAgentRequired', source: SOURCE }, '*');
						break;
					}
					case 'createPrivateKey': {
						try {
							// we should probably pass this in since it can be overriden by environment
							const [data] = await Graphql.query(props.session.graphqlUrl, privateKeyQuery);
							const privateKey = data?.custom.agent.privateKey;
							ref.current.contentWindow.postMessage({
								command: 'createPrivateKey',
								source: SOURCE,
								result: privateKey,
							}, '*');
						} catch (err) {
							ref.current.contentWindow.postMessage({
								command: 'createPrivateKey',
								source: SOURCE,
								err,
							}, '*');
						}
						break;
					}
					case 'setPrivateKey': {
						const { value } = data;
						await props.setPrivateKey(props.integration, value);
						ref.current.contentWindow.postMessage({ command: 'setPrivateKey', source: SOURCE }, '*');
						break;
					}
					case 'getPrivateKey': {
						const value = await props.getPrivateKey(props.integration);
						ref.current.contentWindow.postMessage({ command: 'getPrivateKey', source: SOURCE, value }, '*');
						break;
					}
					case 'setInstallLocation': {
						const { value } = data;
						await props.setInstallLocation(props.integration, value);
						ref.current.contentWindow.postMessage({ command: 'setInstallLocation', source: SOURCE }, '*');
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
							ref.current.contentWindow.postMessage({
								command: 'fetch',
								source: SOURCE,
								statusCode: o?.statusCode ?? statusCode,
								headers: o?.headers,
								body: o?.body,
							}, '*');
						} catch (err) {
							ref.current.contentWindow.postMessage({
								command: 'fetch',
								source: SOURCE,
								err,
							}, '*');
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
			window.removeEventListener('message', handler);
		};
	}, [oauthURL]);
	const dialogCancel = useCallback(() => {
		setShowDialog(false);
	}, []);
	const dialogSubmit = useCallback(async () => {
		setShowDialog(false);
		// this is a removal
		setIsInstalled(false);
		setInstallEnabled(false);
		await props.onRemove(props.integration);
	}, []);
	const handleInstall = useCallback(async () => {
		if (isInstalled) {
			setShowDialog(true);
		} else {
			// this is an install
			await props.onInstall(props.integration);
			setIsInstalled(true);
		}
	}, [isInstalled]);
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
							<Icon icon="trash" />
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
			{!ready && <Loader screen />}
			<Frame
				ref={ref}
				name={props.integration.name}
				url={props.integration.uiURL}
				onLoad={onLoad}
			/>
		</div>
	);
};

export default Installer;