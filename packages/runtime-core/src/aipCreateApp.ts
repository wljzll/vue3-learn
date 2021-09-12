import { createVNode } from "./vnode";

export function createAppApi(render) {
    return function createApp(rootComponent, rootProps) { // 告诉他哪个组件哪个属性来创建的应用
        const app = {
            _props: rootProps,
            _component: rootComponent,
            _container: null,
            mount(container) { // 挂载的目的地
                // let vnode = {};
                // render(vnode, container);
                // 1. 根据组件创建虚拟节点
                // 2. 将虚拟节点和容器获取到后调用render方法进行渲染

                // 创建虚拟节点
                const vnode = createVNode(rootComponent, rootProps, null);
                // 调用render
                render(vnode, container);
                app._container = container;
            }
        }
        return app;
    }
}