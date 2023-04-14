import staterefNumber from './states/refNumber'
import staterefString from './states/refString'
const statesConfig = {
  refNumber: { ...staterefNumber, name: "refNumber" },// TODO:这个地方的name也要去掉
  refString: { ...staterefString, name: "refString" }
}

export default statesConfig
