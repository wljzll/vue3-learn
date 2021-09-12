import { createRenderer } from "@vue/runtime-core";
import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProps } from "./patchProps";

// 渲染时用到的所有方法
const rendererOptions = extend({ nodeOps }, patchProps)

// createApp
export const createApp = (rootComponent, rootProps = null) => {
    const app: any = createRenderer(rendererOptions).createApp(rootComponent, rootProps);
    let { mount } = app;
    app.mount = function (container) {
        // 清空容器的操作
        container = nodeOps.querySelector(container);
        container.innerHTML = "";
        mount(container)
        // 将组件 渲染成dom元素 进行挂载
    }
    return app;
}