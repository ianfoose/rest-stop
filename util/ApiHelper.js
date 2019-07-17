module.exports.dataHelper = require('./DatabaseHelper.js');
const fs = require('fs');

const defaultConfigPath = './config.json';
var apiConfigs = {}

module.exports = function(configFilePath) {
	var configPath = defaultConfigPath;

	if(configFilePath) {
		configPath = configFilePath
	}

	apiConfigs = JSON.parse(fs.readFileSync(configPath, 'utf8'));

	console.log(apiConfigs);

	// initialize dataheper
	// dataHelper(apiConfigs);

	this.dataHelper(apiConfigs);
}

module.exports.formatDate = function(strDate) {
	
}

module.exports.formatTime = function(strTime) {

}