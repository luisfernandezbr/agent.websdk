import React, { useCallback, useEffect, useState } from 'react';
import Banner from '@pinpt/uic.next/Banner';
import Button from '@pinpt/uic.next/Button';
import Icon from '@pinpt/uic.next/Icon';
import Tooltip from '@pinpt/uic.next/Tooltip';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './styles.less';
import { useIntegration } from '../../useIntegration';
import useDebounce from '../../useDebounce';
import { IAuth, IAppBasicAuth, IAPIKeyAuth } from 'types';

export enum FormType {
	BASIC = 'BASIC',
	API = 'API',
	URL = 'URL',
}

interface FormProps {
	type: FormType;
	name: string;
	title?: string | React.ReactElement;
	intro?: string | React.ReactElement;
	form?: {
		// the url prompt
		url?: {
			disabled: boolean
			display?: string | React.ReactElement;
			help?: string | React.ReactElement;
		};
		basic?: {
			// the username prompt
			username?: {
				display?: string | React.ReactElement;
				help?: string | React.ReactElement;
			};
			// the password prompt
			password?: {
				display?: string | React.ReactElement;
				help?: string | React.ReactElement;
			};
		},
		api?: {
			// the apikey prompt
			apikey?: {
				display?: string | React.ReactElement;
				help?: string | React.ReactElement;
			};
		}
	};
	button?: string | React.ReactElement;
	otherbuttons?: React.ReactElement | undefined;
	readonly?: boolean | undefined;
	afterword?: (auth: IAuth | string) => string | React.ReactElement;
	callback: (auth: IAuth | string) => Promise<void>;
	urlValidator?: (url: string) => boolean;
	urlFormatter?: (url: string) => string;
	onBlur?: (field: string, evt: React.FocusEvent<HTMLInputElement>) => void;
	onFocus?: (field: string, evt: React.FocusEvent<HTMLInputElement>) => void;
	enabledValidator?: (auth: IAuth | string) => Promise<boolean>;
	disabled?: boolean;
}

export const URLValidator = (url: string) => {
	const u = new URL(url);
	return /https?/.test(u.protocol);
};

const basicUrlFormatter = (url: string) => url;

const getAuth = (type: FormType, url: string, username: string, password: string, apikey: string, urlFormatter?: (url: string) => string) => {
	let arg: IAuth | string;
	const newurl = urlFormatter(url);
	switch (type) {
		case FormType.BASIC: {
			arg = { username, password, url: newurl } as IAppBasicAuth
			break;
		}
		case FormType.API: {
			arg = { apikey, url: newurl } as IAPIKeyAuth;
			break;
		}
		case FormType.URL: {
			arg = newurl;
			break;
		}
		default: break;
	}
	return arg;
}

