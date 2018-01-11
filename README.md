# osu-pp-weighting

Simple CLI tool that allows one to calculate his pp by manipulating their scores.

## How To Use

- Copy config.json.example to config.json and edit your API key.
- Run `node . user <username>` to set the current user.
- Run `node . fetch` to fetch the scores from the osu! API. This will erase any modifications made each time it's run and will also update the bonus pp.
- Run `node . add <pp>` to add a score of X pp. You can run more advanced operations by editing the config.json file itself.
- The `add` command will print your offline stats. If you didn't use the `add` command, you can use `view`.

## How It Works

Well, I'm just applying the pp formula. However, there's a missing data the API doesn't provide: *bonus pp*. It depends on your amount of ranked scores, which the API doesn't provide either. To calculate it, the tool will fetch 
all your scores from your top 100 and will deduce the bonus pp from the difference between our calculated raw pp and the raw pp the API provides. It also outputs your amount of ranked scores, but I didn't test that so I wouldn't 
guarantee.

Then, you can just add/remove/edit scores either from the CLI or in the config file after fetching and it will re-calculate your pps with bonus pp.

## Commands

- `reset`: Resets the bonus pp and scores.
- `user <username>`: Sets a new user and resets the bonus pp and scores.
- `fetch`: Fetches your scores from the osu! API and calculates bonus pp. Will erase any modification done before.
- `view`: View the current stored data and data returned by the osu! API.
- `add <pp>`: Adds a score to your current top 100.
