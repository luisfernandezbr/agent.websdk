export default class Graphql {
	static query(url: string, query: string, variables: {[key: string]: any} = {}, headers: {[key: string]: string} = {}, withCredentials = true): Promise<[any, number, {[key: string]: string}]> {
		return new Promise((resolve, reject) => {
			try {
				const xhr = new XMLHttpRequest();
				xhr.open('POST', url, true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				Object.keys(headers).forEach((key: string) => xhr.setRequestHeader(key, headers[key]));
				xhr.responseType = 'json';
				xhr.withCredentials = withCredentials;
				xhr.onerror = (e) => reject(e);
				xhr.onload = () => {
					const headers = xhr.getAllResponseHeaders();
			    	const arr = headers.trim().split(/[\r\n]+/);
    				const headerMap: {[key: string]: string} = {};
    				arr.forEach((line: string) => {
      				const parts = line.split(': ');
      				const header = parts.shift();
      				const value = parts.join(': ');
      				headerMap[header] = value;
					});
					if (xhr.response.errors?.length) {
						reject(new Error(`${xhr.response.errors[0].message}`));
						return;
					}
					if (xhr.status === 200 && xhr.response.data) {
						resolve([xhr.response.data, xhr.status, headerMap]);
					} else {
						resolve([xhr.response, xhr.status, headerMap]);
					}
				};
				xhr.send(JSON.stringify({query, variables}));
			} catch (ex) {
				reject(ex);
			}
		});
	}
}