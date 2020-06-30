import { Config } from './config';

export interface IAppOAuthAuthorization {
	accessToken: string;
	refreshToken?: string;
	scopes?: string;
	created: number;
}

export interface IAppContext {
	// loading will return true if the context is loading the integration
	loading: boolean;
	// installed will return true if the integration is already installed and you're in edit mode
	installed: boolean;
	// isFromRedirect will return true if the integration is loaded after a redirect during installation
	isFromRedirect: boolean;
	// currentURL is the current URL of the page
	currentURL: string;
	// config is the current integation config is already installed or empty if a new integration
	config: Config;
	// authorization is passed if the current integration has an preauthorized OAuth token as part of the Pinpoint setup matching the refType of the integration
	authorization?: IAppOAuthAuthorization;
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
}
