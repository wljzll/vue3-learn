import { isObject } from "@vue/shared";
import {
  mutableHandlers,
  shallowReactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandler";

// 深度reactive
export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers);
}

// 非深度reactive
export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers);
}

// 深度readonly
export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers);
}
// 非深度readonly
export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers);
}

const reactiveMap = new WeakMap(); // WeakMap会被自动垃圾回收 不会造成内存泄漏 而且它的key只能是对象
const readonlyMap = new WeakMap();

// 方法的核心是通过Proxy拦截数据的读取和修改操作 柯里化思想
/**
 *
 * @param target 目标对象
 * @param isReadonly 是否只读
 * @param baseHandler 对应的handler
 */
export function createReactiveObject(target, isReadonly, baseHandler) {
  // 如果目标不是对象 无法拦截  reactive api只能拦截对象类型
  if (!isObject(target)) {
    return target;
  }
  // 如果target已经被代理过了 不重新代理 但是可能存在一个对象被深度代理又被仅读代理

  const proxyMap = isReadonly ? readonlyMap : reactiveMap;

  const exisitProxy = proxyMap.get(target);
  // 如果已经被代理 返回代理的proxy实例
  if (exisitProxy) {
    return exisitProxy;
  }
  const proxy = new Proxy(target, baseHandler);

  // 缓存代理对象和其代理结果
  proxyMap.set(target, proxy);

  return proxy;
}
