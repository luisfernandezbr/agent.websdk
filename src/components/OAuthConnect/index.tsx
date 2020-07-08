import React from 'react';
import { useIntegration } from '../../useIntegration';
import { Button, Icon } from '@pinpt/uic.next';
import styles from './styles.less';

interface OAuthConnectProps {
	name: string
}

export const OAuthConnect = ({ name }: OAuthConnectProps) => {
	const { setRedirectTo, getRedirectURL, getAppOAuthURL } = useIntegration();

	const onClick = async () => {
		const theurl = await getRedirectURL();
		const redirectTo = await getAppOAuthURL(theurl);
		setRedirectTo(redirectTo);
	};

	return (
		<div className={styles.Wrapper}>
			<div className={styles.Content}>
				<h3>
					Authorize Pinpoint.
				</h3>

				<p>
					Use the button below to give Pinpoint permission to access your {name} data. Once you're done, you will be returned to this screen to complete the installation process.
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