import React from 'react';
import styles from './styles.less';
import { useIntegration } from '../../useIntegration';

export enum FormType {
	BASIC = 'BASIC',
	API = 'API',
}

interface FormProps {
	type: FormType,
	name: string,
}

export const Form = ({ type, name }: FormProps) => {
	const { config, setConfig } = useIntegration();

	function onSubmit() {
		var url: HTMLInputElement = document.getElementsByName('Form.URL')[0] as any;
		if (type === FormType.BASIC) {
			var username: HTMLInputElement = document.getElementsByName('Form.USERNAME')[0] as any;
			var password: HTMLInputElement = document.getElementsByName('Form.PASSWORD')[0] as any;
			config.basic_auth = { username: username.value, password: password.value, url: url.value };
		} else {
			var apikey: HTMLInputElement = document.getElementsByName('Form.APIKEY')[0] as any;
			config.apikey_auth = { apikey: apikey.value, url: url.value };
		}
		setConfig(config);
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

				<form onSubmit={onSubmit}>
					<div>
						<label htmlFor="Form.URL">
							Instance URL
						</label>
						<input type="text" name="Form.URL" className={styles.Wide} />
					</div>

					{
						type === FormType.BASIC ? (
							<>
								<div>
									<label htmlFor="Form.URL">
										Username
									</label>
									<input type="text" name="Form.USERNAME" />
								</div>

								<div>
									<label htmlFor="Form.URL">
										Password
									</label>
									<input type="text" name="Form.PASSWORD" />
								</div>
							</>
						) : (
								<div>
									<label htmlFor="Form.URL">
										API Key
								</label>
									<input type="text" name="Form.APIKEY" className={styles.Wide} />
								</div>
							)
					}

					<div>
						<input
							type="submit"
							value="Submit"
						/>
					</div>
				</form>
			</div>
		</div>
	);
};
