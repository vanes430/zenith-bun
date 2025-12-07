// src/handler/logging.ts
import { color } from "../lib/color";

export const log = {
  msg: (name: string, text: string) => {
    const size = text?.length ?? 0;
    console.log(
      color.green(
        `[MSG] ${name} size: ${size} \n => ${text}`
      )
    );
  },

  event: (text: string) => {
    console.log(color.blue(`[EVENT] ${text}`));
  },

  error: (text: string) => {
    console.log(color.red(`[ERROR] ${text}`));
  }
};
