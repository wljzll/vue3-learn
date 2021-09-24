import { isArray } from "@vue/shared";

class ObjectRefImpl {
  public readonly __v_isRef = true;
  constructor(private readonly _object, private readonly _key) {}
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}

/**
 * @description 将对象中的属性转换成ref属性
 * @param object 
 * @param key 
 * @returns 
 */
export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}
export function toRefs(object) {
  const ret = isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}

// toRef的功能: 其实就是给reactive数据的某个属性上做个代理, 创建一个 ObjectRefImpl实例, 指向这个类的属性

// toRef()执行流程:
// 1. 调用toRef(object, key), 返回 new ObjectRefImpl(object, key)实例, 所有后面对这个实例的操作,都是对object的key的操作

// new ObjectRefImpl(object, key)的工作流程:
// 1. 代理实例的get value: 返回object[key]
// 2. 代理实例的set value: 往object[key]上设置值