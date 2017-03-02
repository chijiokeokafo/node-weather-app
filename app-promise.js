const yargs = require('yargs');
const axios = require ('axios');

const argv = yargs
	.options({
		a: {
			demand: true, 
			alias: 'address',
			describe: 'Address tp fetch weather for',
			string: true
		},
		f: {
		    demand: true,
		    default: 'f',
		    choices: ['f', 'c'],
		    alias: 'format',
		    describe: 'temperature format, c or f',
		    string: true
		  }
	})
	.help()
	.alias('help', 'h')
	.argv;

var encoded = encodeURIComponent(argv.address);
var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}`;

axios.get(geocodeUrl).then((response) => {
	if (response.data.status === 'ZERO_RESULTS') {
		throw new Error('Unable to find that address.');
	}
	var lat = response.data.results[0].geometry.location.lat;
	var lng = response.data.results[0].geometry.location.lng;
	var weatherUrl = `https://api.darksky.net/forecast/8c563eb5189cc3c2c22746c3d480cbad/${lat},${lng}`;
	console.log(response.data.results[0].formatted_address);
	return axios.get(weatherUrl);
}).then((response) => {
	var temperature = response.data.currently.temperature;
	var apparentTemperature = response.data.currently.apparentTemperature;
	var humidity = response.data.currently.humidity;
	var percip = response.data.currently.precipProbability;
	console.log(`It's currently ${temperature}. It feels like ${apparentTemperature}. Humidity is ${humidity}, which means you're looking at a percipitation probability of ${percip}.`);
}).catch((e) => {
	if (e.code === 'ENOTFOUND') {
		console.log('Unable to connect to API servers.')
	} else {
		console.log(e.message);
	}
});
