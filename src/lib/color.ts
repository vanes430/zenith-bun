// lib/color.ts
import chalk from "chalk";
import type { ChalkInstance } from "chalk";

// Export chalk langsung
export { chalk };

// Definisikan tipe agar semua function wajib ada
type ColorFunctions = {
  reset: ChalkInstance;
  bold: ChalkInstance;

  red: ChalkInstance;
  green: ChalkInstance;
  yellow: ChalkInstance;
  blue: ChalkInstance;
  magenta: ChalkInstance;
  cyan: ChalkInstance;
  white: ChalkInstance;

  brightRed: ChalkInstance;
  brightGreen: ChalkInstance;
  brightYellow: ChalkInstance;
  brightBlue: ChalkInstance;
  brightMagenta: ChalkInstance;
  brightCyan: ChalkInstance;
  brightWhite: ChalkInstance;
};

// Semua value berasal dari chalk langsung
export const color: ColorFunctions = {
  reset: chalk.reset,
  bold: chalk.bold,

  red: chalk.red,
  green: chalk.green,
  yellow: chalk.yellow,
  blue: chalk.blue,
  magenta: chalk.magenta,
  cyan: chalk.cyan,
  white: chalk.white,

  brightRed: chalk.redBright,
  brightGreen: chalk.greenBright,
  brightYellow: chalk.yellowBright,
  brightBlue: chalk.blueBright,
  brightMagenta: chalk.magentaBright,
  brightCyan: chalk.cyanBright,
  brightWhite: chalk.whiteBright,
};

// Helper
export function paint(text: string, apply: ChalkInstance) {
  return apply(text);
}
