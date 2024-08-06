import { VoiceConnection } from "@discordjs/voice";
import { Client, Message, VoiceChannel } from "discord.js";
import fs from "fs";
import { helpCommand } from "./commands/help";
import { startCommand } from "./commands/start";
import { stopCommand } from "./commands/stop";
import { targetCommand } from "./commands/target";

export type Commands = Record<
  string,
  {
    help: string;
    execute: (message: Message) => void;
  }
>;

interface State {
  client: Client | undefined;
  prefix: string;
  target: string;
  voiceChannel: VoiceChannel | undefined;
  voiceConnection: VoiceConnection | undefined;
  isTurnedOn: boolean;
  commands: Commands;
}

const state: State = {
  client: undefined,
  prefix: "don!",
  target: "",
  voiceChannel: undefined,
  voiceConnection: undefined,
  isTurnedOn: true,
  commands: {
    target: {
      help: "Set the person that Donnie will target. Usage: don!target @ElizaThornberry . Must @ (mention) a valid user. THIS MUST BE A VALID USER, MEANING THE NAME MUST BE HIGHLIGHTED BLUE INDICATING YOU ARE MENTIONING A USER.",
      execute: (message: Message) => {
        targetCommand(message);
      },
    },
    stop: {
      help: "Turn Donnie off.",
      execute: stopCommand,
    },
    start: {
      help: "Turn Donnie on. ;)",
      execute: startCommand,
    },
    help: {
      help: "List commands for donnie.",
      execute: (message: Message) => helpCommand(state.commands, message),
    },
  },
};

const stateFile = "state.json";

export const persistState = () => {
  const persistentData = {
    target: state.target,
  };
  fs.writeFileSync(stateFile, JSON.stringify(persistentData, null, 2));
};

export const loadState = () => {
  if (!fs.existsSync(stateFile)) {
    return;
  }

  const data = fs.readFileSync(stateFile);
  Object.assign(state, JSON.parse(data.toString()));
};

export const setVoiceConnection = (voiceConnection: VoiceConnection) => {
  state.voiceConnection = voiceConnection;
};

export const setVoiceChannel = (channel: VoiceChannel) => {
  state.voiceChannel = channel;
};

export const turnOff = () => {
  state.isTurnedOn = false;
  state.voiceConnection?.disconnect();
};

export const turnOn = () => {
  state.isTurnedOn = false;
};

export const setTarget = (target: string) => {
  state.target = target;
  persistState();
};

export const setClient = (client: Client) => {
  state.client = client;
};

export const getState = () => state;
