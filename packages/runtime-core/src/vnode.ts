

// h('div', {style: {color:red}}, children)

import { isArray, isObject, isString, ShapeFlags } from "@vue/shared";

/**
 * @description 创建虚拟节点
 * @param type 组件对象或者元素标签字符串
 * @param props 对应的属性
 * @param children 儿子
 */
export const createVNode = (type, props, children) => {
    // 根据type来区分是组件还是普通元素

    // 给虚拟节点加一个类型
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
    const vnode = {
        _v_isVnode: true, // 这是一个vnode
        type,
        props,
        children,
        component: null, // 存放组件对应的实例
        key: props && props.key, // diff算法会用到key
        shapeFlag // 能够判断出自己的类型和儿子的类型
    }
    normalizeChildren(vnode, children);   
    return vnode;
}

function normalizeChildren(vnode, children) {
  let type = 0;
  if(children == null) {

  } else if(isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
      type = ShapeFlags.TEXT_CHILDREN;
  }
  vnode.shapeFlag |= type;
}