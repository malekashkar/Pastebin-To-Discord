import { Client, ClientOptions, Message, MessageEmbed } from "discord.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import chalk from "chalk";

dotenv.config();

class Main extends Client {
  constructor(options?: ClientOptions) {
    super({
      ...options,
    });

    this.login(process.env.DISCORD_TOKEN);
    this.on("message", this.handleCommand);
    this.on("rateLimit", this.onRateLimit);
    console.log(`The bot is not on!`);
  }

  async onRateLimit(rateLimitInfo: Object) {
    console.log(rateLimitInfo);
  }

  async handleCommand(message: Message) {
    try {
      if (message.author.bot) return;

      const prefix = process.env.PREFIX;
      if (message.content.indexOf(prefix) !== 0) return;

      const content = message.content.replace(prefix, "");
      const args = content.trim().replace(/ /g, "\n").split(/\n+/g);
      const command = args.shift().toLowerCase();

      if (command === "paste") {
        const text = args[0] ? await getPasteText(args[0]) : null;
        if (!text)
          return message.channel.send(
            new MessageEmbed()
              .setTitle(`Error Caught`)
              .setColor("RED")
              .setDescription(
                `Please provide a valid code!\n\`\`\`${process.env.PREFIX}paste <code>\`\`\``
              )
          );

        const lines = text.toString().split(" \r");
        const send = setInterval(() => {
          for (let i = 0; i < 3; i++) {
            if (!lines[i] || !lines[i].trim() || lines[i] !== " ")
              message.channel.send(lines[i]);
          }

          lines.splice(0, 3);
          if (!lines.length) clearInterval(send);
        }, 10 * 1000);

        /*
        const lines = text.split("\n").map((x: string) => x.replace("\r", ""));
        const send = setInterval(() => {
          for (let i = 0; i < 3; i++) {
            if (lines[i] !== " ") message.channel.send(lines[i]);
          }

          lines.splice(0, 3);
          if (!lines.length) clearInterval(send);
        }, 5 * 1000);
        */
      }
    } catch (err) {
      console.log(chalk.red(err));
    }
  }
}

new Main();

async function getPasteText(code: string) {
  const pasteReq = await fetch(`https://pastebin.com/raw/${code}`);
  if (!pasteReq.ok) return false;
  else return (await pasteReq.text()) as string;
}
