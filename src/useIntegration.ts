import { useCallback, useEffect, useState } from 'react';

const useIntegration = (publisher: string, refType: string) => {
	const [ready, setReady] = useState(false);
	const setEnabled = useCallback((value: boolean) => {
		window.parent.postMessage({
			command: 'ENABLE',
			scope: 'INTEGRATION',
			publisher,
			refType,
			value,
		}, '*');
	}, []);
	const setConfig = useCallback((value: {[key: string]: any}) => {
		window.parent.postMessage({
			command: 'CONFIG',
			scope: 'INTEGRATION',
			publisher,
			refType,
			value,
		}, '*');
	}, []);
	useEffect(() => {
		const handler = (e: any) => {
			const { data } = e;
			switch (data.command) {
				case 'INIT': {
					setReady(true);
					break;
				}
				default: break;
			}
		};
		window.addEventListener('message', handler);
		return () => {
			window.parent.postMessage({
				command: 'EXIT',
				scope: 'INTEGRATION',
				publisher,
				refType,
			}, '*');
			window.removeEventListener('message', handler);
		};
	}, []);
	return {
		ready,
		setEnabled,
		setConfig,
	};
};

export default useIntegration;