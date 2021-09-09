import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProps } from "./patchProps";

const rendererOptions = extend({nodeOps}, patchProps)


// createApp
export const createApp = () => {

}