import { effect } from "@vue/reactivity";
import { ShapeFlags } from "@vue/shared";
import { createAppApi } from "./aipCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { queueJob } from "./scheduler";
import { normalizeVNode, Text } from "./vnode";

/**
 * 
 * @param rendererOptions runtime-dom中抹平平台差异的API
 * @returns createApp方法
 */
export function createRenderer(rendererOptions) { // 告诉core 怎么渲染
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        setText: hostSetText,
        setElementText: hostSetElementText,
        nextSibling: hostNextSibling
      } = rendererOptions;


    //    ------------ 处理组件 -----------
    const setupRenderEffect = (instance, initialVNode, container) => {
        // 需要创建一个effect 在effect中调用render方法 这样render方法中拿到的数据会收集这个effect 属性更新是effect会重新执行
        instance.update = effect(function componentEffect() { // 每个组件都有一个effect vue3.0是组件级更新 数据变化会重新执行对应组件的effect
            if (!instance.isMounted) {// 初次渲染
                // 获取proxy代理
                let proxyToUse = instance.proxy;
                // 1.执行render函数-这个render函数可能有三个来源:1) setup返回; 2) 组件对象上定义; 3) 我们自己通过模板编译构造的
                // 2.render函数中 会通过h()生成虚拟DOM 
                // 3.生成真实DOM的虚拟DOM
                let subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse); 
                // 将虚拟DOM渲染到页面上
                patch(null, subTree, container)
                initialVNode.el = subTree.el; // 组件的el和子树的el是同一个
                instance.isMounted = true;
            } else {
               // 获取老的虚拟节点
               const prevTree = instance.subTree
               // 获取proxy
               const proxyToUse = instance.proxy
               // 重新执行render函数 生成最新的虚拟DOM
               const nextTree = instance.render.call(proxyToUse, proxyToUse)
               // 更新组件实例的subTree属性
               instance.subTree = nextTree 
               // 对比新老节点 更新DOM
               patch(prevTree, nextTree, container)
            }
        }, {
            scheduler:queueJob
        })
    }
    
    /**
     * @description 将组件的虚拟节点转换成组件实例
     * @param initialVNode 组件对象的虚拟节点
     * @param container 容器
     */
    const mountComponent = (initialVNode, container) => { // 组件的渲染流程 最核心的就是调用 setup拿到返回值 获取render函数返回的结果来进行渲染
        // 1.根据组件对象创建组件实例
        const instance = (initialVNode.component = createComponentInstance(initialVNode));
        // 2.需要的数据解析到实例上 - 比如将用户的setup的返回值或者render函数解析到实例上 供下面调用
        setupComponent(instance);
        // 3.创建一个effect 让render函数执行
        setupRenderEffect(instance,initialVNode,container);
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
    /**
     * @description 将文本子元素转成虚拟文本DOM 并依次渲染到container中
     * @param children 子元素数组
     * @param container 容器
     */
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            // 元素虚拟DOM直接返回 文本创建成文本虚拟DOM
            let child = normalizeVNode(children[i])
            // 将儿子渲染到容器中
            patch(null, child, container)
        }
    }
    
    /**
     * 
     * @param vnode 虚拟DOM
     * @param container 容器
     */
    const mountElement = (vnode, container, anchor) => {
      // 解构属性
      const { props, shapeFlag, type, children } = vnode;
      // type 就是标签名 根据标签名创建成真实HTML元素
      let el = (vnode.el = hostCreateElement(type));
      // 挂载属性
      if(props) {
          for (const key in props) {
              hostPatchProp(el, key, null, props[key])
          }
      }
      // 只有一个文本子元素 直接插入
      if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, children);
      }
      // 多个子元素要将文本子元素转换成文本节点插入 否则直接调用hostSetElementText()会覆盖
      if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(children, el)
      }
      // 经过以上处理 el的属性和子元素全部渲染完毕 将el渲染到container中
      hostInsert(el, container, anchor)
    };
    
    const patchProps = (oldProps, newProps, el) => {
        if(oldProps !== newProps) {
            for (const key in newProps) {
                const prev = oldProps[key]
                const next = newProps[key]
                if(prev !== next) {
                    hostPatchProp(el, key, prev, next)
                }
            }

            for (const key in oldProps) {
                if(!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null)
                }
            }
        }
    }

    /**
     * 
     * @param n1 老的虚拟DOM
     * @param n2 新的虚拟DOM
     * @param anchor 插入时的参考点
     */
    const patchElement = (n1, n2, anchor) => {
       let el = (n2.el = n1.el)
       const oldProps = n1.props || {}
       const newProps = n2.props || {}
       patchProps(oldProps, newProps, el)
    }

    /**
     * @description 根据是否存在n1判断是初次渲染还是更新 初次渲染调用 mountElement()将虚拟DOM创建成真实DOM渲染到container中 
     * @param n1 老的虚拟DOM
     * @param n2 新的虚拟DOM
     * @param container 容器
     */
    const processElement = (n1, n2, container, anchor) => {
        if(n1 == null) { // 初次渲染 和 n1 n2 都不是相同标签时 将n1=null, 直接将n2渲染到页面中
          mountElement(n2, container, anchor)
        } else { // n1和n2元素类型相同的情况下的更新操作
          patchElement(n1, n2, anchor)
        }
    }
    // ------------ 处理元素 -------------


    // ------------ 处理文本 -------------
    const processText = (n1, n2, container) => {
        if(n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container)
        }
    }
    // ------------ 处理文本 -------------
    
    // 比较两个节点是否是相同节点
    const isSameVNodeType = (n1,n2) => {
        return n1.type === n2.type && n1.key === n2.key
    }

    // 卸载虚拟DOM对应的真实DOM
    const unmount = (vnode) => {
       hostRemove(vnode.el)
    }

    /**
     * @description 初次渲染和更新功能
     * @param n1 老的虚拟节点 - 不存在就是初次渲染 存在就是更新
     * @param n2 新的虚拟节点
     * @param container 容器
     */
    const patch = (n1, n2, container, anchor = null) => {
        // 针对不同的类型 做初始化操作
        const { shapeFlag, type } = n2

　　　　// 如果更新的是两个类型不同的虚拟DOM - 虽然是更新操作,但是和初次渲染没区别, 将n1置空 直接走初次渲染流程即可
       if(n1 && isSameVNodeType(n1,n2)) {
          // 获取老节点的下一个元素 可能不存在
          anchor = hostNextSibling(n1.el)
          // remove老的虚拟DOM对应的真实DOM
          unmount(n1)
          // 将n1置为null,相当于重新渲染生成n2不需要diff
          n1 = null
       }

        switch (type) {
            case Text: // 文本
                processText(n1, n2, container)
                break;
        
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) { // 元素
                    processElement(n1, n2, container, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { // 组件
                    processComponent(n1, n2, container)
                }
                break;
        }
    }
    
    // 用户调用mount方法时会执行这个函数
    const render = (vnode, container) => {
        // core的核心 根据不同的虚拟节点 创建对应的真实元素
        // 默认调用render 可能是初始化流程
        patch(null, vnode, container)

    }

    return {
        createApp: createAppApi(render) // 生成createApp()函数
    }
}

