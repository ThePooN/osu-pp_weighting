const config = require("./config.json");

const fs = require("fs");
const Nodesu = require("nodesu");
const osuApi = new Nodesu.Client(config.api_key);

function isFetched() {
	return (config.offline_scores != null);
}
function saveConfig() {
	const string = JSON.stringify(config, null, "\t");
	fs.writeFile("./config.json", string, function(err) {
		if(err)
			return console.err(err);
	});
}

function ppValue(rawPp, index) {
	return rawPp * Math.pow(0.95, index - 1);
}
function getTotalPp() {
	let pp = 0;
	config.offline_scores.forEach(function(score, index) {
		if(index < 100)
			pp = pp + ppValue(score.pp, index + 1);
	});
	pp = pp + config.bonus_pp;
	return pp;
}
function getRankedScores() {
	const left = config.bonus_pp/(417-1/3)-1;
	scores = Math.log(-left)/Math.log(0.9994); // bonus_pp/(417-1/3)-1=-(0.9994^scores) <=> log(-(bonus_pp/(417-1/3)-1))/log(0.9994) Source: osu-performance/Processor/User.cpp:56
	return scores;
}

const action = process.argv.slice(2)[0];
switch(action) {
	case "user":
		config.username = process.argv.slice(3).join(" ")
	case "reset":
		delete config.bonus_pp;
		delete config.offline_scores;
		saveConfig();
		console.log("Reset all data for user "+config.username+". Please fetch again!");
		break;
	case "fetch":
	case "view":
		if(!config.api_key || !config.username)
			return console.error("You must fill your API key and username!");
	case "add":
		switch(action) {
			case "fetch":
				osuApi.user.get(config.username, Nodesu.Mode.osu).then(function(user) {
					osuApi.user.getBest(config.username, Nodesu.Mode.osu, 100).then(function(scores) {
						config.bonus_pp = 0;
						config.offline_scores = [];
						scores.forEach(function (score, scoreIndex) {
							config.offline_scores[scoreIndex] = {
								"beatmap_id": parseInt(score.beatmap_id),
								"pp": parseFloat(score.pp)
							};
						});
						config.bonus_pp = parseFloat(user.pp_raw) - getTotalPp();
						saveConfig();
						console.log("Successfully fetched all scores!");
						console.log("Online stats for "+config.username+":");
						console.log(user.pp_raw+"pp");
						console.log("Bonus pp: "+config.bonus_pp);
						console.log("Ranked scores: "+getRankedScores());
					});
				});
				break;
			case "add":
				if(!isFetched())
					return console.error("You must fetch your current scores first!");
				if(!parseFloat(process.argv.slice(2)[1]))
					return console.error("Please enter a valid pp value!");
				config.offline_scores.push({
					"beatmap_id": null,
					"pp": parseFloat(process.argv.slice(2)[1])
				});
				config.offline_scores.sort(function(a, b) {
					if(a.pp < b.pp)
						return 1;
					else if(a.pp > b.pp)
						return -1;
					else
						return 0;
				});
				config.offline_scores.pop();
				saveConfig();
			default:
				if(!isFetched())
					return console.error("You must fetch your current scores first!");
				osuApi.user.get(config.username, Nodesu.Mode.osu).then(function(user) {
					console.log("Online stats for "+config.username+":");
					console.log(user.pp_raw+"pp");
					console.log("Offline stats for "+config.username+":");
					console.log((Math.round(getTotalPp()*100)/100).toFixed(2)+"pp");
					console.log("Bonus pp: "+config.bonus_pp);
					console.log("Ranked scores: "+getRankedScores());
				});
		}
		break;
	default:
		console.log("Read the README for usage!");
		break;
}
