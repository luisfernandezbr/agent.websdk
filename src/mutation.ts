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
	ref_id: string;
	basic_auth?: IAppBasicAuth;
	oauth1_auth?: IOAuth1Auth;
	oauth2_auth?: IOAuth2Auth;
	apikey_auth?: IAPIKeyAuth;
}

// MutationData is to be stringified and put in the body of agent.Mutation
export interface MutationData {
	ref_id: string;
	model: string;
	action: 'create'|'update'|'delete';
	payload: WorkIssueUpdateMutation | WorkIssueCreateMutation | WorkSprintCreateMutation | WorkSprintUpdateMutation; // TODO(robin): port remaining mutations
	user: MutationUser;
}

export interface NameRefID {
	name?: string;
	ref_id?: string;
}

// NOTE(robin): this is cc'd from datamodel.types's `PipelineWorkProjectCapabilityIssueMutationFieldsTypeEnum`
// This is intensionally not exported because you should be able to just do PipelineWorkProjectCapabilityIssueMutationFieldsTypeEnum.STRING for type.
type MutationFieldsType = 'STRING' | 'NUMBER' | 'WORK_ISSUE_TYPE' | 'WORK_ISSUE_PRIORITY' | 'STRING_ARRAY' | 'USER' | 'ATTACHMENT' | 'TEXTBOX' | 'EPIC' | 'WORK_SPRINT' | 'WORK_ISSUE' | 'DATE';

export interface MutationFieldValue {
	ref_id: string;
	type: MutationFieldsType;
	value: any;
}

export interface WorkIssueCreateMutation {
	project_ref_id: string;
	project: NameRefID;
	fields: MutationFieldValue[];

	// NOTE(robin): these fields are all deprecated
	title?: string;
	description?: string;
	assignee_ref_rd?: string;
	priority?: NameRefID;
	type?: NameRefID;
	epic?: NameRefID;
	parent_ref_id?: string;
	labels?: string[];
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
	board_ref_ids: string[];
}

// WorkSprintUpdateMutation is an update mutation for a sprint
export interface WorkSprintUpdateMutation {
	set: {
		name?: string;
		goal?: string;
		status: WorkSprintStatus;
		start_date?: commonDate;
		end_date?: commonDate;
		issue_ref_ids: string[];
	}
	unset: {
		issue_ref_ids: string[];
	}
}
