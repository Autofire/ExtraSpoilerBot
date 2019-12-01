const Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var rp = require('request-promise');
var fs = require(`fs`);

const authorID = '161610625808596994';


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Stuff for downloading
//let request = require(`request`);
function download(url, name, successCallback){

    rp.get(url)
		.pipe(fs.createWriteStream(name))
		.on('error', console.error)
		.on('close', successCallback);
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
        let args = message.content.substring(1).split(' ');
        let cmd = args[0];
		args.shift();
		let description = args.join(' ');
		if(description === '') {
			description = "[No description given]";
		}
		let fullAuthor = `${message.author.tag} (ID ${message.author.id})`;
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'goose':
				message.channel.send(message.attachments.array().length);
            	break;

			case 'spoil':
				if(message.attachments.array().length === 0) {
					message.channel.send(
						"Attach something to your message, " +
						"and then I'll reupload it as a spoiler. " +
						"Also please let everyone know why it's a spoiler " +
						"by providing a brief explanation with your image."
					);

					logger.info(`${fullAuthor} printed out usage information`);
				}
				else if(message.attachments.array().length > 1) {
					message.channel.send(
						"I can only handle one attachment at a time! " +
						"(Sorry for the hassle. If you want this changed, " +
						`let my programmer, <@${authorID}>, know.)`
					);

					logger.info(`${fullAuthor} uploaded too many attachments`);
				}
				else {

					let uploadMessage = `<@${message.author.id}> posts a spoiler: ${description}`;

					let a = message.attachments.first();
					let fname = 'SPOILER_' + a.filename;

					download(a.proxyURL, fname, (resp) => {
						message.channel.send(uploadMessage, {files: [`./${fname}`]})
							.then(() => {
								fs.unlink(fname, () => { 
									logger.info(`Deleted ${fname}`)
								});
							});
						message.delete();
					});

				}


				//message.delete();

				break;

            // Just add any case commands if you want to..
         }
     }
});

bot.login(auth.token);
