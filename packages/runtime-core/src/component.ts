// 组件中所有的方法

import { isFunction, isObject, ShapeFlags } from "@vue/shared";
import { PublicInstanceProxyHandler } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
    // 通过字面量的方式组合创建组件实例
    const instance = {
        vnode,
        type: vnode.type,
        props: {}, //
        attrs: {},
        slots: {},
        ctx: {},
        render: null,
        setupState: {}, // 如果setup返回一个对象 这个对象会作为setUpstate
        isMounted: false, // 标识这个组件是否挂载过
    }

    instance.ctx = { _: instance }
    return instance;
}

export function setupComponent(instance) {
    const { props, children } = instance.vnode;


    // 根据props 解析出props和attrs， 将其放到instance上
    instance.props = props
    instance.children = children

    // 需要先看下 当前组件是不是有状态的组件  
    let isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT

    if (isStateful) {
        // 调用当前实例的setup方法，用setup的返回值填充setupState和对应的render方法
        setupStatefulComponent(instance)
    }
}
function setupStatefulComponent(instance) {
    // 代理 传递给render函数的参数
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandler)
    // 2.获取组件的类型 拿到组件的setup方法
    let Component = instance.type;
    let { setup } = Component;

    // ------- 没有setup 没有render ---------
    if (setup) {
        let setupContext = createSetupContext(instance);
        const setupResult = setup(instance.props, setupContext);

        handleSetupResult(instance, setupResult)
    } else {
        finishComponentSetup(instance) // 完成组件的启动 
    }
    Component.render(instance.proxy)
}

function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        instance.render = setupResult
    } else if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    let Component = instance.type;
    let { render } = Component;

    if (!render) {
        // 对template模板进行编译产生 render 函数
        // instance.render = render; // 将生成的render函数放在实例上
        if(Component.render && Component.template) {
            // 编译模板 将结果赋予给Component.render
        }
        instance.render = Component.render;
    }
    // 对vue2.0的api做了兼容处理
}
/**
 * 
 * @param instance 组件实例
 * @returns 提取实例上的一些属性和方法组成setup中的上下文
 */
function createSetupContext(instance) {
    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: () => { },
        expose: () => { }
    }
}
// props 和 attrs有什么区别：
// 例如 my-component 传递了两个属性 a=1 b=2
// 但是我们只接收了a属性 props: ["a"]
// a就是props b就是attrs