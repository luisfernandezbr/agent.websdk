import { useContext } from 'react';
import { IAppContext } from './types';
import AppContext from './context';

export const useIntegration = () => {
	const context = useContext(AppContext.Context);
	if (AppContext === undefined) {
		throw new Error('useIntegration must be used within an AppContextProvider');
	}
	return context as IAppContext;
};
