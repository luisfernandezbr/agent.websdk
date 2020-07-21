import { Config } from './config';

type Maybe<T> = T | undefined | null;

interface IAuthorizer {
	created: number;
	profile_id: string;
	name: string;
}

export interface IAuth {
	url?: Maybe<string>;
}

export interface IAppBasicAuth extends IAuth {
	username: string;
	password: string;
}

export interface IAPIKeyAuth extends IAuth {
	apikey: string;
}

export interface IOAuth2Auth extends IAuth {
	access_token: string;
	refresh_token?: Maybe<string>;
	scopes?: Maybe<string>;
}

export interface IAppAuthorization {
	basic_auth?: Maybe<IAppBasicAuth>;
	oauth2_auth?: Maybe<IOAuth2Auth>;
	apikey_auth?: Maybe<IAPIKeyAuth>;
	authorizer?: Maybe<IAuthorizer>;
}

export enum IProcessingState {
	IDLE = 'IDLE',
	EXPORTING = 'EXPORTING',
};

export enum IInstalledLocation {
	SELFMANAGED = 'PRIVATE',
	CLOUD = 'CLOUD',
};

export interface IProcessingDetail {
	createdDate?: Maybe<number>;
	processed: boolean;
	lastProcessedDate?: Maybe<number>;
	lastExportRequestedDate?: Maybe<number>;
	lastExportCompletedDate?: Maybe<number>;
	state: IProcessingState;
	throttled: boolean;
	throttledUntilDate?: Maybe<number>;
	paused: boolean;
	location: IInstalledLocation;
}

export interface IAppContext {
	// loading will return true if the context is loading the integration
	loading: boolean;
	// setLoading will set the value of loading
	setLoading: (val: boolean) => void;
	// installed will return true if the integration is already installed and you're in edit mode
	installed: boolean;
	// isFromRedirect will return true if the integration is loaded after a redirect during installation
	isFromRedirect: boolean;
	// isFromReAuth will return true if the reauthorize button was clicked to indicate that the integration should reauthorize
	isFromReAuth: boolean;
	// currentURL is the current URL of the page
	currentURL: string;
	// config is the current integation config is already installed or empty if a new integration
	config: Config;
	// authorization is passed if the current integration has an preauthorized authorization as part of the Pinpoint setup matching the refType of the integration
	authorization?: Maybe<IAppAuthorization>;
	// detail is the processing detail about setup and processing state of the integration
	processingDetail?: Maybe<IProcessingDetail>;
	// setInstallEnabled should be called to enable the "Install" button to indicate the integration is available to be installed
	setInstallEnabled: (enabled: boolean) => void;
	// setConfig should be called with any specific configuration that the integration needs and this configuration will be passed to the integration
	// if in edit mode, this will make the change to the existing integration immediately. if in install mode, you will need to call setInstalledEnabled(true)
	// and the end user will need to click the "Install" button to cause the integration configuration to be saved and the enrollment process to start
	setConfig: (config: Config) => void;
	// getRedirectURL will return a redirect URL which can be used as a redirect back to the Integration
	getRedirectURL: () => Promise<string>;
	// setRedirectTo will cause the application to go to the url
	setRedirectTo: (url: string) => void;
	// getAppOAuthURL will return the oauth auth url for using built-in Pinpoint authentication with third-party systems
	getAppOAuthURL: (redirectTo: string) => Promise<string>;
	// onReAuthed should be called after reauthorization to set the isFromReAuth back to false
	onReAuthed: () => void;
}
