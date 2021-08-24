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
