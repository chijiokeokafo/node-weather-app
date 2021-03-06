const yargs = require('yargs');
const axios = require ('axios');
const tuc = require('temp-units-conv');

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
	    lng = response.data.results[0].geometry.location.lng;
	    
	var weatherUrl = `https://api.darksky.net/forecast/8c563eb5189cc3c2c22746c3d480cbad/${lat},${lng}`;
	console.log(response.data.results[0].formatted_address);
	return axios.get(weatherUrl);
}).then((response) => {
	var temperature = Math.round(tuc.fahrenheitToCelsius(response.data.currently.temperature));
	    apparentTemperature = Math.round(tuc.fahrenheitToCelsius(response.data.currently.apparentTemperature));
	    humidity = response.data.currently.humidity;
	    precip = response.data.currently.precipProbability;

	console.log(`It's currently ${temperature}. It feels like ${apparentTemperature}. Humidity is ${humidity}.`);
	if (precip != 0) {
		console.log(`Which means you're looking at a percipitation probability of ${precip}`);
	};
}).catch((e) => {
	if (e.code === 'ENOTFOUND') {
		console.log('Unable to connect to API servers.')
	} else {
		console.log(e.message);
	}
});
