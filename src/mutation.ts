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
	title: string;
	description: string;
	assignee_ref_rd?: string;
	priority?: NameID;
	type?: NameID;
	project_ref_id: string;
	epic?: NameID;
	parent_ref_id?: string;
	labels: string[];
}

export interface WorkIssueUpdateMutation {
	set: {
		title?: string;
		transition?: NameID;
		status?: NameID;
		priority?: NameID;
		resolution?: NameID;
		epic?: NameID;
		assignee_ref_id?: string;
	};
	unset?: {
		epic?: boolean;
		assignee?: boolean;
	};
}

// this could be imported from datamodel
export type WorkSprintStatus = 'ACTIVE' | 'FUTURE' | 'CLOSED';

// WorkSprintCreateMutation is an create mutation for a sprint
export interface WorkSprintCreateMutation {
	name: string;
	goal?: string;
	status: WorkSprintStatus;
	start_date: string; // rfc3339 date
	end_date: string; // rfc3339 date
	issue_ref_ids: string[];
	project_ref_id?: string;
	board_ref_id: string[];
}

// WorkSprintUpdateMutation is an update mutation for a sprint
export interface WorkSprintUpdateMutation {
	Set: {
		name?: string;
		goal?: string;
		status: WorkSprintStatus;
		start_date?: string; // rfc3339 date
		end_date?: string; // rfc3339 date
		issue_ref_ids: string[];
	}
	Unset: {
		issue_ref_ids: string[];
	}
}
