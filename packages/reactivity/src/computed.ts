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
        // 当有effect使用到这个computed的值时 也就是computed.value computed要收集这个effect 或者在页面中有使用到 渲染页面的effect就会被收集
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

// computed执行逻辑:
// 1. 用户调用computed(getterOrOptions) 
// 2. 判断getterOrOptions是函数还是对象, 最后都处理成 getter和setter对象
// 3. 返回 new ComputedRefImpl(getter, setter)

// new ComputedRefImpl(getter, setter)执行逻辑:
// 1. 创建一个effect(getter), 将getter作为回调函数传入, 并且不会默认执行
// 2. 当对这个computed取值, 也就是对new ComputedRefImpl()这个实例取值时, 会执行创建的effect, 也就是执行getter(), getter()中会对响应式数据取值, 从而让响应式数据收集这个effect()
//    当computed依赖的数据发生了变化, 会执行这个effect的scheduler, 重置 dirty标识;
//    如果DOM中有用到computed, computed的get访问器被访问时会收集这个渲染effect, 并在scheduler中trigger这个effect, 从而触发页面更新