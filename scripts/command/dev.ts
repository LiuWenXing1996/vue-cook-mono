import {
  ICommand,
  concurrentlyAsync,
  toLongCommond,
} from "../utils/concurrently";
import { clean } from "./clean";
import { join } from "path";

export const dev = async () => {
  await clean();
  const commands: ICommand[] = [
    { name: "@vue-cook/core", command: "pnpm --filter '@vue-cook/core' dev" },
    {
      name: "@vue-cook/render",
      command: `wait-on '${join(
        process.cwd(),
        "/packages/core/dist"
      )}' && pnpm --filter '@vue-cook/render' dev`,
    },
    {
      name: "@vue-cook/element-plus-materials",
      command: `wait-on '${join(
        process.cwd(),
        "/packages/render/dist"
      )}' && pnpm --filter '@vue-cook/element-plus-materials' dev`,
    },
    {
      name: "@vue-cook/ui",
      command: `wait-on '${join(
        process.cwd(),
        "/packages/element-plus-materials/dist"
      )}' && pnpm --filter '@vue-cook/ui' dev`,
    },
    {
      name: "@vue-cook/cli",
      command: `wait-on '${join(
        process.cwd(),
        "/packages/ui/dist"
      )}' && pnpm --filter '@vue-cook/cli' dev`,
    },
    {
      name: "server-demo",
      command: `wait-on '${join(
        process.cwd(),
        "/packages/cli/dist"
      )}' && pnpm --filter 'server-demo' start:debug`,
    },
    {
      name: "studio-demo", 
      command: `wait-on '${join(
        process.cwd(),
        "/packages/cli/dist"
      )}' && pnpm --filter 'studio-demo' dev`,
    },
  ];
  console.log("commands", commands);
  const longCommands = toLongCommond(commands);
  console.log("longCommands", longCommands);
  await concurrentlyAsync([longCommands], { raw: true });
};