import { reactive } from "@vue/reactivity";
import { hasChanged, isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operators";

function createRef(value, shallow) {
   return new RefImpl(value, shallow = false);
}

const convert = (value) =>( isObject(value) ? reactive(value) : value);
class RefImpl{
    private _value;
    private _v_isRef = true;
    constructor(private _rawValue, public readonly _shallow) {
        this._value = _shallow ? _rawValue : convert(_rawValue);
    }
    get value() {
        track(this, TrackOpTypes.GET, 'value');
        return this.value;
    }
    set value(newValue) {
        if(hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = this._shallow ? newValue : convert(newValue)
            trigger(this, TriggerOpTypes.SET, 'value', newValue);
        }
    }
}

export function ref(value) {
    return createRef(value, false);
 }

 export function shallowRef(value) {
     return createRef(value, true);
 }

// ref系列其实都是创建一个类实例返回, 我们表面上看是对传入的值做操作, 其实是对返回的类实例做操作, 有点做个中间转发的意思

// ref的创建流程
// 1. 调用ref(value)
// 2. ref(value)执行返回createRef(value, false)返回值
// 3. createRef(value, shall)返回 new RefImpl(value, shallow = false)
// 4. new RefImpl()
// 总结: ref()返回的其实是 RefImpl这个类的实例, 我们取值也是取这个实例的value, 设置也是

// new RefImpl()执行过程
// 1. 执行constructor, 判断是否是shallowRef:
//    1.1 如果是shallowRef: 不需要深层响应式代理
//    1.2 如果不是shallowRef: 需要用reactive()深度代理
// 2. get value()代理: 如果对RefImpl实例取值时, 尝试去track effect, 有就收集effect, 没有就不收集
// 3. set value()代理: 
//    3.1 判断新老值是否发生了变化
//    3.2 将新值赋值给this._rawValue
//    3.3 如果时shallow, 直接设置即可, 如果不是, 可能需要对newValue重新进行响应式代理


// ref的几个特殊点:
// 1. 如果将对象分配为 ref 值，则通过 reactive 函数使该对象具有高度的响应式。
// 2. 解包:
//    2.1 当 ref 作为渲染上下文 (从 setup() 中返回的对象) 上的 property 返回并可以在模板中被访问时，它将自动浅层次解包内部值。只有访问嵌套的 ref 时需要在模板中添加 .value：
//    [https://v3.cn.vuejs.org/guide/reactivity-fundamentals.html#%E5%88%9B%E5%BB%BA%E7%8B%AC%E7%AB%8B%E7%9A%84%E5%93%8D%E5%BA%94%E5%BC%8F%E5%80%BC%E4%BD%9C%E4%B8%BA-refs]
//    意思就是,当我们从setup()中返回一个ref时, 处理setup()返回值时, 会自动将这个ref解包, 不用通过 ref.value去访问, 但是当把这个ref嵌套在一个对象中时, 不会去解包

//    2.2 当 ref 作为响应式对象的 property 被访问或更改时，为使其行为类似于普通 property，它会自动解包内部值：
//    意思是, 当我们用reactive()去包裹一个ref时, reactive()内部会给我们返回 target.key.value 帮我们自动解包了

