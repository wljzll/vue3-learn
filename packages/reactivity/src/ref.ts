import { reactive } from "@vue/reactivity";
import { hasChanged, isObject } from "@vue/shared";
import { track } from "./effect";
import { TrackOpTypes } from "./operators";





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
        }
    }
}

export function ref(value) {
    return createRef(value, false);
 }

 export function shallowRef(value) {
     return createRef(value, true);
 }