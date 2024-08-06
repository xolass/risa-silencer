import { Message, MessagePayload } from "discord.js";
import { Commands, prefix } from "../commons";

export default (commands: Commands, message: Message) => {
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
};
