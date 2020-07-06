
type Maybe<T> = T | undefined | null;

export enum IntegrationType {
	CLOUD = 'CLOUD',
	SELFMANAGED = 'SELFMANAGED',
};

export interface Auth {
	url?: string;
}

export interface OAuth2Auth extends Auth {
	access_token: string;
	refresh_token?: Maybe<string>;
	scopes?: Maybe<string>;
	created: number;
}

export interface BasicAuth extends Auth {
	username: string;
	password: string;
	created: number;
}

export interface APIKeyAuth extends Auth {
	apikey: string;
	created: number;
}

export interface ConfigAccount {
	id: string;
	type: 'ORG' | 'USER';
	public: boolean;
}

type Bag = {[key: string]: any};

export interface Config extends Bag {
	integration_type?: IntegrationType;
	exclusions?: Maybe<{[id: string]: string}>;
	inclusions?: Maybe<{[id: string]: string}>;
	oauth2_auth?: Maybe<OAuth2Auth>;
	basic_auth?: Maybe<BasicAuth>;
	apikey_auth?: Maybe<APIKeyAuth>;
	accounts?: Maybe<{[id: string]: ConfigAccount}>;
}
