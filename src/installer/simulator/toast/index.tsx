import React from 'react';
import Icon from '@pinpt/uic.next/Icon';
import { ToastProps } from 'react-toast-notifications';
import {
	faCheck, faExclamationCircle, faExclamationTriangle, faInfoCircle, IconDefinition, faTimes
} from '@fortawesome/free-solid-svg-icons';
import styles from './styles.module.less';

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
	let icon: IconDefinition;
	switch (appearance) {
		case 'success':
			icon = faCheck;
			break;
		case 'error':
			icon = faExclamationCircle;
			break;
		case 'warning':
			icon = faExclamationTriangle;
			break;
		default:
			icon = faInfoCircle;
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
				<Icon icon={icon} />
			</div>
			<div className={styles.Content}>
				{children}
			</div>
			<div className={styles.Dismiss}>
				<Icon
					icon={faTimes}
				/>
			</div>
		</div>
	);
};

export default Toast;