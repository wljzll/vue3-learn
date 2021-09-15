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
      } = rendererOptions;


    //    ------------ 处理组件 -----------
    const setupRenderEffect = (instance, initialVNode, container) => {
        // 需要创建一个effect 在effect中调用render方法 这样render方法中拿到的数据会收集这个effect 属性更新是effect会重新执行
        instance.update = effect(function componentEffect() { // 每个组件都有一个effect vue3.0是组件级更新 数据变化会重新执行对应组件的effect
            if (!instance.isMounted) {// 初次渲染
                // 获取proxy代理
                let proxyToUse = instance.proxy;
                // 1.执行render函数-这个render函数可能有三个来源:1) setup返回; 2) 组件对象上定义; 3) 我们自己通过模板编译构造的
                // 2.render函数中是调用h方法创建真实DOM的虚拟DOM
                // 3.生成真实DOM的虚拟DOM
                let subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse); 
                // 将虚拟DOM渲染到页面上
                patch(null, subTree, container)
                initialVNode.el = subTree.el; // 组件的el和子树的el是同一个
                instance.isMounted = true;
            } else {
               console.log('更新了');
               
            }
        }, {
            scheduler:queueJob
        })
    }

    const mountComponent = (initialVNode, container) => {
        // 组件的渲染流程 最核心的就是调用 setup拿到返回值 获取render函数返回的结果来进行渲染
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
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            // 如果两个儿子都是文本 不能直接hostSetElementText
            let child = normalizeVNode(children[i])
            patch(null, child, container)
        }
    }

    const mountElement = (vnode, container) => {
      const { props, shapeFlag, type, children } = vnode;
      
      let el = (vnode.el = hostCreateElement(type));
      if(props) {
          for (const key in props) {
              hostPatchProp(el, key, null, props[key])
          }
      }
      if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, children);
      }
      if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(children, el)
      }
      hostInsert(el, container)
    };

    const processElement = (n1, n2, container) => {
        if(n1 == null) {
          mountElement(n2, container)
        } else {

        }
    }
    // ------------ 处理元素 -------------


    // ------------ 处理文本 -------------
    const processText = (n1, n2, container) => {
        if(n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container)
        }
    }

    const patch = (n1, n2, container) => {
        // 针对不同的类型 做初始化操作
        const { shapeFlag, type } = n2
        switch (type) {
            case Text:
                processText(n1, n2, container)
                break;
        
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) { // 元素
                    processElement(n1, n2, container)
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