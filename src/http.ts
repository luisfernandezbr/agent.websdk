export default class Http {
	static get(url: string, headers: {[key: string]: string} = {}, responseType: XMLHttpRequestResponseType = 'json'): Promise<[any, number, {[key: string]: string}]> {
		return new Promise((resolve, reject) => {
			try {
				const xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				Object.keys(headers).forEach((key: string) => xhr.setRequestHeader(key, headers[key]));
				xhr.responseType = responseType;
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
					resolve([xhr.response, xhr.status, headerMap]);
				};
				xhr.send();
			} catch (ex) {
				reject(ex);
			}
		});
	}
}