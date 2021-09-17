import { createRenderer } from "@vue/runtime-core";
import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProps";

// 渲染时用到的所有方法
const rendererOptions = extend({patchProp}, nodeOps)

/**
 * @description 提供给用户的createApp方法
 * @param rootComponent 根组件
 * @param rootProps 根实例的属性
 * @returns app对象
 */
export const createApp = (rootComponent, rootProps = null) => {
    const app: any = createRenderer(rendererOptions).createApp(rootComponent, rootProps);
    let { mount } = app;
    // 劫持app上的render方法
    app.mount = function (container) {
        // 清空容器的操作
        container = nodeOps.querySelector(container);
        container.innerHTML = "";
        // 将组件 渲染成dom元素 进行挂载
        mount(container)
    }
    return app;
}
/**
 * 上面代码的执行流程：
 * 一) 开发者调用createApp()方法
 * 1. createApp(): 调用createRenderer(rendererOptions)生成createApp - 返回{createApp: createAppApi(render)}
 * 2. createRenderer(): 调用createAppApi(render)生成createApp()
 * 3. createApp()：生成app实例 - app实例上一个重要方法mount()方法
 * 4. 函数劫持重写app上的mount方法
 * 5. 返回app实例
 * 
 * 二) 开发者调用mount()方法
 * 1. 清空container中的内容 
 * 2. 执行原mount()
 * 
 * 三) mount()执行逻辑
 * 1. 调用createVNode() 根据组件对象和props创建组件的虚拟对象
 * 2. 调用render()创建组件实例生成真实DOM挂载到container中
 * 
 * 四) render()执行逻辑
 * 1. 调用patch(null, vnode, container)
 * 2. vnode为组件虚拟对象，调用processComponent(n1, n2, container)方法
 * 3. 初次渲染调用mountComponent(n2, container)
 *    3.1) 调用createComponentInstance(initialVNode) - 创建组件实例
 *    3.2) 调用setupComponent(instance) - 执行组件实例上的方法，将返回值解析到实例对象上
 *    3.3) 调用setupRenderEffect(instance, initialVNode, container) - 创建effect
 * 
 * 五) setupRenderEffect(instance, initialVNode, container) 执行逻辑
 * 1. 调用effect()创建effect
 * 2. 组件实例未被挂载过，初次渲染，执行初次渲染逻辑
 * 3. 执行解析过后的组件实例上的render() => 使用h()生成虚拟DOM - subTree组件实例对应的元素的虚拟DOM
 * 4. 执行patch(null, subTree, container) 将组件render函数生成的虚拟DOM挂载到container中
 * 
 * 六) 执行patch()渲染subTree到container中的执行逻辑
 * 1. subTree为DOM元素，调用processElement(n1,n2, container)
 *    1.1 初次渲染调用mountElement(n2,container)
 *    1.2 调用hostCreateElement(type)将subTree这个虚拟DOM先创建成DOM节点
 *    1.3 将DOM的属性绑定到真实DOM上
 *    1.4 如果儿子是单文本，调用hostSetElementText(el, children)直接渲染
 *    1.5 如果儿子是数组，调用mountChildren(children, el)处理 - 主要是处理其中的文本儿子节点，将其创建成虚拟DOM文本节点
 *    1.6 调用patch(null, child, container) - 将子节点渲染到subTree的真实DOM中
 * 2. 执行patch()
 *   2.1 如果child是文本类型，执行processText(n1, n2, container) 
 *   2.2 调用hostCreateText(n2.children) - 创建文本DOM节点
 *   2.3 调用hostInsert((n2.el = hostCreateText(n2.children)), container) 将文本节点insert到subTree对应的真实DOM中
 */
export * from '@vue/runtime-core'





// 1、用户调用 createApp方法
// 2、createApp方法内部默认调用createRender()方法
// 3、createRender方法返回一个对象{createApp: createAppApi(render)} => createAppApi()返回createApp方法
// 4、createApp()返回app对象

// let {
//     createApp,
//     h, reactive
// } = VueRuntimeDOM;
// let App = {
//     setup(props, context) {
//         let state = reactive({name: 'zf'})
//         let fn = function () {
//             state.name = 'jw'
//             state.name = 'zll'
//             state.name = 'wlj'
//         }
//         return (proxy) => {
//             return h('div', {onClick:fn}, state.name)
//         }
//     },

// }
// let app = createApp(App, {
//     name: 'zf',
//     age: 12
// })
// app.mount('#app')

