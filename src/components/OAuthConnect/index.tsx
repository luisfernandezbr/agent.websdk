import React from 'react';
import { Button, Icon } from '@pinpt/uic.next';
import { useIntegration } from '../../useIntegration';
import { OAuthVersion } from '../../types';
import styles from './styles.less';

interface OAuthConnectProps {
	name: string,
	reauth?: boolean
	version?: OAuthVersion;
}

export const OAuthConnect = ({ name, reauth, version }: OAuthConnectProps) => {
	const { setRedirectTo, getRedirectURL, getAppOAuthURL } = useIntegration();

	const onClick = async () => {
		const theurl = await getRedirectURL();
		const redirectTo = await getAppOAuthURL(theurl, version);
		setRedirectTo(redirectTo);
	};

	return (
		<div className={styles.Wrapper}>
			<div className={styles.Content}>
				<h3>
					{
						!reauth ? (
							<>Authorize Pinpoint.</>
						) : (
							<>Re-authorize Pinpoint.</>
						)
					}
				</h3>

				{
					reauth && (
						<p>
							Re-authorize to connect to your {name} data with Pinpoint.
						</p>
					)
				}

				<p>
					Use the button below to redirect to {name} to grant permission for Pinpoint to access your {name} data.
					Once authorized, you will automatically be returned to this screen to&nbsp;
					{
						reauth ? 'configure your account.' : 'complete the installation process.'
					}
				</p>

				<Button color="Green" weight={500} onClick={onClick}>
					<>
						<Icon icon={['fas', 'sign-in-alt']} />
						Link {name}
					</>
				</Button>
			</div>
		</div>
	);
};