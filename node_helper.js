'use strict';

/* Magic Mirror
 * Module: MMM-MHZ19
 */

const NodeHelper = require('node_helper');
const exec = require('child_process').exec;

module.exports = NodeHelper.create({
	start: function () {
		console.log('MHZ19 helper started ...');
	},

	// Subclass socketNotificationReceived received.
	socketNotificationReceived: function (notification, payload) {
		const self = this;

		if (notification === 'REQUEST-CO2') {
			const self = this

			//execute external mh_z19 Script
			exec("sudo ./modules/MMM-MHZ19/mh_z19.sh", (error, stdout) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				// Send CO2
				self.sendSocketNotification('DATA-CO2', {
					co2_value: stdout,
				});
			});
		}
	}
});
