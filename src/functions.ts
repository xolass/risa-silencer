import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
} from "@discordjs/voice";
import { Collection, VoiceChannel } from "discord.js";
import { existsSync } from "node:fs";
import { getState, setVoiceConnection } from "./state";

const AUDIO_OGG = "./donnie.ogg";
const AUDIO_MP3 = "./donnie.mp3";

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});

function createDonnieResource() {
  if (existsSync(AUDIO_OGG)) {
    return createAudioResource(AUDIO_OGG, { inputType: StreamType.OggOpus });
  }
  return createAudioResource(AUDIO_MP3);
}

function play() {
  if (player.state.status !== AudioPlayerStatus.Idle) return;
  player.play(createDonnieResource());
}

// check if target is in voice and join and disconnect if voiceConnection is active
// but target is not in voice.

export function connectToVoiceChannel(channel: VoiceChannel) {
  const { target, voiceConnection: existing } = getState();

  existing?.destroy();

  const voiceConnection = joinVoiceChannel({
    channelId: channel?.id,
    guildId: channel?.guildId,
    adapterCreator: channel?.guild
      .voiceAdapterCreator as DiscordGatewayAdapterCreator,
    selfDeaf: false,
  });

  setVoiceConnection(voiceConnection);
  voiceConnection.subscribe(player);

  voiceConnection.receiver.speaking.on("start", (userId) => {
    if (userId === target) {
      play();
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
    client.channels.cache.filter((c) => c.type === "GUILD_VOICE")
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
