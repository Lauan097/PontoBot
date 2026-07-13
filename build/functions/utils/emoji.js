import { formatEmoji } from "discord.js";
import fs from "node:fs/promises";
const filepath = process.env.ENV === "dev" ? "emojis.dev.json" : "emojis.json";
const file = await fs.readFile(filepath, "utf-8");
const emojis = JSON.parse(file);
const icon = /* @__PURE__ */ Object.create({});
const transform = (emojis2, animated) => {
  for (const [name, id] of Object.entries(emojis2)) {
    let toString2 = function() {
      return formatEmoji(id, animated);
    };
    var toString = toString2;
    const data = { id, animated, toString: toString2 };
    Object.assign(icon, { [name]: data });
  }
};
transform(emojis.static);
transform(emojis.animated, true);
export {
  icon
};
