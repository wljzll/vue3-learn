export const patchStyle = (el, prev, next) => {
   const style = el.style; // 保存el的style属性
   if(!next) { // 新style不存在 移除style属性
       el.removeAttribute('style');
   } else {
       for (const key in next) { // 将新添加的样式添加上去
           style[key] = next[key];
       }

       if(prev) {
           for (const key in prev) { // prev里有 next里没有的样式删除
               if(next[key] == null) {
                   style[key] = ''
               }
           }
       }
   }
}