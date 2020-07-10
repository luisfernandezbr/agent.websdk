import React from 'react';
import { Button, Dialog } from '@pinpt/uic.next';
import styles from './styles.less';

export enum FormType {
	BASIC = 'BASIC',
	API = 'API',
}

interface FormProps {
	type: FormType,
	name: string,
}

export const Form = ({type, name}: FormProps) => {
	return (
		<div className={styles.Wrapper}>
			<div className={styles.Content}>
				<h3>
					Authorize Pinpoint.
				</h3>

				<p>
					Please provide the authentication credentials necessary to connect to your {name} instance.
				</p>

				<form>
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
