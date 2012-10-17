/**
 * hootsuite - A node module for calling the Hootsuite API
 * See http://hootsuite.com/developers/api for details
 * about the API requests and responses
 * Copyright (c) 2012 Gabriel Preston
 * MIT Licence
 */

var url = require('url');
var http = require('http');

/**
 * The main hootsuite constructor, takes the hootsuite API URL, API Token and
 * additional options
 * @param {String} hootsuite_url The URL of the Yourls service being used
 * @param {String} api_token     The users API token
 * @param {Object} options       Optional options
 */
var hootsuite = function(hootsuite_url, api_token, options) {
	// Set default options
	options = options || {
		format: 'json',
		api_url: 'api.hootsuite.com',
		api_version: '2',
		socialNetworks: [ ]
	};

	// Set up the config for requests being made with the instance of this
	this.config = {
		api_token: api_token,
		format: options.format,
		api_url: hootsuite_url,
	    api_version: options.api_version,
		socialNetworks: options.socialNetworks
	};

	return this;
};

/**
 * Generates the URL object to be passed to the HTTP request for a specific
 * API method call
 * @param  {Object} query The query object
 * @return {Object}       The URL object for this request
 */
hootsuite.prototype._generateNiceUrl = function(query, endpoint) {
	var result = url.parse(url.format({
		protocol: 'http',
		hostname: this.config.api_url,
		pathname: '/api/'+this.config.api_version+'/'+endpoint,
		query: query,
		method: 'POST'
	}));
	// HACK: Fixes the redirection issue in node 0.4.x
	if (!result.path) { result.path = result.pathname + result.search; }

	return result;
};

/**
 * Function to do a HTTP POST request with the current query
 * @param  {Object}   request_query The current query object
 * @param  {Function} cb            The callback function for the returned data
 * @return {void}
 */
hootsuite.prototype._doRequest = function(request_query, cb) {
	// Pass the requested URL as an object to the post request
	var req = http.request(request_query, function(res) {
			var data = [];
			res
			.on('data', function(chunk) { data.push(chunk); })
			.on('end', function() {
					var urldata = data.join('').trim();
					var result;
					try {
						result = JSON.parse(urldata);
					} catch (exp) {
						result = {'status_code': 500, 'status_text': 'JSON Parse Failed'}
					}
					cb(null, result);
			});
	})
	.on('error', function(e) {
			cb(e);
	});
	req.end();
};

/**
 * Request to post a long format message
 * @param  {String}   message The message to be posted
 * @param  {Function} cb      The callback function with the results
 * @return {void}
 */
hootsuite.prototype.post_long = function(message, cb) {
	var query = {
		signature: this.config.api_token,
		format: this.config.format,
		message: message,
	};

	if ( this.config.socialNetworks.length == 0 ) {
		cb(null,'No Social Network IDs Provided');
	}
	this._doRequest(this._generateNiceUrl(query, 'messages'), cb);
};

/**
 * Request to post a short format message
 * @param  {String}   message The message to be posted
 * @param  {Function} cb      The callback function with the results
 * @return {void}
 */
hootsuite.prototype.post_short = function(message, cb) {
	var query = {
		signature: this.config.api_token,
		format: this.config.format,
		message: message,
	};

	if ( this.config.socialNetworks.length == 0 ) {
		cb(null,'No Social Network IDs Provided');
	}
	
	this._doRequest(this._generateNiceUrl(query, 'messages'), cb);
};

// Export as main entry point in this module
module.exports = hootsuite;