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

export * from '@vue/runtime-core'

// 1、用户调用 createApp方法
// 2、createApp方法内部默认调用createRender()方法
// 3、createRender方法返回一个对象{createApp: createAppApi(render)} => createAppApi()返回createApp方法
// 4、createApp()返回app对象