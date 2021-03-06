let axios = require('axios');
let https = require('https');
let Event = require('../definitions/Event');
let DancerDef = require('../definitions/Dancer');
let CircularJson = require('circular-json');
const querystring = require('querystring');
const LoggerService = require('../handlers/logger');

const logger = new LoggerService();
class WSDC {
	constructor() {
		this.DancersUrl =
			'http://swingdancecouncil.herokuapp.com/pages/dancer_search_by_fragment.json?term=';
		this.DancerUrl = 'https://points.worldsdc.com/lookup/find';
		this.EventsUrl = 'https://www.worldsdc.com/wp-admin/admin-ajax.php';
	}
	GetDancers() {
		let dPromise = new Promise((resolve, reject) => {
			axios
				.get(this.DancersUrl, { timeout: 10000 })
				.then(results => {
					resolve(results.data);
				})
				.catch(error => {
					logger.error(`Failed to get url: ${this.DancersUrl}`);
					reject(error);
				});
		});
		return dPromise;
	}
	async getDancer(wsdcid) {
		return new Promise((resolve, reject) => {
			axios
				.post(this.DancerUrl, { q: DancerDef.SanitizeWsdcid(wsdcid) })
				.then(dancerResult => {
					let serialized = CircularJson.stringify(dancerResult.data);
					let parsed = CircularJson.parse(serialized);
					resolve(parsed);
				})
				.catch(error => {
					console.log(error);
					reject(error);
				});
		});
	}
	getEventsOld() {
		return new Promise((resolve, reject) => {
			let postData = querystring.stringify({
				date_range: 12,
				action: 'fetch_searched_event',
			});
			const options = {
				hostname: 'www.worldsdc.com',
				port: 443,
				path: '/wp-admin/admin-ajax.php',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': postData.length,
				},
				method: 'POST',
			};
			let req = https.request(options, res => {
				let data = '';
				res.on('data', d => {
					data += d;
				});
				res.on('end', () => {
					let eventList = [];
					data = Event.SanitizeRaw(data);
					let parsedData = CircularJson.parse(data);
					for (let i = 0, len = parsedData.length; i < len; i++) {
						const event = new Event();
						event.processWsdcExportData(parsedData[i]);
						eventList.push(event);
					}
					resolve(eventList);
				});
			});
			req.on('error', e => {
				console.log('error: ', e);
			});
			req.write(postData);
			req.end();
		});
	}
	getEvents() {
		return new Promise((resolve, reject) => {
			const options = {
				hostname: 'www.worldsdc.com',
				port: 443,
				path: '/event-calendar/',
				method: 'POST',
			};
			let req = https.request(options, res => {
				let data = '';
				res.on('data', d => {
					data += d;
				});
				res.on('end', () => {
					let eventList = [];
					const regex = /events: (\[[^\n]+)\n/;
					let parsed = {};
					const rMatch = data.replace(regex, (match, $1) => {
						parsed = $1.trim().substring(0, $1.length - 1);
						parsed = JSON.parse(parsed);
					});
					for (let i = 0, len = parsed.length; i < len; i++) {
						const event = new Event();
						event.processParsedCalendarData(parsed[i]);
						eventList.push(event);
					}
					resolve(eventList);
				});
			});
			req.on('error', e => {
				console.log('error: ', e);
			});
			req.end();
		});
	}
}

module.exports = function() {
	return new WSDC();
};
