import React from 'react';
import { useIntegration } from '../useIntegration';
import { Button } from '@pinpt/uic.next';

export const OAuthConnect = ({ name } : { name: string }) => {
	const { setRedirectTo, getRedirectURL, getAppOAuthURL } = useIntegration();
	const onClick = async () => {
		const theurl = await getRedirectURL();
		const redirectTo = await getAppOAuthURL(theurl);
		setRedirectTo(redirectTo);
	};
	const text = `Connect Pinpoint to ${name}`;
	return (
		<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
			<div style={{fontSize: '1.6rem', margin: '3rem 6rem', fontWeight: 'bold'}}>
				To begin, we will need to redirect to {name} to grant permission to Pinpoint to use your
				{name} data. Once you grant permission, {name} will return you back to this screen to
				complete your configuration and then install this integration.
			</div>
			<Button color="Blue" weight={500} onClick={onClick}>{text}</Button>
		</div>
	);
};