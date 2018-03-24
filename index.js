const Discord = require('discord.js');
const bot = new Discord.Client();
const ytdl = require('ytdl-core');
const config = require('./config.json');

var youtube = require('./youtube.js');


var ytAudioQueue = [];
var dispatcher = null;

bot.on('message', function(message) {
    var messageParts = message.content.split(' ');
    var command = messageParts[0].toLowerCase();
    var parameters = messageParts.splice(1, messageParts.length);

    switch (command) {

        case "-join" : 
        message.reply("Attempting to join channel " + parameters[0]);
        JoinCommand(parameters[0], message);
        break;
    
        case "-play" :
        PlayCommand(parameters.join(" "), message);
        break;

        case "-playqueue":
        PlayQueueCommand(message);
        break;
    }
});


    function PlayCommand(searchTerm) {
        if(bot.voiceConnections.array().length == 0) {
            var defaultVoiceChannel = bot.channels.find(val => val.type === 'voice').name;
            JoinCommand(defaultVoiceChannel);
        }
        youtube.search(searchTerm, QueueYtAudioStream);
    }

    function PlayQueueCommand(message) {
        var queueString = "";

        for(var x = 0; x < ytAudioQueue.length; x++) {
            queueString += ytAudioQueue[x].videoName + ", ";
        }
        queueString = queueString.substring(0, queueString.length - 2);
        message.reply(queueString);
    }

    function JoinCommand(ChannelName) {
        var voiceChannel = GetChannelByName(ChannelName);

        if (voiceChannel) {
            voiceChannel.join();
            console.log("Joined " + voiceChannel.name);
        }
        
        return voiceChannel;
        
    }

    /* Helper Methods */

    function GetChannelByName(name) {
        var channel = bot.channels.find(val => val.name === name);
        return channel;
    }

  

    function QueueYtAudioStream(videoId, videoName) {
        var streamUrl = youtube.watchVideoUrl + videoId;

        if (!ytAudioQueue.length) {
            ytAudioQueue.push(
                {
                    'streamUrl' : streamUrl,
                    'videoName' : videoName
                }
            );
            console.log('Queued audio ' + videoName);
            PlayStream(ytAudioQueue[0].streamUrl);
        }
        else {
            ytAudioQueue.push(
                {
                    'streamUrl' : streamUrl,
                    'videoName' : videoName
                }
            );
        }
        console.log("Queued audio " + videoName);
    }

    function PlayStream(streamUrl) {
        const streamOptions = {seek: 0, volume: 1};

        if (streamUrl) {
            const stream = ytdl(streamUrl, {filter: 'audioonly'});

            if (dispatcher == null) {
                var voiceConnection = bot.voiceConnections.first();

                if(voiceConnection) {
                    console.log("Now Playing " + ytAudioQueue[0].videoname);
                    dispatcher = bot.voiceConnections.first().playStream(stream, streamOptions);

                    dispatcher.on('end', () => {
                        dispatcher = null;
                        PlayNextStreamInQueue();
                    });

                    dispatcher.on('error', (err) => {
                        console.log(err);
                    });
                }
            } else {
                dispatcher = bot.voiceConnections.first().playStream(stream, streamOptions);
            }
            
        }
    }

    function PlayNextStreamInQueue() {
        ytAudioQueue.splice(0, 1);

        if (ytAudioQueue.length != 0) {
            console.log("now Playing " + ytAudioQueue[0].videoName);
            PlayStream(ytAudioQueue[0].streamUrl);
        }
    }


bot.login(config.token);