// 实现new Proxy()的get/set
// 是不是仅读的 是不是深度的
/**
 * shallow情况下,深度属性不会被代理, 只会代理一层,无论是只读还是非只读
 * 非shallow情况下,深度属性在取值的时候也会被代理,无论是否是只读
 * 也就是shallow情况下,只在取值时代理一层;
 * 非shallow情况下,在取值时会深层代理
 */
/**
 * reactive：深度reactive和shallow reactive
 * readonly: 深度readonly和shallow readonly
 */

import {
  extend,
  hasChanged,
  hasOwn,
  isArray,
  isIntegerKey,
  isObject,
} from "@vue/shared";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operators";
import { reactive, readonly } from "./reactive";

/**
 * @description 给Proxy创建get方法 拦截目标对象的获取功能 区分深度非深度 只读非只读
 * @param isReadonly 是否只读 true仅读
 * @param shallow 是否浅层 true 浅的非深度
 * @returns 返回一个get()函数 get函数返回的是对应的res
 */
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    // proxy + reflect
    /**
     * 为什么这里要使用Reflect：
     * 1、后续Object上的方法 会被迁移到Reflect上，例如Reflect.getProptypeof()
     * 2、以前target[key] = value 方式设置值可能会失败，但是并不会报异常，也没有返回值标识
     *    当时Reflect方法具备返回值
     */
    console.log('获取属性');
    
    const res = Reflect.get(target, key, receiver); // Reflect的这个用法的意义其实等价于 target[key]

    // 非只读的属性收集effect
    if (!isReadonly) {
      // 如果要代理的对象是非只读的 收集依赖 数据变化后更新对应的视图
      console.log("获取属性收集effect", target, key, receiver);

      track(target, TrackOpTypes.GET, key);
    }

    if (shallow) { // shallow的reactive和readonly都是在触发get时直接返回对应值
      // 如果要代理的对象是非深度的 直接返回对应的浅层的值即可
      return res;
    }

    // 如果get的这个属性是个Object 要根据要代理的对象是否是只读的 递归处理res 只读的不需要响应式
    // 经过shallow的判断 到这里的都是深度的:深度只读或深度非只读
    // vue2是一开始就递归 vue3是当取值时才会进行代理 vue3的代理模式是懒代理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}

/**
 * @description 拦截非只读目标对象的set方法 区分深度非深度
 * @param shallow 是否深浅
 * @returns 返回一个set()函数
 */
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    console.log("修改属性", target, key, value, receiver);

    const oldValue = target[key];
    /**
     * 如果target是数组并且本次修改的key不是length;
     * 如果target不是数组，返回target中是否有这个key;
     * hadKey：
     * 1：如果target是数组并且修改的key不是length，hadKey为true，说明是修改这个数组，hadKey为false，说明是新增数组项；
     * 2：如果target是Object或者数组(修改length属性)，hadKey为true,说明是修改属性值，hadKey为false，说明是新增属性；
     */
    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);

    const result = Reflect.set(target, key, value, receiver);

    if (!hadKey) {
      // hadKey为false,无论对于数组还是Object都是新增
      // 新增属性
      trigger(target, TriggerOpTypes.ADD, key, value);
    } else if (hasChanged(value, oldValue)) {
      // 对比 修改的新值和老值是否相同 同一个值不需要更新
      // 修改属性
      trigger(target, TriggerOpTypes.SET, key, value, oldValue);
    }
    return result;
  };
}

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter();

// 仅读(readonly)的公共set方法
let readonlyObj = {
  set: (target, key) => {
    console.warn(`set on key ${key} falied!`);
  },
};

// 深度reactive
export const mutableHandlers = {
  get,
  set: createSetter(),
};

// 非深度reactive 创建一个响应式代理，它跟踪其自身 property 的响应性，但不执行嵌套对象的深层响应式转换 (暴露原始值)。
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: createSetter(),
};

// 深度readonly
export const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
);

// 非深度readonly 创建一个 proxy，使其自身的 property 为只读，但不执行嵌套对象的深度只读转换 (暴露原始值)。
export const shallowReadonlyHandlers = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj
);
