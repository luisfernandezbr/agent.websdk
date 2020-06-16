export interface Publisher {
	name: string;
	avatar: string;
	url: string;
}

export default interface Integration {
    name: string;
    description: string;
    tags: string[];
    refType: string;
    icon: string | React.ReactElement;
    installed: boolean;
    publisher: Publisher;
    uiURL: string;
}
