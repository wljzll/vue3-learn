import { ShapeFlags } from "@vue/shared";
import { createAppApi } from "./aipCreateApp";
import { createComponentInstance, setupComponent } from "./component";

export function createRenderer(rendererOptions) { // 告诉core 怎么渲染
   const setupRenderEffect = () => {

   }

    const mountComponent = (initialVNode, container) => {
        // 组件的渲染流程 最核心的就是调用 setup拿到返回值 获取render函数返回的结果来进行渲染

        // 1.现有实例
        const instance = (initialVNode.component = createComponentInstance(initialVNode));
        // 2.需要的数据解析到实例上
        setupComponent(instance);
        // 3.创建一个effect 让render函数执行
        setupRenderEffect();
    }

    const processComponent = (n1, n2, container) => {
        if (n1 == null) { // 组件没有上一次的虚拟节点
            mountComponent(n2, container)
        } else { // 组件更新流程

        }
    }

    const patch = (n1, n2, container) => {
        // 针对不同的类型 做初始化操作
        const { shapeFlag } = n2
        if (shapeFlag & ShapeFlags.ELEMENT) {

        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            processComponent(n1, n2, container)
        }
    }
    const render = (vnode, container) => {
        // core的核心 根据不同的虚拟节点 创建对应的真实元素

        // 默认调用render 可能是初始化流程
        patch(null, vnode, container)

    }
    return {
        createApp: createAppApi(render)
    }
}