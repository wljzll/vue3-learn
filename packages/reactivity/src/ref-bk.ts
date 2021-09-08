import { hasChanged, isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operators";
import { reactive } from "./reactive";

export function ref(value) {
  // ref Api
  return createRef(value);
}

export function shallowRef(value) {
  // shallowRef Api
  return createRef(value, true);
}

function createRef(rawValue, shallow = false) {
  return new RefImpl(rawValue, shallow);
}

const convert = (val) => (isObject(val) ? reactive(val) : val); // 递归响应式

// ref用到的类底层会被转换成Object.defineProperty()
class RefImpl {
  private _value; // public: 表示 父类本身、子类、外面都可以获取到这个属性
  public readonly __v_isRef = true; // 标识是ref
  constructor(private _rawValue, public readonly _shallow) {
    /**
     * 如果是shallow 不需要深层响应 直接返回_rawValue
     * 否则判断_rawValue是否是Object：
     * 1)是，reactive包装成响应式数据
     * 2)否，直接返回自己
     */
    // 将传入的值保存到_value属性上
    this._value = _shallow ? _rawValue : convert(_rawValue);
  }
  get value() {
    // 取包装后的ref实例的value时 才会收集对应的依赖
    track(this, TrackOpTypes.GET, "value");
    return this._value;
  }
  set value(newVal) {
    if (hasChanged(newVal, this._rawValue)) {
      // 新值是否变化
      this._rawValue = newVal; // 保存值
      this._value = this._shallow ? newVal : convert(newVal); // 如果是深层代理，考虑设置的值是否是Object
      trigger(this, TriggerOpTypes.SET, "value", newVal); // 触发effect更新
    }
  }
}
