import { effect, track, trigger } from './effect';
import { isFunction } from '@vue/shared';
import { TrackOpTypes } from './operators';
class ComputedRefImpl {
    private _value;
    private _dirty = true; // 默认是脏值
    public readonly effect;
    public readonly __v_isRef = true;
    constructor(getter, private readonly _setter) {
        // 创建effect时默认会先执行依次effect => 先执行一次getter => getter里响应式数据触发取值 => 收集当前effect
        this.effect = effect(getter, {
            lazy: true, // 计算属性特性
            scheduler: () => { // 当computed中依赖的数据发生变化时，触发这个effect，执行scheduler
                if (!this._dirty) { // 依赖属性变化时
                    this._dirty = true; // 标记为脏值，触发视图更新
                    // 当computed依赖的属性发生了变化，
                    trigger(this, 'set', 'value'); // ?
                }
            }
        })
    }
    get value() {
        if (this._dirty) {
            // 取值时执行effect
            this._value = this.effect(); // 更新computed的值
            this._dirty = false;
        }
        // 取computed的返回结果的value时 将computed实例当作target收集依赖
        track(this,  TrackOpTypes.GET ,'value'); // 进行属性依赖收集
        return this._value
    }
    set value(newValue) {
        this._setter(newValue);
    }
}


export function computed(getterOrOptions) {
    let getter;
    let setter;
    if (isFunction(getterOrOptions)) { // computed两种写法
        getter = getterOrOptions;
        setter = () => {
            console.warn('computed value is readonly')
        }
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter)
}