import { resolve } from "node:path";
import { findAllPkgs } from "../utils/findAllpackages";
import fsExtra from "fs-extra";
import inquirer from "inquirer";
const { remove } = fsExtra;

export const clean = async () => {
  const allPkgs = await findAllPkgs();
  const pathsWillRemove: string[] = [];
  for (let i = 0; i < allPkgs.length; i++) {
    const pkg = allPkgs[i];
    const distResolvePath = resolve(pkg.path, "./dist");
    pathsWillRemove.push(distResolvePath);
  }
  console.log(pathsWillRemove);
  const { canDel } = await inquirer.prompt([
    {
      name: "canDel",
      type: "confirm",
      default: false,
      message: "将会删除上述文件？",
    },
  ]);
  if (canDel) {
    for (let i = 0; i < pathsWillRemove.length; i++) {
      const pathWillRemove = pathsWillRemove[i];
      console.log(`正在删除: ${pathWillRemove}`);
      await remove(pathWillRemove);
      console.log(`删除完成: ${pathWillRemove}`);
    }
    return true;
  } else {
    return false;
  }
};
