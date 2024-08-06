import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";
import { ChannelType, Collection, VoiceChannel } from "discord.js";
import { getState, setVoiceConnection } from "./state";

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});

function play(connection: VoiceConnection) {
  const resource = createAudioResource("./donnie.mp3");

  player.play(resource);
  connection.subscribe(player);
}

// check if target is in voice and join and disconnect if voiceConnection is active
// but target is not in voice.

export function connectToVoiceChannel(channel: VoiceChannel) {
  const { target } = getState();
  const voiceConnection = joinVoiceChannel({
    channelId: channel?.id,
    guildId: channel?.guildId,
    adapterCreator: channel?.guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  setVoiceConnection(voiceConnection);

  voiceConnection.receiver.speaking.on("start", (userId) => {
    if (userId === target && voiceConnection) {
      play(voiceConnection);
    }
  });
  voiceConnection.receiver.speaking.on("end", (userId) => {
    if (userId === target) {
      player.stop();
    }
  });
}

export function checkForUserInVoice() {
  const { voiceConnection, target, client } = getState();
  if (!client) return;
  let isIn = false;

  const vcs = <Collection<string, VoiceChannel>>(
    client.channels.cache.filter((c) => c.type === ChannelType.GuildVoice)
  );
  vcs.forEach((channel) => {
    if (channel.members.has(target)) {
      connectToVoiceChannel(channel);
      isIn = true;
    }
  });

  if (!isIn) {
    voiceConnection?.disconnect();
  }
}
