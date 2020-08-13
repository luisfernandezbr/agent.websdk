import { Config } from './config';

type Maybe<T> = T | undefined | null;

interface IAuthorizer {
	created: number;
	profile_id: string;
	name: string;
}

export interface IAuth {
	date_ts: number;
	url?: Maybe<string>;
}

export interface IAppBasicAuth extends IAuth {
	username: string;
	password: string;
}

export interface IAPIKeyAuth extends IAuth {
	apikey: string;
}

export interface IOAuth1Auth extends IAuth {
	consumer_key: string;
	oauth_token: string;
	oauth_token_secret: string;
}

export interface IOAuth2Auth extends IAuth {
	access_token: string;
	refresh_token?: Maybe<string>;
	scopes?: Maybe<string>;
}

export interface IAppAuthorization {
	basic_auth?: Maybe<IAppBasicAuth>;
	oauth1_auth?: Maybe<IOAuth1Auth>;
	oauth2_auth?: Maybe<IOAuth2Auth>;
	apikey_auth?: Maybe<IAPIKeyAuth>;
	authorizer?: Maybe<IAuthorizer>;
}

export enum IProcessingState {
	IDLE = 'IDLE',
	EXPORTING = 'EXPORTING',
};

export enum IInstalledLocation {
	SELFMANAGED = 'SELFMANAGED',
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

export enum OAuthVersion {
	Version1,
	Version2,
}

export interface ISession {
	customer: {
		id: string;
		name: string;
	}
	user: {
		id: string;
		name: string;
		avatar_url: string;
	}
	env: 'stable' | 'edge' | 'dev';
	graphqlUrl: string;
	authUrl: string;
}

export type FetchHeaders = {[key: string]: string};

export interface IFetchResult {
	statusCode: number;
	headers: FetchHeaders;
	body?: string;
}

export enum FetchMethod {
	GET = "GET",
	HEAD = "HEAD",
}

export interface ISelfManagedAgent {
	enrollment_id: string;
	running: boolean;
}

export interface IUpgradeRequired {
	message?: string;
	due_date_ts?: number;
	requested_date_ts?: number;
}

export interface IAppContext {
	// the id for the integration instance
	id: string;
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
	// upgradeRequired is set if the integration instance has been set to be upgraded
	upgradeRequired?: Maybe<IUpgradeRequired>;
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
	getAppOAuthURL: (redirectTo: string, version?: Maybe<OAuthVersion>, baseuri?: Maybe<string>) => Promise<string>;
	// setAppOAuthURL overrides the default oauth url
	setAppOAuthURL: (url: string) => void;
	// onReAuthed should be called after reauthorization to set the isFromReAuth back to false
	onReAuthed: () => void;
	// session is the details about the current login session
	session: ISession;
	// setOAuth1Connect is called if the integration wants to invoke callback when an oauth1 auth connect event is received by refType and for url
	setOAuth1Connect: (url: string, callback?: (err: Maybe<Error>) => void) => void;
	// setValidate will send the config for validation by the integration and return the result when received by the integration
	setValidate: (config: Config) => Promise<any>;
	// fetch will allow the integration to fetch (outside of the browser) a url to validate data or to validate reachability of the url
	fetch: (url: string, headers?: FetchHeaders, method?: FetchMethod) => Promise<IFetchResult>;
	//	setSelfManagedAgentRequired will navigate to the self managed agent setup screen
	setSelfManagedAgentRequired: () => void;
	// selfManagedAgent returns the self managed agent instance details if setup
	selfManagedAgent?: Maybe<ISelfManagedAgent>;
	// getPrivateKey returns the private key if generated or null if not generated
	getPrivateKey: () => Promise<string | null>;
	// setPrivateKey will the a private key on the integration instance
	setPrivateKey: (key: string) => Promise<void>;
	// createPrivateKey will return an RSA private key in PEM, PKCS#8 format
	createPrivateKey: () => Promise<string>;
	// setInstallLocation will set the installed location for the installation
	setInstallLocation: (location: IInstalledLocation) => Promise<void>;
	// setUpgradeComplete should be called to indicate that the integration instance has been upgraded
	setUpgradeComplete: () => Promise<void>;
}
