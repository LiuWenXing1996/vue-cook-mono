
<script  lang="ts">
import { defineComponent } from 'vue';

// const defineComponent = (a: any) => { return a }

export default {
    name: "",
    methods: {
        a(){
            this.$data.b
        }
    },
    setup(){

    },
    data: () => {
        return {
            b:""
        }
    },
    a: ""
}
</script>

<template>
    <div>sss</div>
</template>

<style scoped></style>
