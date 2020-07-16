import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IAppContext, IAppAuthorization, IProcessingDetail } from './types';
import { Config } from './config';

interface IAppContextProps {
	children: React.ReactNode;
	publisher: string;
	refType: string;
}

const scope = 'INTEGRATION';

const AppContext = React.createContext<IAppContext>({} as IAppContext);

export const AppContextProvider = ({
	publisher,
	refType,
	children,
}: IAppContextProps) => {
	const [loading, setLoading] = useState(true);
	const [isFromRedirect, setIsFromRedirect] = useState(false);
	const [isFromReAuth, setIsFromReAuth] = useState(false);
	const [currentURL, setCurrentURL] = useState<string>('');
	const [installed, setInstalled] = useState<boolean>(false);
	const [currentConfig, setCurrentConfig] = useState<Config>({});
	const [authorization, setAuthorization] = useState<IAppAuthorization>();
	const [processingDetail, setProcessingDetail] = useState<IProcessingDetail>();
	const redirectPromise = useRef<any[]>();
	const redirectOAuthPromise = useRef<any[]>();
	const configPromise = useRef<any[]>();
	const setInstallEnabled = useCallback((value: boolean) => {
		window.parent.postMessage({
			command: 'setInstallEnabled',
			scope,
			publisher,
			refType,
			value,
		}, '*');
	}, []);
	const setConfig = useCallback((value: Config) => {
		window.parent.postMessage({
			command: 'setConfig',
			scope,
			publisher,
			refType,
			value,
		}, '*');
	}, []);
	const setRedirectTo = useCallback((url: string) => {
		window.parent.postMessage({
			command: 'setRedirectTo',
			scope,
			publisher,
			refType,
			url,
		}, '*');
	}, []);
	const getRedirectURL = useCallback(() => {
		const promise = new Promise<string>((resolve, reject) => {
			redirectPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'getRedirectURL',
				scope,
				publisher,
				refType,
			}, '*');
		});
		return promise;
	}, []);
	const getAppOAuthURL = useCallback((redirectTo: string) => {
		const promise = new Promise<string>((resolve, reject) => {
			redirectOAuthPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'getAppOAuthURL',
				scope,
				publisher,
				refType,
				redirectTo,
			}, '*');
		});
		return promise;
	}, []);
	const getConfig = useCallback(() => {
		const promise = new Promise<Config>((resolve, reject) => {
			configPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'getConfig',
				scope,
				publisher,
				refType,
			}, '*');
		});
		return promise;
	}, []);
	const onReAuthed = useCallback(() => setIsFromReAuth(false), []);
	useEffect(() => {
		const handler = async(e: any) => {
			if (e.data) {
				const { data } = e;
				const { command } = data;
				switch (command) {
					case 'INIT': {
						const _config = await getConfig();
						const {
							url: _url,
							redirected: _redirected,
							installed: _installed,
							authorization: _authorization,
							processingDetail: _processingDetail
						} = data;
						setIsFromRedirect(_redirected);
						setCurrentURL(_url);
						setInstalled(_installed);
						setCurrentConfig(_config);
						setAuthorization(_authorization);
						setProcessingDetail(_processingDetail);
						setLoading(false);
						break;
					}
					case 'getConfig': {
						if (configPromise.current) {
							const [resolve, reject] = configPromise.current;
							const { err, config } = data;
							if (err) {
								reject(new Error(err));
							} else {
								resolve(config);
							}
							configPromise.current = null;
						}
						break;
					}
					case 'getRedirectURL': {
						if (redirectPromise.current) {
							const [resolve, reject] = redirectPromise.current;
							const { err, url } = data;
							if (err) {
								reject(new Error(err));
							} else {
								resolve(url);
							}
							redirectPromise.current = null;
						}
						break;
					}
					case 'getAppOAuthURL': {
						if (redirectOAuthPromise.current) {
							const [resolve, reject] = redirectOAuthPromise.current;
							const { err, url } = data;
							if (err) {
								reject(new Error(err));
							} else {
								resolve(url);
							}
							redirectOAuthPromise.current = null;
						}
						break;
					}
					case 'handleAuthChange': {
						setIsFromReAuth(true);
						break;
					}
					default: break;
				}
			}
		};
		window.addEventListener('message', handler);
		return () => {
			window.parent.postMessage({
				command: 'EXIT',
				scope,
				publisher,
				refType,
			}, '*');
			window.removeEventListener('message', handler);
		};
	}, []);

	return (
		<AppContext.Provider
			value={{
				setInstallEnabled,
				setConfig,
				setRedirectTo,
				currentURL,
				installed,
				config: currentConfig,
				getRedirectURL,
				getAppOAuthURL,
				isFromRedirect,
				isFromReAuth,
				authorization,
				loading,
				processingDetail,
				onReAuthed,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export default {
	Context: AppContext,
	Provider: AppContextProvider,
	Consumer: AppContext.Consumer,
};
