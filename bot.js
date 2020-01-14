const Discord = require('discord.js');
var logger = require('winston');
//var auth = require('./auth.json');
var discordToken = process.env.DISCORD_TOKEN;
var rp = require('request-promise');
var fs = require(`fs`);

const authorID = '161610625808596994';
const tmpDir = './tmp';


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Stuff for downloading
function download(url, name, successCallback){

    rp.get(url)
		.pipe(fs.createWriteStream(name))
		.on('error', console.error)
		.on('close', successCallback);
}

function safelyDeleteFile(fname) {

	try {
		if(fs.existsSync(fname)) {
			fs.unlink(fname, () => { 
				logger.info(`Deleted ${fname}`)
			});
		}
	}
	catch(ex) {
		logger.error(ex);
		logger.error(`Failed to delete ${fname}`);
	}
}

// Misc functions
function random(mn, mx) {  
	return Math.random() * (mx - mn) + mn;  
}  

// Configure bot
const bot = new Discord.Client();

if(!fs.existsSync(tmpDir)) {
	logger.info("Temporary directory is missing; creating one...");
	fs.mkdirSync(tmpDir);
}

bot.once('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on("message", async message => {

    if (!message.author.bot && message.content.substring(0, 1) == '!') {
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
				message.channel.send("Honk!");
            	break;

			case 'secret':
				message.author.createDM()
					.then((newChannel) => {
						newChannel.send("Test");
					});
				break;

			case 'snom':
				const snomUploadMessages = ["Alexa's adorable Snom", "Alexa's Snom", "Alexa's lil' Snom", "Alexa's Snom loves uwu"];
				let uploadMessage =
					snomUploadMessages[Math.floor(Math.random() * snomUploadMessages.length)];

				message.channel.send(uploadMessage, {files: [`./snom/snom1.gif`]})
					.then(() => {
						logger.info(`Uploaded ${fname}`);
					})
					.catch((ex) => {
						logger.error(ex);
						logger.error("Upload failed!");
					});
				break;

			case 'cw':
			case 'spoil':
			case 'spoiler':
				logger.info(' ');
				logger.info(`${fullAuthor} has made a request`);
				logger.info(`${fullAuthor}'s message was '${message.content}'`);

				if(message.attachments.array().length === 0) {
					message.author.createDM()
						.then((newChannel) => {
							newChannel.send(
								"Attach something to your message, " +
								"and then I'll reupload it as a spoiler. " +
								"Also please let everyone know why it's a spoiler " +
								"by providing a brief explanation with your image. " +
								"If you are trying to post a text spoiler, " +
								"please wrap it in vertical bars.\n\n" +

								"For example, `||spoiler text||`, yields ||spoiler text||."
							);
						});

					logger.info(`${fullAuthor} printed out usage information`);

					message.delete();
					logger.info(`Deleted original message`);
				}
				else if(message.attachments.array().length > 1) {
					message.author.createDM()
						.then((newChannel) => {
							newChannel.send(
								"I can only handle one attachment at a time! " +
								"(Sorry for the hassle. If you want this changed, " +
								`let my programmer, <@${authorID}>, know.)`
							);
						});

					logger.info(`${fullAuthor} uploaded too many attachments`);

					message.delete();
					logger.info(`Deleted original message`);
				}
				else {

					let uploadMessage = '';
					if(cmd === 'cw') {
						uploadMessage =
							`<@${message.author.id}> posts something ` +
							`with a content warning: ${description}`;
					}
					else {
						uploadMessage = `<@${message.author.id}> posts a spoiler: ${description}`;
					}

					let a = message.attachments.first();
					let fname = `${tmpDir}/SPOILER_${a.filename}`;

					logger.info(`${fullAuthor} has sent in a file: `);
					logger.info(` id: ${a.id}`);
					logger.info(` filesize: ${a.filesize}`);
					logger.info(` url: ${a.url}`);
					logger.info(` proxyURL: ${a.proxyURL}`);

					try {
						download(a.url, fname, (resp) => {
							logger.info(`Downloaded as ${fname}`);
							message.channel.send(uploadMessage, {files: [`./${fname}`]})
								.then(() => {
									logger.info(`Uploaded ${fname}`);
									safelyDeleteFile(fname);
								})
								.catch((ex) => {
									logger.error(ex);
									logger.error("Upload failed!");

									safelyDeleteFile(fname);
								});

							// We can only delete the message once we
							// successfully download the file.
							message.delete();
							logger.info(`Deleted original message`);
						});
					}
					catch(ex) {
						logger.error(ex);
						logger.error("Download failed!");

						message.delete();
						logger.info(`Deleted original message`);

						safelyDeleteFile(fname);
					}
					// We cannot move safelyDeleteFile into a finally block
					// because, during normal execution, we mustn't delete it
					// until the upload fully succeeds.

				}
				break;

		} // switch(cmd)
	} // if(message.content.substring(0, 1) == '!')
}); // bot.on("message", ...

//logger.info(process.env);
bot.login(discordToken);
