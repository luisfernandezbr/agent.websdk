import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Button, Dialog } from '@pinpt/uic.next';
import styles from './styles.less';

export const NoAction = () => {
	return (
		<div
			className={styles.Wrapper}
		>
			<h1>
				👍
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
