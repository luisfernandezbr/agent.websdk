import React, { FormEvent, useState } from 'react';
import styles from './styles.less';
import { useIntegration } from '../../useIntegration';
import { IAuth, IAppBasicAuth, IAPIKeyAuth } from 'types';

export enum FormType {
	BASIC = 'BASIC',
	API = 'API',
}

interface FormProps {
	type: FormType,
	name: string,
	callback: (auth: IAuth) => Promise<boolean>,
}

export const Form = ({ type, name, callback }: FormProps) => {
	const { config, setConfig, loading, setLoading } = useIntegration();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [apikey, setApiKey] = useState('');
	const [url, setUrl] = useState('');

	async function onSubmit() {
		setLoading(true)
		if (type === FormType.BASIC) {
			let auth = { username, password, url } as IAppBasicAuth
			let success = await callback(auth);
			if (!success) {
				setLoading(false)
				return;
			}
			config.basic_auth = auth;
		} else {
			let auth = { apikey, url } as IAPIKeyAuth;
			let success = await callback(auth);
			if (!success) {
				setLoading(false)
				return;
			}
			config.apikey_auth = auth;
		}
		setConfig(config);
		setLoading(false)
	}

	return (
		<div className={styles.Wrapper}>
			<div className={styles.Content}>
				<h3>
					Authorize Pinpoint.
				</h3>

				<p>
					Please provide the authentication credentials necessary to connect to your {name} instance.
				</p>

				<form onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}>
					<div>
						<label htmlFor="Form.URL">
							Instance URL
						</label>
						<input type="text" name="Form.URL" className={styles.Wide} onChange={(e: any) => setUrl(e.target.value)} />
					</div>

					{
						type === FormType.BASIC ? (
							<>
								<div>
									<label htmlFor="Form.URL">
										Username
									</label>
									<input type="text" name="Form.USERNAME" onChange={(e: any) => setUsername(e.target.value)} />
								</div>

								<div>
									<label htmlFor="Form.URL">
										Password
									</label>
									<input type="text" name="Form.PASSWORD" onChange={(e: any) => setPassword(e.target.value)} />
								</div>
							</>
						) : (
								<div>
									<label htmlFor="Form.URL">
										API Key
								</label>
									<input type="text" name="Form.APIKEY" className={styles.Wide} onChange={(e: any) => setApiKey(e.target.value)} />
								</div>
							)
					}

					<div>
						<input type="submit" value="Submit" onClick={onSubmit} />
					</div>
				</form>
			</div>
		</div>
	);
};
