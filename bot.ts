import { VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import Discord, {
  ChannelType,
  Collection,
  GatewayIntentBits,
  IntentsBitField,
  Partials,
  VoiceChannel,
} from "discord.js";
import { config } from "dotenv";
import fs from "fs";

config();
const Client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

const { TOKEN } = process.env;

// bot command prefix
const prefix = "don!";

let isTalking = false;
let channel: VoiceChannel | null = null;
let dispatcher = null;
let voiceConnection: VoiceConnection | null = null;
let target = "";
let onOff = true;

// Bot commands. These weren't in the original but I added them quickly just to make the bot
// easier to use because I'm a nice guy. :)
const Commands = {
  target: {
    help: "Set the person that Donnie will target. Usage: don!target @ElizaThornberry . Must @ (mention) a valid user. THIS MUST BE A VALID USER, MEANING THE NAME MUST BE HIGHLIGHTED BLUE INDICATING YOU ARE MENTIONING A USER.",
    execute: async (message) => {
      if (message.mentions.users.size < 1) {
        message.reply("Must mention a valid user.");
      } else {
        target = message.mentions.users.first().id;
        checkForUserInVoice();
        if (!target) {
          message.reply("Please provide a valid user.");
        }
      }
    },
  },
  stop: {
    help: "Turn Donnie off.",
    execute: () => {
      if (voiceConnection) {
        voiceConnection.disconnect();
      }
      onOff = false;
    },
  },
  start: {
    help: "Turn Donnie on. ;)",
    execute: () => {
      onOff = true;
      checkForUserInVoice();
    },
  },
  help: {
    help: "List commands for donnie.",
    execute: (message) => {
      let helpMessage = new Discord.EmbedBuilder().setTitle("Donnie Bot Help");

      for (let key in Commands) {
        helpMessage.addFields(`${prefix}${key}`, Commands[key].help);
      }
      message.reply(helpMessage);
    },
  },
};

Client.on("voiceStateUpdate", async (oldState, newState) => {
  console.log(oldState, newState);
});

// Client ready up handler
Client.on("ready", () => {
  console.log("Sheeeshhhhhhhhhhhh");
});

// Message handler, did this and the commands in a hurry just to
// make it simpler to use for non programming people.
Client.on("messageCreate", (message) => {
  let content = message.content;
  if (content.startsWith(prefix)) {
    let cmd = content.substring(prefix.length).split(" ")[0];
    if (Commands[cmd]) {
      Commands[cmd].execute(message);
    } else {
      message.reply('Command not found, use "don!help" to see commands.');
    }
  }
});

Client.on("debug", (debug) => {
  console.log(debug);
});

Client.on("error", (error) => {
  console.log(error);
});

Client.on("speaking", async (oldState, newState) => {
  console.log(oldState, newState);
});
// When user in guild joins a voice channel, check if it is
// the target and if so join the channel with the target. Likewise
// if the target leaves the voice channel so will the bot.
Client.on("voiceStateUpdate", async (oldState, newState) => {
  if (oldState.id === target && newState.id === target && onOff) {
    if (oldState.channelId === null) {
      if (!newState.channelId) return;

      channel = (await Client.channels.fetch(
        newState.channelId
      )) as VoiceChannel;

      connectToVoiceChannel(channel);
    }
    if (
      oldState.channelId != null &&
      newState.channel === null &&
      voiceConnection != null
    ) {
      voiceConnection.disconnect();
    }
    if (
      oldState.channelId != null &&
      newState.channel != null &&
      newState.channelId
    ) {
      channel = (await Client.channels.fetch(
        newState.channelId
      )) as VoiceChannel;
      connectToVoiceChannel(channel);
    }
  }
});

// When guild member is speaking check if it is the targeted member
// check to see if donnie is already talking and if not make donnie speak
// when member

// This function plays the donnie audio
// it will recursively play while the target
// is still speaking.
function play(connection: VoiceConnection) {
  const audioFile = fs.readFileSync("./donnie.mp3");
  connection.playOpusPacket(audioFile);
}

// check if target is in voice and join and disconnect if voiceConnection is active
// but target is not in voice.
const checkForUserInVoice = () => {
  let isIn = false;
  const vcs = Client.channels.cache.filter(
    (c) => c.type === ChannelType.GuildVoice
  ) as Collection<string, VoiceChannel>;
  vcs.forEach((channel) => {
    if (channel.members.has(target)) {
      connectToVoiceChannel(channel);
      isIn = true;
    }
  });
  if (!isIn && voiceConnection) {
    voiceConnection.disconnect();
  }
};

function connectToVoiceChannel(channel: VoiceChannel) {
  voiceConnection = joinVoiceChannel({
    channelId: channel?.id,
    guildId: channel?.guildId,
    adapterCreator: channel?.guild.voiceAdapterCreator,
  });

  voiceConnection.receiver.speaking.on("start", (userId) => {
    if (userId === target) {
      if (!isTalking) {
        isTalking = true;
        play(voiceConnection!);
      }
    }
  });
  voiceConnection.receiver.speaking.on("end", (userId) => {
    if (userId === target) {
      isTalking = false;
    }
  });
}

// login using bot api token
Client.login(TOKEN);