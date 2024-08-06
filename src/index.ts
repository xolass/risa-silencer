import Discord, {
  GatewayIntentBits,
  IntentsBitField,
  Partials,
  VoiceChannel,
} from "discord.js";
import { config } from "dotenv";
import { connectToVoiceChannel } from "./functions";
import { getState, loadState, setClient, setVoiceChannel } from "./state";

config();
const Client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
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
Client.on("messageCreate", (message) => {
  const { prefix, commands } = getState();
  const { content } = message;
  if (!content.startsWith(prefix)) return;
  const command = content.substring(prefix.length).split(" ")[0];

  if (!commands[command])
    return message.reply('Command not found, use "don!help" to see commands.');

  commands[command].execute(message);
});

// When user in guild joins a voice channel, check if it is
// the target and if so join the channel with the target. Likewise
// if the target leaves the voice channel so will the bot.
Client.on("voiceStateUpdate", async (oldState, newState) => {
  const { voiceConnection, target, isTurnedOn } = getState();

  if (newState.id === target && isTurnedOn) {
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
  }
});

// login using bot api token
Client.login(TOKEN);
