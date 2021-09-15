import { isArray, isObject, isString, ShapeFlags } from "@vue/shared";
export function isVnode(vnode) {
  return vnode._v_isVnode
}
// h('div', {style: {color:red}}, children)
/**
 * @description 创建组件和真实DOM的虚拟节点
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
    type, // 组件或者DOM
    props, // 组件或者对象的属性
    children, // 儿子节点
    component: null, // 存放组件对应的实例
    key: props && props.key, // diff算法会用到key
    shapeFlag // 能够判断出自己的类型和儿子的类型
  }
  // 通过和儿子 & 运算 标识出当前虚拟节点的类型和其儿子的类型
  normalizeChildren(vnode, children);
  return vnode;
}

function normalizeChildren(vnode, children) {
  let type = 0;
  if (children == null) {

  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }
  vnode.shapeFlag |= type;
}

export const Text = Symbol('Text')
export function normalizeVNode(child) {
  if (isObject(child)) {
    return child;
  }
  return createVNode(Text, null, String(child));
}