import dts from "rollup-plugin-dts";
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dtsTemp = path.resolve(__dirname, '.local/dts-temp');

/**@type {import("rollup").RollupOptions} */
const config = {
    input: path.resolve(__dirname, dtsTemp, "./index.d.ts"),
    output: {
        file: path.resolve(__dirname, "./dist/index.d.ts"),
        format: "es"
    },
    plugins: [
        dts(),
    ],
}
export default config;