// const parser = ()=>{
//     const ph = posthtml().use((tree) => {
//         tree.walk((node) => {
//           if (node.tag) {
//             console.log('node', node.tag, node)
//             const attrs = node.attrs || {}
//             const newAttrs: any = {}
//             Object.keys(attrs).map((key) => {
//               newAttrs[key] = JSON.parse(attrs[key] || '')
//             })
//             node = {
//               ...node,
//               attrs: {
//                 ...newAttrs
//               }
//             }
//           }
//           return node
//         })
//       })
// }
