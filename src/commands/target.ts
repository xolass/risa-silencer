import { Message } from "discord.js";
import { checkForUserInVoice } from "../functions";
import { setTarget } from "../state";

export async function targetCommand(message: Message) {
  const mentions = message.mentions.users.first();

  if (!mentions) return message.reply("Must mention a valid user.");

  const target = mentions.id;
  if (!target) return message.reply("Please provide a valid user.");

  setTarget(target);
  checkForUserInVoice();
}
