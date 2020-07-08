import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader } from '@pinpt/uic.next';
import { Header } from './components';
import Integration from './types';
export { default as Integration } from './types';
import { Config } from '../config';
import styles from './styles.less';

export interface InstallerProps {
	className?: string;
	integration: Integration;
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
			sandbox="allow-scripts allow-popups allow-modals"
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
					case 'getRedirectURL': {
						const redirectURL = document.location.href;
						const sep = redirectURL.indexOf('?') > 0 ? '&' : '?';
						const url = redirectURL + (redirectURL.indexOf('integration=') < 0 ? sep + 'integration=redirect' : '');
						ref.current.contentWindow.postMessage({ command: 'getRedirectURL', url }, '*');
						break;
					}
					case 'getAppOAuthURL': {
						const { redirectTo } = data;
						let domain = '';
						const href = document.location.href;
						if (href.indexOf('.edge.pinpoint') > 0) {
							domain = 'edge.pinpoint.com';
						} else if (href.indexOf('.ppoint.io') > 0) {
							domain = 'edge.pinpoint.com';
						} else {
							domain = 'pinpoint.com';
						}
						const url = `https://auth.api.${domain}/oauth/${refType}?redirect_to=${encodeURIComponent(redirectTo)}`;
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
	}, []);
	const onClick = useCallback(async () => {
		if (isInstalled) {
			// this is a removal
			setIsInstalled(false);
			setInstallEnabled(false);
			await props.onRemove(props.integration);
			if (ref.current) {
				const url = ref.current.getAttribute('src');
				ref.current.setAttribute('src', '');
				ref.current.setAttribute('src', url);
			}
		} else {
			// this is an install
			await props.onInstall(props.integration);
			setIsInstalled(true);
		}
	}, [isInstalled]);
	return (
		<div className={[styles.Wrapper, props.className].join(' ')}>
			<Header
				name={props.integration.name}
				tags={props.integration.tags}
				description={props.integration.description}
				installed={isInstalled}
				enabled={installEnabled}
				icon={props.integration.icon}
				publisher={props.integration.publisher}
				hasError={props.integration.errored}
				errorMessage={props.integration.errorMessage}
				onClick={onClick}
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