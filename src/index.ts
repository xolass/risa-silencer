import Discord, { Intents, Message, VoiceChannel } from "discord.js";
import { config } from "dotenv";
import { connectToVoiceChannel } from "./functions";
import { getState, loadState, setClient, setVoiceChannel } from "./state";

config();
const Client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  partials: ["MESSAGE", "CHANNEL", "GUILD_MEMBER"],
});

const { TOKEN } = process.env;

// Client ready up handler
Client.on("ready", () => {
  loadState();
  setClient(Client);
  console.log("Sheeeshhhhhhhhhhhh");
});

// Message handler, did this and the commands in a hurry just to
// make it simpler to use for non programming people.
Client.on("messageCreate", async (message: Message) => {
  const { prefix, commands } = getState();
  const { content } = message;
  if (!content.startsWith(prefix)) return;
  const command = content.substring(prefix.length).split(" ")[0];

  if (!commands[command]) {
    await message.reply('Command not found, use "don!help" to see commands.');
    return;
  }

  commands[command].execute(message);
});

// When user in guild joins a voice channel, check if it is
// the target and if so join the channel with the target. Likewise
// if the target leaves the voice channel so will the bot.
Client.on("voiceStateUpdate", async (oldState, newState) => {
  const { voiceConnection, target, isTurnedOn } = getState();

  if (!isTurnedOn) return;
  if (newState.id !== target) return;

  if (oldState.channelId === null) {
    if (!newState.channelId) return;

    const channel = <VoiceChannel>(
      await Client.channels.fetch(newState.channelId)
    );

    if (!channel) return;

    setVoiceChannel(channel);
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
    const channel = <VoiceChannel>(
      await Client.channels.fetch(newState.channelId)
    );
    if (!channel) return;

    setVoiceChannel(channel);
    connectToVoiceChannel(channel);
  }
});

// login using bot api token
Client.login(TOKEN);