// vnode: 就是用对象去描述组件或者真实DOM
// instance: 也是用一个对象去描述组件,添加了一些必要的属性或者方法,比如render函数,setupState等
// 两个都是对象,


// 1、处理组件对象

// 组件对象(可能包含setup()/render()等) => 
// createVNode(rootCOmponent, rootProps)将组件对象转成[组件虚拟节点] => 
// render(vnode, container)将组件渲染到container中 => 
// patch(null, vnode, container)判断vnode是文本/Element/Componet，调用不同的方法处理不同的类型 => 
// processComponent(n1, n2, container)判断是初次渲染还是更新做不同的处理 => 
// mountComponent(n2, container)对组件的虚拟节点进行处理 => 
// createComponentInstance(n2)创建组件的实例-就是用对象描述这个组件对象 => 
// setupComponent(instance) 解析组件实例中的属性和方法 => 
// setupRenderEffect(instance,initialVNode,container) 创建effect => 
// 执行组件实例中解析过的render(),render()中会调用h()
// DOM元素的虚拟DOM,递归调用patch(null, subTree, container),subTree才是组件实例真正想渲染到container中的DOM

// 2. 处理虚拟DOM
// patch(null, subTree, container)Element元素 => 
// processElement(n1,n2, container)初次渲染还是更新 => 
// mountElement(n2,contaienr) 处理DOM元素虚拟节点　=>
// hostCreateElement(type)将虚拟DOM创建成真实DOM => 
// hostPatchProp(el, key, null, props[key])将属性解析到真实DOM上 => 
// hostSetElementText(el, children)单个文本子元素直接插入 =>
// mountChildren(children, el)多个子元素特殊处理 => 
// normalizeVNode(children[i])文本子元素创建成虚拟文本DOM节点,其他类型子元素不需要特殊处理 => 
// 调用patch(null, child, container)递归将子元素渲染到subTree的真实DOM中去

// 3. 处理文本节点 
// patch(null, child, container)Text元素 => 
// processText(n1, n2, container)将文本虚拟节点添加到container中去,也就是subTree的真实DOM中 => 
// hostInsert((n2.el = hostCreateText(n2.children)), container)将文本创建成文本节点,insert到subTree的真实DOM中去

