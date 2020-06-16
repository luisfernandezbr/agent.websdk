import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components';
import Integration from './types';
export { default as Integration } from './types';
import styles from './styles.less';

export interface InstallerProps {
    className?: string;
    integration: Integration;
    setInstallEnabled: (integration: Integration, val: boolean) => Promise<void>;
    getConfig: (integration: Integration) => Promise<{[key: string]: any}>;
    setConfig: (integration: Integration, config: {[key: string]: any}) => Promise<void>;
    onRemove: (integration: Integration) => Promise<void>;
    onInstall: (integration: Integration) => Promise<void>;
}

const Installer = (props: InstallerProps) => {
	const ref = useRef<any>();
	const [isInstalled, setIsInstalled] = useState(false);
	const [installEnabled, setInstallEnabled] = useState(false);
	const [, setConfig] = useState<any>();
	const onLoad = useCallback(() => {
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
		setTimeout(() => ref.current.style.display = '', 500);
	}, [ref, isInstalled]);
	useEffect(() => {
		const handler = async(e: any) => {
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
                        const config = await props.getConfig(props.integration);
						// const config = JSON.parse(window.localStorage.getItem(`installer.config.${refType}`) || '{}');
						setConfig(config);
						// setIsInstalled(window.localStorage.getItem(`installer.${refType}`) === 'true');
						ref.current.contentWindow.postMessage({command: 'getConfig', config}, '*');
						break;
					}
					case 'setConfig': {
                        const { value } = data;
                        props.setConfig(props.integration, value);
						// const val = JSON.stringify(value);
						setConfig(value);
						// window.localStorage.setItem(`installer.config.${refType}`, val);
						break;
					}
					case 'getRedirectURL': {
						const redirectURL = document.location.href;
						const sep = redirectURL.indexOf('?') > 0 ? '&' : '?';
						const url = redirectURL + (redirectURL.indexOf('integration=') < 0 ? sep + 'integration=redirect' : '');
						ref.current.contentWindow.postMessage({command: 'getRedirectURL', url}, '*');
						break;
					}
					case 'getAppOAuthURL': {
						const { redirectTo } = data;
						let domain = '';
						const href = document.location.href;
						if (href.indexOf('.edge.pinpoint') > 0) {
							domain = 'edge.pinpoint.com';
						} else if (href.indexOf('.ppoint.io') > 0) {
							domain = 'ppoint.io:3000';
						} else {
							domain = 'pinpoint.com';
						}
						const url = `https://auth.api.${domain}/oauth/${refType}?redirect_to=${encodeURIComponent(redirectTo)}`;
						ref.current.contentWindow.postMessage({command: 'getAppOAuthURL', url}, '*');
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
			// window.localStorage.removeItem(`installer.${theRefType.current}`);
			// window.localStorage.removeItem(`installer.config.${theRefType.current}`);
			const url = ref.current.getAttribute('src');
			ref.current.setAttribute('src', '');
			ref.current.setAttribute('src', url);
		} else {
            // this is an install
            await props.onInstall(props.integration);
			// window.localStorage.setItem(`installer.${theRefType.current}`, 'true');
			setIsInstalled(true);
		}
	}, [isInstalled]);
	return (
		<div className={[styles.Container, props.className].join(' ')}>
			<Header
				name={props.integration.name}
				tags={props.integration.tags}
				description={props.integration.description}
				installed={isInstalled}
				enabled={installEnabled}
				icon={props.integration.icon}
				publisher={props.integration.publisher}
				onClick={onClick}
			/>
			<iframe
				ref={ref}
				title={`integration-${props.integration.name}`}
				src={props.integration.uiURL}
				onLoad={onLoad}
				sandbox="allow-scripts"
				style={{display:'none', margin: '0', padding: '0', height: '100vh', width: '100%', backgroundColor: '#fff'}}
			>
			</iframe>
		</div>
	)
};

export default Installer;