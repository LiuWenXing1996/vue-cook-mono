export * from './cookConfig'
export * from './customComsole'
export * from './constValues'
export * from './parsePkgJson'
// TODO:不分包，但是使用rollUp的多入口来生成多包的文件
// 另外，如果使用一个包可以直接包含多个入口的话，
// 那么这种mono repo 的结构似乎并不是很需要
// 因为这样会消耗tsc的流程
// 这样的话类似unplugin-vue这样的结构会不会好一点
// 但是需要考虑个问题，这些包之间会不会有相互引用