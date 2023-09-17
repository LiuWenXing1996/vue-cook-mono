import {
  ConcurrentlyCommandInput,
  ConcurrentlyOptions,
  concurrently,
} from "concurrently";

export const concurrentlyAsync = async (
  commands: ConcurrentlyCommandInput[],
  options?: Partial<ConcurrentlyOptions>
) => {
  const { result } = concurrently(commands, options);

  return new Promise((resolve, reject) => {
    result.then(
      () => {
        resolve(true);
      },
      (e) => {
        reject(e);
      }
    );
  });
};

export const toLongCommond = (
  commands: {
    command: string;
    name: string;
  }[]
) => {
  const longCommand = `concurrently -c 'auto' --kill-others -p '[{name}]' -n ${commands
    .map((e) => {
      return `'${e.name}'`;
    })
    .join(`,`)} ${commands
    .map((e) => {
      return `'${e.command}'`;
    })
    .join(` `)}`;

  return longCommand;
};
