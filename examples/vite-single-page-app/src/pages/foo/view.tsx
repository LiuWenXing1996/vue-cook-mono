import { defineComponent, ref, shallowReactive } from "vue"
import "./style.css"
import * as _actions from "./actions"
import { useViewContext } from "@vue-cook/render"

export default defineComponent({
    props: {
        foo: String
    },
    setup(props, ctx) {
        const viewContext = useViewContext({
            states: {
                buttenSize: "large",
                wrapperClassState: true
            }
        })
        const { states } = viewContext
        return <div>
            {states.buttenSize}
            {states.buttenSize}
            <el-button size={states.buttenSize}>
                <slot></slot>
                {states.buttenSize}
                <template></template>
            </el-button>
        </div>;

    }
})