export const Form = ({
	type,
	name,
	title = 'Authorize Pinpoint.',
	intro = `Please provide the authentication credentials necessary to connect to your ${name} instance.`,
	button = 'Save Credentials',
	otherbuttons,
	form,
	readonly = false,
	disabled: defaultDisabled = false,
	onBlur,
	onFocus,
	afterword,
	urlValidator = URLValidator,
	urlFormatter = basicUrlFormatter,
	enabledValidator,
	callback,
}: FormProps) => {
	const { config, setConfig } = useIntegration();

	const [disabled, setDisabled] = useState(defaultDisabled);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [apikey, setApiKey] = useState('');
	const [url, setUrl] = useState('');
	const [error, setError] = useState<string>();

	const debouncedUsername = useDebounce(username, 250);
	const debouncedPassword = useDebounce(password, 250);
	const debouncedApikey = useDebounce(apikey, 250);
	const debouncedUrl = useDebounce(url, 250);

	useEffect(() => {
		if (enabledValidator) {
			const val = getAuth(type, url, username, password, apikey, urlFormatter);
			enabledValidator(val).then((res: boolean) => {
				setDisabled(!res);
				setError(null);
			}).catch((err: Error) => {
				setError(err.message);
			});
		} else if (urlValidator) {
			let urlValid = form?.url?.disabled;
			if (!urlValid && url) {
				try {
					urlValid = urlValidator(url);
				} catch(e) { }
			}
			switch (type) {
				case FormType.BASIC: {
					setDisabled(!urlValid || !username || !password);
					break;
				}
				case FormType.API: {
					setDisabled(!urlValid || !apikey);
					break;
				}
				case FormType.URL: {
					setDisabled(!urlValid);
					break;
				}
				default: break;
			}
		}
		return () => {
			enabledValidator = null;
			urlValidator = null;
		};
	}, [debouncedUsername, debouncedPassword, debouncedApikey, debouncedUrl]);

	const onClick = useCallback(() => {
		setDisabled(true);
		const execute = async() => {
			try {
				const newurl = urlFormatter(url);
				switch (type) {
					case FormType.BASIC: {
						const auth = { date_ts: Date.now(), username, password, url: newurl } as IAppBasicAuth
						await callback(auth);
						config.basic_auth = auth;
						break;
					}
					case FormType.API: {
						const auth = { date_ts: Date.now(), apikey, url: newurl } as IAPIKeyAuth;
						await callback(auth);
						config.apikey_auth = auth;
						break;
					}
					case FormType.URL: {
						await callback(newurl);
						break;
					}
					default: break;
				}
				setError(null);
				setConfig(config);
				setDisabled(false);
			} catch (ex) {
				setError(ex.message);
			}
		}
		execute();
	}, [config, username, password, apikey, url]);

	let arg: IAuth | string;
	const newurl = urlFormatter(url);
	switch (type) {
		case FormType.BASIC: {
			arg = { username, password, url: newurl } as IAppBasicAuth
			break;
		}
		case FormType.API: {
			arg = { apikey, url: newurl } as IAPIKeyAuth;
			break;
		}
		case FormType.URL: {
			arg = newurl;
			break;
		}
		default: break;
	}

	let afterText;
	if (!disabled && afterword) {
		afterText = afterword(arg);
	}

	return (
		<div className={styles.Wrapper}>
			<div className={styles.Content}>
				<h3>
					{title}
				</h3>

				<p>
					{intro}
				</p>

				{ error && <Banner error>{error}</Banner> }
				<div className={styles.Form}>
					{ form?.url?.disabled ? (<></>) : (
						<>
						<div>
							<label htmlFor="Form.URL">
								{form?.url?.display || 'Instance URL'}
								<span>
									<Tooltip content={form?.url?.help || <>The URL to use for connecting to your instance. The Agent must be able to reach this URL from the network location it will be installed.</>}>
										<Icon icon={faInfoCircle} />
									</Tooltip>
								</span>
							</label>
							<input type="text" name="Form.URL" readOnly={readonly} className={styles.Wide} onChange={(e: any) => setUrl(e.target.value.trim())} onBlur={(e: any) => onBlur?.('url', e)} onFocus={(e: any) => onFocus?.('url', e)} />
						</div>
						</>
						) 
					}
					{
						type === FormType.BASIC ? (
							<>
								<div>
									<label htmlFor="Form.USERNAME">
									{form?.basic?.username?.display || 'Username'}
										<span>
											<Tooltip content={form?.basic?.username?.help || <>The Username to use for connecting to your instance.</>}>
												<Icon icon={faInfoCircle} />
											</Tooltip>
										</span>
									</label>
									<input type="text" name="Form.USERNAME" readOnly={readonly} className={styles.Wide} onChange={(e: any) => setUsername(e.target.value)} onBlur={(e: any) => onBlur?.('username', e)} onFocus={(e: any) => onFocus?.('username', e)} />
								</div>

								<div>
									<label htmlFor="Form.PASSWORD">
										{form?.basic?.password?.display || 'Password'}
										<span>
											<Tooltip content={form?.basic?.password?.help || <>The Password to use for connecting to your instance.</>}>
												<Icon icon={faInfoCircle} />
											</Tooltip>
										</span>
									</label>
									<input type="password" name="Form.PASSWORD" readOnly={readonly} className={styles.Wide} onChange={(e: any) => setPassword(e.target.value)} onBlur={(e: any) => onBlur?.('password', e)} onFocus={(e: any) => onFocus?.('password', e)} />
								</div>
							</>
						) : type === FormType.API ? (
								<div>
									<label htmlFor="Form.APIKEY">
										{form?.api?.apikey?.display || 'API Key'}
										<span>
											<Tooltip content={form?.api?.apikey?.help || <>The APIKey which is used to connect to your instance.</>}>
												<Icon icon={faInfoCircle} />
											</Tooltip>
										</span>
									</label>
									<input type="text" name="Form.APIKEY" readOnly={readonly} className={styles.Wide} onChange={(e: any) => setApiKey(e.target.value)} onBlur={(e: any) => onBlur?.('apikey', e)} onFocus={(e: any) => onFocus?.('apikey', e)} />
								</div>
						) : <></>
					}
					{ afterText }
					<div style={{ marginTop: '2.5rem' }}>
						{ button && <Button className={styles.Button} onClick={onClick} color="Green" weight={500} disabled={disabled}>{button}</Button> }
						{ otherbuttons }
					</div>
				</div>
			</div>
		</div>
	);
};
