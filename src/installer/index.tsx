import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Button, Dialog, Icon, Loader } from '@pinpt/uic.next';
import { Header } from './components';
import Integration from './types';
export { default as Integration } from './types';
import { IProcessingDetail, IAppAuthorization } from '../types';
import { Config } from '../config';
import styles from './styles.less';

type Maybe<T> = T | undefined | null;

export interface InstallerProps {
	className?: Maybe<string>;
	integration: Integration;
	processingDetail?: Maybe<IProcessingDetail>;
	authorization?: Maybe<IAppAuthorization>;
	setInstallEnabled: (integration: Integration, val: boolean) => Promise<void>;
	getConfig: (integration: Integration) => Promise<Config>;
	setConfig: (integration: Integration, config: Config) => Promise<void>;
	onRemove: (integration: Integration) => Promise<void>;
	onInstall: (integration: Integration) => Promise<void>;
}

const Frame = React.memo(React.forwardRef(({ url, name, onLoad }: any, ref: any) => {
	return (
		<iframe
			ref={ref}
			title={`integration-${name}`}
			src={url}
			onLoad={onLoad}
			sandbox="allow-scripts allow-popups allow-modals allow-forms"
			style={{ display: 'none' }}
			className={styles.Frame}
		>
		</iframe>
	);
}));

const Installer = (props: InstallerProps) => {
	const ref = useRef<any>();
	const [isInstalled, setIsInstalled] = useState(props.integration.installed);
	const [installEnabled, setInstallEnabled] = useState(false);
	const [, setConfig] = useState<any>();
	const [loaded, setLoaded] = useState(false);
	const [showDialog, setShowDialog] = useState(false);
	const [oauthURL, setOAuthURL] = useState('');

	const onLoad = useCallback(() => {
		if (!loaded) {
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
				url,
				installed: isInstalled,
				redirected,
				processingDetail: props.processingDetail
			}, '*');
			setTimeout(() => {
				if (ref.current) ref.current.style.display = '';
				setLoaded(true);
			}, 500);
		}
	}, [ref, isInstalled, loaded]);
	useEffect(() => {
		const handler = async (e: any) => {
			const { data } = e;
			const { scope, command, refType } = data;
			if (scope === 'INTEGRATION') {
				switch (command) {
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
						setConfig(config);
						ref.current.contentWindow.postMessage({ command: 'getConfig', config }, '*');
						break;
					}
					case 'setConfig': {
						const { value } = data;
						props.setConfig(props.integration, value);
						setConfig(value);
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
						ref.current.contentWindow.postMessage({ command: 'getRedirectURL', url }, '*');
						break;
					}
					case 'getAppOAuthURL': {
						const { redirectTo } = data;
						let url: string
						if (oauthURL !== '') {
							url = oauthURL;
						} else {
							let domain = '';
							const href = document.location.href;
							if (href.indexOf('.edge.pinpoint') > 0) {
								domain = 'edge.pinpoint.com';
							} else if (href.indexOf('.ppoint.io') > 0) {
								domain = 'edge.pinpoint.com';
							} else {
								domain = 'pinpoint.com';
							}
							url = `https://auth.api.${domain}/oauth/${refType}`;
						}
						if (url.indexOf('?') == -1) {
							url += '?';
						} else {
							url += '&';
						}
						url += `redirect_to=${encodeURIComponent(redirectTo)}`
						ref.current.contentWindow.postMessage({ command: 'getAppOAuthURL', url }, '*');
						break;
					}
					case 'setRedirectTo': {
						const { url } = data;
						window.location.href = url;
						break;
					}
					default: break;
				}
			}
		}
		window.addEventListener('message', handler);
		return () => {
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
			ref.current.contentWindow.postMessage({ command: 'handleAuthChange' }, '*');
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
			{!loaded && <Loader screen />}
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