import { createVNode } from "./vnode";

/**
 * @description 返回createApp方法
 * @param render render方法
 * @returns app对象
 */
export function createAppApi(render) {
    return function createApp(rootComponent, rootProps) { // 告诉他哪个组件哪个属性来创建的应用
        const app = {
            _props: rootProps,
            _component: rootComponent,
            _container: null,
            mount(container) { // 挂载的目的地
                // 1、创建虚拟节点
                const vnode = createVNode(rootComponent, rootProps, null);
                // 2、调用render
                render(vnode, container);
                app._container = container;
            }
        }
        return app;
    }
}

// 1、app.mount() - 用户手动调用mount方法将组件渲染到container中
// 2、createVNode - 根据用户传入的参数通过字面量的形式创建vnode
// 3、render() - 调用render()方法将vnode和container传入 做渲染操作
