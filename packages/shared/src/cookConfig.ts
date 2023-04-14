export interface ICookConfig {
  public: string
  entry: string
  output: string
}

export const parseCookConfig = async (configString: string) => {
  let config: ICookConfig | undefined = undefined
  try {
    config = JSON.parse(configString) as ICookConfig
  } catch (e) {}
  return config
}
