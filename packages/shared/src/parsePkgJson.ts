export interface IPkgJson {
  dependencies: Record<string, string>
  name: string
}

export const parsePkgJson = (pkgJsonString: string) => {
  let content: IPkgJson | undefined = undefined
  try {
    content = JSON.parse(pkgJsonString) as IPkgJson
  } catch (e) {}
  return content
}
