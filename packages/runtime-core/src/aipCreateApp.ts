import { createVNode } from "./vnode";

/**
 * @description 返回createApp方法
 * @param render render方法
 * @returns app对象
 */
export function createAppApi(render) {
    /**
     * @description 创建app对象,app对象上声明我们用到的属性和方法,最重要的是mount()方法
     * @param rootComponent 根组件
     * @param rootProps 根组件的属性
     * @returns app对象 应用实例挂载了一些属性和方法
     */
    return function createApp(rootComponent, rootProps) { // 告诉他哪个组件哪个属性来创建的应用
        const app = {
            _props: rootProps,
            _component: rootComponent,
            _container: null,
            mount(container) { // 用户会手动调用mount方法,将组件挂载到container上
                // 1、创建组件的虚拟节点
                const vnode = createVNode(rootComponent, rootProps, null);
                // 2、调用render 将组件渲染到容器中
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
