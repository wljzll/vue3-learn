import { effect } from "@vue/reactivity";
import { isFunction } from "@vue/shared";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operators";


class ComputedRefImpl {
    private _value; // 类的存取器使用的公共的value
    private _dirty = true;
    public readonly effect;
    public readonly _v_isRef = true;
    constructor(getter, private readonly _setter) {
        // effect被执行有两个原因：1) 用户取值时 存取器中调用了这个effect 2) getter中依赖的数据发生变化时也触发了这个effect
        this.effect = effect(getter, {
            lazy: true,
            scheduler: () => {
                if(!this._dirty) {
                    this._dirty = true;
                }
                // 触发使用computed的effect 不是this.effect
                trigger(this, TriggerOpTypes.SET, 'value');
            }
        })
    }
    get value() {
        if(this._dirty) {
            this._value = this.effect();
            this._dirty = false;
        }
        // 当有effect使用到这个computed的值时 也就是computed.value computed要收集这个effect
        track(this, TrackOpTypes.GET, 'value');
        return this._value;
    }
    set value(newValue) {
        this._setter(newValue);
    }
}

export function computed(getterOrOptions) {
    let getter;
    let setter;
    if(isFunction(getterOrOptions)) {
       getter = getterOrOptions;
       setter = () => {
           console.warn('computed value is readonly');
           
       }
    } else {
        getter = getterOrOptions.getter;
        setter = getterOrOptions.setter;
    }

    return new ComputedRefImpl(getter, setter);

}