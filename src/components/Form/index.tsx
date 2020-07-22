import React, { useCallback, useEffect, useState } from 'react';
import { Button, Icon, Tooltip } from '@pinpt/uic.next';
import styles from './styles.less';
import { useIntegration } from '../../useIntegration';
import { IAuth, IAppBasicAuth, IAPIKeyAuth } from 'types';

export enum FormType {
	BASIC = 'BASIC',
	API = 'API',
}

interface FormProps {
	type: FormType;
	name: string;
	callback: (auth: IAuth) => Promise<boolean>;
}

export const Form = ({ type, name, callback }: FormProps) => {
	const { config, setConfig } = useIntegration();

	const [disabled, setDisabled] = useState(true);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [apikey, setApiKey] = useState('');
	const [url, setUrl] = useState('');

	useEffect(() => {
		if (type === FormType.BASIC) {
			setDisabled(!url || !username || !password);
		} else {
			setDisabled(!url || !apikey);
		}
	}, [username, password, apikey, url]);

	const onClick = useCallback(() => {
		const execute = async() => {
			if (type === FormType.BASIC) {
				let auth = { username, password, url } as IAppBasicAuth
				let success = await callback(auth);
				if (!success) {
					return;
				}
				config.basic_auth = auth;
			} else {
				let auth = { apikey, url } as IAPIKeyAuth;
				let success = await callback(auth);
				if (!success) {
					return;
				}
				config.apikey_auth = auth;
			}
			setConfig(config);
		}
		execute();
	}, [config, username, password, apikey, url]);

	return (
		<div className={styles.Wrapper}>
			<div className={styles.Content}>
				<h3>
					Authorize Pinpoint.
				</h3>

				<p>
					Please provide the authentication credentials necessary to connect to your {name} instance.
				</p>

				<div className={styles.Form}>
					<div>
						<label htmlFor="Form.URL">
							Instance URL
							<span>
								<Tooltip content={<>The URL to use for connecting to your instance. The Agent must be able to reach this URL from the network location it will be installed.</>}>
									<Icon icon="info-circle" />
								</Tooltip>
							</span>
						</label>
						<input type="text" name="Form.URL" className={styles.Wide} onChange={(e: any) => setUrl(e.target.value)} />
					</div>

					{
						type === FormType.BASIC ? (
							<>
								<div>
									<label htmlFor="Form.USERNAME">
										Username
										<span>
											<Tooltip content={<>The Username to use for connecting to your instance.</>}>
												<Icon icon="info-circle" />
											</Tooltip>
										</span>
									</label>
									<input type="text" name="Form.USERNAME" className={styles.Wide} onChange={(e: any) => setUsername(e.target.value)} />
								</div>

								<div>
									<label htmlFor="Form.PASSWORD">
										Password
										<span>
											<Tooltip content={<>The Password to use for connecting to your instance.</>}>
												<Icon icon="info-circle" />
											</Tooltip>
										</span>
									</label>
									<input type="password" name="Form.PASSWORD" className={styles.Wide} onChange={(e: any) => setPassword(e.target.value)} />
								</div>
							</>
						) : (
								<div>
									<label htmlFor="Form.APIKEY">
										API Key
										<span>
											<Tooltip content={<>The APIKey which is used to connect to your instance.</>}>
												<Icon icon="info-circle" />
											</Tooltip>
										</span>
									</label>
									<input type="text" name="Form.APIKEY" className={styles.Wide} onChange={(e: any) => setApiKey(e.target.value)} />
								</div>
							)
					}
					<Button onClick={onClick} color="Green" weight={500} disabled={disabled} style={{ marginTop: '2.5rem' }}>Save Credentials</Button>
				</div>
			</div>
		</div>
	);
};
