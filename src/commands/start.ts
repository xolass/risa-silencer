import { checkForUserInVoice } from "../functions";
import { turnOn } from "../state";

export function startCommand() {
  turnOn();
  checkForUserInVoice();
}
