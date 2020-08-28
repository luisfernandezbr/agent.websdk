
type Maybe<T> = T | undefined | null;

export enum IntegrationType {
	CLOUD = 'CLOUD',
	SELFMANAGED = 'SELFMANAGED',
};

export interface Authorizer {
	created: number;
	profile_id: string;
	name: string;
}

export interface Auth {
	url?: Maybe<string>;
	date_ts: number;
}

export interface OAuth1Auth extends Auth {
	consumer_key: string;
	oauth_token: string;
	oauth_token_secret: string;
}

export interface OAuth2Auth extends Auth {
	access_token: string;
	refresh_token?: Maybe<string>;
	scopes?: Maybe<string>;
}

export interface BasicAuth extends Auth {
	username: string;
	password: string;
}

export interface APIKeyAuth extends Auth {
	apikey: string;
}

export interface ConfigAccount {
	id: string;
	type: 'ORG' | 'USER';
	public: boolean;
	name?: string;
	description?: string;
	avatarUrl?: string;
	totalCount?: number;
}

type Bag = { [key: string]: any };

export interface Config extends Bag {
	integration_type?: IntegrationType;
	exclusions?: Maybe<{ [id: string]: string }>;
	inclusions?: Maybe<{ [id: string]: string }>;
	oauth1_auth?: Maybe<OAuth1Auth>;
	oauth2_auth?: Maybe<OAuth2Auth>;
	basic_auth?: Maybe<BasicAuth>;
	apikey_auth?: Maybe<APIKeyAuth>;
	authorizer?: Maybe<Authorizer>;
	accounts?: Maybe<{ [id: string]: ConfigAccount }>;
}
