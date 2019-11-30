const Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

let request = require(`request`);
let fs = require(`fs`);
function download(url, name){
    request.get(url).on('error', console.error).pipe(fs.createWriteStream(name));
}

// Configure bot
const bot = new Discord.Client();

bot.once('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on("message", async message => {

    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'goose':
				message.channel.send('Honk!');
            	break;

			case 'spoil':
				const fs = require('fs');
				message.attachments.forEach(a => {
					message.channel.send('Capturing ' + a.filename);
				    //fs.writeFile(`./${a.filename}`, a.proxyURL);

					download(a.proxyURL, a.filename);
				});

				break;

            // Just add any case commands if you want to..
         }
     }
});

bot.login(auth.token);
