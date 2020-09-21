import {
	IAppBasicAuth,
	IOAuth1Auth,
	IOAuth2Auth,
	IAPIKeyAuth,
} from './types';

// NOTE(robin): these types are projections from https://github.com/pinpt/agent.next/blob/master/sdk/mutation.go

export interface MutationUser {
	id: string; // id is the ref_id of the user
	basic_auth?: IAppBasicAuth;
	oauth1_auth?: IOAuth1Auth;
	oauth2_auth?: IOAuth2Auth;
	apikey_auth?: IAPIKeyAuth;
}

// MutationData is to be stringified and put in the body of agent.Mutation
export interface MutationData {
	id: string; // id is the ref_id of the object
	model: string;
	action: 'create'|'update'|'delete';
	payload: WorkIssueUpdateMutation | WorkIssueCreateMutation; // TODO(robin): port remaining mutations
	user: MutationUser;
}

export interface NameID {
	name?: string;
	id?: string;
}

export interface WorkIssueCreateMutation {
	Title: string;
	Description: string;
	AssigneeRefID?: string;
	Priority?: NameID;
	Type?: NameID;
	ProjectRefID: string;
	Epic?: NameID;
	ParentRefID?: string;
	Labels: string[];
}

export interface WorkIssueUpdateMutation {
	set: {
		title?: string;
		transition?: NameID;
		status?: NameID;
		priority?: NameID;
		resolution?: NameID;
		epic?: NameID;
		assigneeRefID?: string;
	};
	unset?: {
		epic?: boolean;
		assignee?: boolean;
	};
}
