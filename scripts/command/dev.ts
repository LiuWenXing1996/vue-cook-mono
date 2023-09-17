import { findAllPkgs } from "../utils/findAllpackages";
import { concurrentlyAsync, toLongCommond } from "../utils/concurrently";
import { clean } from "./clean";
import { resolve } from "path";

export const dev = async () => {
  const isClean = await clean();
  if (!isClean) {
    console.log("启动开发模式需要先执行一遍清除操作");
    return;
  }
  const allPkgs = await findAllPkgs();
  const commands = allPkgs.map((e, index) => {
    let command = "";
    if (index > 0) {
      const prePkg = allPkgs[index - 1];
      if (prePkg) {
        command += `wait-on '${resolve(prePkg.path, "./dist")}' && `;
      }
    }
    command += `pnpm --filter '${e.name}' dev`;
    return {
      command: command,
      name: e.name,
    };
  });
  console.log("commands", commands);
  const longCommands = toLongCommond(commands);
  console.log("longCommands", longCommands);
  await concurrentlyAsync([longCommands], { raw: true });
};
