import {
	IAppBasicAuth,
	IOAuth1Auth,
	IOAuth2Auth,
	IAPIKeyAuth,
} from './types';

// NOTE(robin): these types are projections from https://github.com/pinpt/agent.next/blob/master/sdk/mutation.go

interface commonDate {
	epoch: number;
	offset: number;
	rfc3339: string;
}

export interface MutationUser {
	ref_id: string; // id is the ref_id of the user
	basic_auth?: IAppBasicAuth;
	oauth1_auth?: IOAuth1Auth;
	oauth2_auth?: IOAuth2Auth;
	apikey_auth?: IAPIKeyAuth;
}

// MutationData is to be stringified and put in the body of agent.Mutation
export interface MutationData {
	ref_id: string; // id is the ref_id of the object
	model: string;
	action: 'create'|'update'|'delete';
	payload: WorkIssueUpdateMutation | WorkIssueCreateMutation; // TODO(robin): port remaining mutations
	user: MutationUser;
}

export interface NameRefID {
	name?: string;
	ref_id?: string;
}

export interface WorkIssueCreateMutation {
	title: string;
	description: string;
	assignee_ref_rd?: string;
	priority?: NameRefID;
	type?: NameRefID;
	project_ref_id: string;
	epic?: NameRefID;
	parent_ref_id?: string;
	labels: string[];
}

export interface WorkIssueUpdateMutation {
	set: {
		title?: string;
		transition?: NameRefID;
		status?: NameRefID;
		priority?: NameRefID;
		resolution?: NameRefID;
		epic?: NameRefID;
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
	start_date: commonDate;
	end_date: commonDate;
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
		start_date?: commonDate;
		end_date?: commonDate;
		issue_ref_ids: string[];
	}
	Unset: {
		issue_ref_ids: string[];
	}
}
