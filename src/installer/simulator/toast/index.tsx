import React from 'react';
import Icon from '@pinpt/uic.next/Icon';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';
import styles from './styles.module.less';
import { ToastProps } from 'react-toast-notifications';

const states = {
	entering: { transform: 'translate3d(120%, 0, 0) scale(1)' },
	entered: { transform: 'translate3d(0, 0, 0) scale(1)' },
	exiting: { transform: 'translate3d(120%, 0, 0) scale(1)' },
	exited: { transform: 'translate3d(120%, 0, 0) scale(1)' },
};

const Toast = ({
	appearance,
	children,
	transitionDuration,
	transitionState,
	onDismiss,
}: ToastProps) => {
	let prefix: IconPrefix = 'far';
	let iconName: IconName;
	switch (appearance) {
		case 'success':
			prefix = 'fas';
			iconName = 'check';
			break;
		case 'error':
			prefix = 'fas';
			iconName = 'exclamation-circle';
			break;
		case 'warning':
			prefix = 'fas';
			iconName = 'exclamation-triangle';
			break;
		default:
			iconName = 'info-circle';
			break;
	}
	return (
		<div
			className={[
				styles.Toast,
				styles[appearance]
			].join(' ')}
			style={{
				transitionDuration: `${transitionDuration}ms`,
				...states[transitionState]
			}}
			onClick={() => onDismiss('')}
			role="button"
			tabIndex={-1}
		>
			<div className={styles.Icon}>
				<Icon icon={[prefix, iconName]} />
			</div>
			<div className={styles.Content}>
				{children}
			</div>
			<div className={styles.Dismiss}>
				<Icon
					icon={['far', 'times']}
				/>
			</div>
		</div>
	);
};

export default Toast;