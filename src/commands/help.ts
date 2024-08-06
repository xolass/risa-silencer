import { Message, MessagePayload } from "discord.js";
import { Commands, getState } from "../state";

export function helpCommand(commands: Commands, message: Message) {
  const { prefix } = getState();
  // .setTitle("Donnie Bot Help");
  const helpMessage = Object.entries(commands)
    .map(([key, { help }]) => {
      return `### ${prefix}${key}\n - ${help}`;
    })
    .join("\n");
  const messagePayload = new MessagePayload(message, {
    reply: {
      messageReference: message,
    },
    ephemeral: true,
    content: helpMessage,
  });

  message.reply(messagePayload);
}
