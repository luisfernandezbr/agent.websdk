import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IAppContext, IAppAuthorization, IProcessingDetail, OAuthVersion, FetchHeaders, FetchMethod, IFetchResult, ISelfManagedAgent, ISession, IInstalledLocation } from './types';
import { Config } from './config';

type Maybe<T> = T | undefined | null;

interface IAppContextProps {
	children: React.ReactNode;
	publisher: string;
	refType: string;
}

const scope = 'INTEGRATION';
const source = 'agent.websdk';

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
	const [, setRerender] = useState(0);
	const [id, setID] = useState();
	const currentConfig = useRef<Config>({});
	const [authorization, setAuthorization] = useState<IAppAuthorization>();
	const [processingDetail, setProcessingDetail] = useState<IProcessingDetail>();
	const [selfManagedAgent, setSelfManagedAgent] = useState<ISelfManagedAgent>();
	const [session, setSession] = useState<ISession>();
	const redirectPromise = useRef<any[]>();
	const redirectOAuthPromise = useRef<any[]>();
	const configPromise = useRef<any[]>();
	const oauth1ConnectCallback = useRef<any>();
	const validateCallback = useRef<any>();
	const fetchPromise = useRef<any[]>();
	const selfManagedAgentPromise = useRef<any[]>();
	const createPrivateKeyPromise = useRef<any[]>();
	const setPrivateKeyPromise = useRef<any[]>();
	const setInstallLocationPromise = useRef<any[]>();
	
	const setInstallEnabled = useCallback((value: boolean) => {
		window.parent.postMessage({
			source,
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
			source,
			scope,
			publisher,
			refType,
			value,
		}, '*');
	}, []);
	const setRedirectTo = useCallback((url: string) => {
		window.parent.postMessage({
			command: 'setRedirectTo',
			source,
			scope,
			publisher,
			refType,
			url,
		}, '*');
	}, []);
	const setAppOAuthURL = useCallback((url: string) => {
		window.parent.postMessage({
			command: 'setAppOAuthURL',
			source,
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
				source,
				scope,
				publisher,
				refType,
			}, '*');
		});
		return promise;
	}, []);
	const getAppOAuthURL = useCallback((redirectTo: string, version?: Maybe<OAuthVersion>, baseuri?: Maybe<string>) => {
		const promise = new Promise<string>((resolve, reject) => {
			redirectOAuthPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'getAppOAuthURL',
				source,
				scope,
				publisher,
				refType,
				redirectTo,
				version,
				baseuri,
			}, '*');
		});
		return promise;
	}, []);
	const getConfig = useCallback(() => {
		const promise = new Promise<Config>((resolve, reject) => {
			configPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'getConfig',
				source,
				scope,
				publisher,
				refType,
			}, '*');
		});
		return promise;
	}, []);

	const onReAuthed = useCallback(() => setIsFromReAuth(false), []);
	useEffect(() => {
		const handler = async (e: any) => {
			if (e.data) {
				const { data } = e;
				const { source, command } = data;
				if (source !== 'agent.websdk') {
					return;
				}
				switch (command) {
					case 'INIT': {
						const _config = await getConfig();
						const {
							id: _id,
							url: _url,
							redirected: _redirected,
							installed: _installed,
							authorization: _authorization,
							processingDetail: _processingDetail,
							selfManagedAgent: _selfManagedAgent,
							session: _session,
						} = data;
						setID(_id);
						setIsFromRedirect(_redirected);
						setCurrentURL(_url);
						setInstalled(_installed);
						currentConfig.current = _config;
						setAuthorization(_authorization);
						setProcessingDetail(_processingDetail);
						setSelfManagedAgent(_selfManagedAgent);
						setSession(_session);
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
					case 'setConfig': {
						const { config } = data;
						if (config && JSON.stringify(config) !== JSON.stringify(currentConfig.current)) {
							currentConfig.current = config;
							setRerender(Date.now()); // force a re-render to send down to children
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
					case 'setOAuth1Connect': {
						if (oauth1ConnectCallback.current) {
							const callback = oauth1ConnectCallback.current;
							oauth1ConnectCallback.current = null;
							const { err } = data;
							callback(err);
						}
						break;
					}
					case 'setValidate': {
						if (validateCallback.current) {
							const callback = validateCallback.current;
							const { err, result } = data;
							validateCallback.current = null;
							callback(err, result);
						}
						break;
					}
					case 'handleAuthChange': {
						setIsFromReAuth(true);
						break;
					}
					case 'fetch': {
						if (fetchPromise.current) {
							const [resolve, reject] = fetchPromise.current;
							const { err, statusCode, body, headers } = data;
							fetchPromise.current = null;
							if (err) {
								reject(err as Error);
							} else {
								resolve({
									statusCode,
									body,
									headers
								});
							}
						}
						break;
					}
					case 'setSelfManagedAgentRequired': {
						if (selfManagedAgentPromise.current) {
							const [resolve] = selfManagedAgentPromise.current;
							selfManagedAgentPromise.current = null;
							resolve();
						}
						break;
					}
					case 'setPrivateKey': {
						if (setPrivateKeyPromise.current) {
							const { err } = data;
							const [resolve, reject] = setPrivateKeyPromise.current;
							setPrivateKeyPromise.current = null;
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						}
						break;
					}
					case 'createPrivateKey': {
						if (createPrivateKeyPromise.current) {
							const { err, result } = data;
							const [resolve, reject] = createPrivateKeyPromise.current;
							createPrivateKeyPromise.current = null;
							if (err) {
								reject(err);
							} else {
								resolve(result);
							}
						}
					}
					case 'setInstallLocation': {
						if (setInstallLocationPromise.current) {
							const { err } = data;
							const [resolve, reject] = setInstallLocationPromise.current;
							setInstallLocationPromise.current = null;
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						}
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

	const setOAuth1Connect = useCallback((url: string, callback?: (err: Maybe<Error>) => void) => {
		if (!url || !callback) {
			// allow unset
			oauth1ConnectCallback.current = undefined;
			return;
		}
		oauth1ConnectCallback.current = callback;
		window.parent.postMessage({
			command: 'setOAuth1Connect',
			source,
			scope,
			publisher,
			refType,
			url,
		}, '*');
	}, []);

	const setValidate = useCallback((config: Config, callback?: (err: Maybe<Error>, res: Maybe<any>) => void) => {
		if (!config || !callback) {
			// allow unset
			validateCallback.current = null;
			return;
		}
		validateCallback.current = callback;
		window.parent.postMessage({
			command: 'setValidate',
			source,
			scope,
			publisher,
			refType,
			config,
		}, '*');
	}, []);

	const fetch = useCallback((url: string, headers?: FetchHeaders, method?: FetchMethod) => {
		const promise = new Promise<IFetchResult>((resolve, reject) => {
			fetchPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'fetch',
				source,
				scope,
				publisher,
				refType,
				url,
				headers,
				method,
			}, '*');
		});
		return promise;
	}, []);

	const setSelfManagedAgentRequired = useCallback(() => {
		const promise = new Promise<void>((resolve, reject) => {
			selfManagedAgentPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'setSelfManagedAgentRequired',
				source,
				scope,
				publisher,
				refType,
			}, '*');
		});
		return promise;
	}, []);

	const setPrivateKey = useCallback((value: string) => {
		const promise = new Promise<void>((resolve, reject) => {
			setPrivateKeyPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'setPrivateKey',
				source,
				scope,
				publisher,
				refType,
				value,
			}, '*');
		});
		return promise;
	}, []);

	const createPrivateKey = useCallback(() => {
		const promise = new Promise<string>((resolve, reject) => {
			createPrivateKeyPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'createPrivateKey',
				source,
				scope,
				publisher,
				refType,
			}, '*');
		});
		return promise;
	}, []);

	const setInstallLocation = useCallback((location: IInstalledLocation) => {
		const promise = new Promise<void>((resolve, reject) => {
			setInstallLocationPromise.current = [resolve, reject];
			window.parent.postMessage({
				command: 'setInstallLocation',
				source,
				scope,
				publisher,
				refType,
				location
			}, '*');
		});
		return promise;
	}, []);

	return (
		<AppContext.Provider
			value={{
				id,
				setInstallEnabled,
				setConfig,
				setRedirectTo,
				currentURL,
				installed,
				config: {...currentConfig.current},
				getRedirectURL,
				getAppOAuthURL,
				setAppOAuthURL,
				isFromRedirect,
				isFromReAuth,
				authorization,
				loading,
				setLoading,
				processingDetail,
				onReAuthed,
				session,
				setOAuth1Connect,
				setValidate,
				fetch,
				setSelfManagedAgentRequired,
				selfManagedAgent,
				createPrivateKey,
				setPrivateKey,
				setInstallLocation,
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
