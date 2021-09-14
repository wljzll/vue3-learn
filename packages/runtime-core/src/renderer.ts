import { effect } from "@vue/reactivity";
import { ShapeFlags } from "@vue/shared";
import { createAppApi } from "./aipCreateApp";
import { createComponentInstance, setupComponent } from "./component";

/**
 * 
 * @param rendererOptions runtime-dom中抹平平台差异的API
 * @returns createApp方法
 */
export function createRenderer(rendererOptions) { // 告诉core 怎么渲染
    //    ------------ 处理组件 -----------
    const setupRenderEffect = (instance, container) => {
        // 需要创建一个effect 在effect中调用render方法 这样render方法中拿到的数据会收集这个effect 属性更新是effect会重新执行
        instance.update = effect(function componentEffect() { // 每个组件都有一个effect vue3.0是组件级更新 数据变化会重新执行对应组件的effect
            if (!instance.isMounted) {
                // 初次渲染
                let proxyToUse = instance.proxy;
                let subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse);
                patch(null, subTree, container)
                instance.isMounted = true;
            } else {

            }
        })
    }

    const mountComponent = (initialVNode, container) => {
        // 组件的渲染流程 最核心的就是调用 setup拿到返回值 获取render函数返回的结果来进行渲染
        // 1.现有实例 - 创建组件实例
        const instance = (initialVNode.component = createComponentInstance(initialVNode));
        // 2.需要的数据解析到实例上 - 比如将用户的setup的返回值或者render函数解析到实例上 供下面调用
        setupComponent(instance, container);
        // 3.创建一个effect 让render函数执行
        setupRenderEffect(instance);
    }

    // 判断是初始化组件还是更新组件 做不同的处理
    const processComponent = (n1, n2, container) => {
        if (n1 == null) { // 组件没有上一次的虚拟节点 是初始化的操作
            mountComponent(n2, container)
        } else { // 组件更新流程

        }
    }
    // ---------------- 处理组件 ---------------


    // --------------- 处理元素 --------------
    const processElement = () => {

    }
    const patch = (n1, n2, container) => {
        // 针对不同的类型 做初始化操作
        const { shapeFlag } = n2
        if (shapeFlag & ShapeFlags.ELEMENT) { // 元素
            processElement()
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { // 组件
            processComponent(n1, n2, container)
        }
    }
    
    // 用户调用mount方法时会执行这个函数
    const render = (vnode, container) => {
        // core的核心 根据不同的虚拟节点 创建对应的真实元素

        // 默认调用render 可能是初始化流程
        patch(null, vnode, container)

    }

    return {
        createApp: createAppApi(render)
    }
}