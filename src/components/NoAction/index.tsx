import React from 'react';
import styles from './styles.less';

export const NoAction = () => {
	return (
		<div
			className={styles.Wrapper}
		>
			<h1>
				<span role="img" aria-label="thumbs up">👍</span>
			</h1>
			<h2>
				You're all set
			</h2>
			<p>
				No further configuration is required for this integration.
			</p>
		</div>	
	);
};
