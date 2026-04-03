# Errors

Command failures and integration errors.

---

## 2026-03-31 - Vue + Three.js 集成错误

### 错误：Vue 不支持运行时编译模板

**错误信息：**
```
[Vue warn]: Component provided template option but runtime compilation is not supported in this build of Vue.
```

**原因：**
- 使用了 CDN 版本的 Vue (vue.esm-browser.js)
- 在组件的 `template` 选项中直接写模板字符串
- 这个版本的 Vue 不支持运行时编译

**解决方案：**
1. 改用 Vue 单文件组件 (.vue)
2. 在 `<template>` 标签中写模板，而不是在 `template` 选项中

**正确做法：**
```vue
<script setup lang="ts">
// ✅ 正确：使用 .vue 文件的 <template>
</script>

<template>
  <div>内容</div>
</template>
```

**错误做法：**
```typescript
// ❌ 错误：在 JavaScript 中使用 template 选项
const app = createApp({
  template: `<div>内容</div>`
})
```

---

## 2026-03-31 - 中文变量名错误

**错误信息：**
```
ReferenceError: const射线检测 is not defined
```

**原因：**
- 使用中文字符作为 JavaScript 变量名
- 虽然现代 JavaScript 支持中文变量名，但在某些情况下可能有问题

**解决方案：**
- 统一使用英文变量名
- `const射线检测` → `const raycaster`

**正确做法：**
```typescript
// ✅ 正确：使用英文变量名
const raycaster = new THREE.Raycaster()
```

**错误做法：**
```typescript
// ❌ 错误：使用中文变量名
const 射线检测 = new THREE.Raycaster()
```

---

## 2026-03-31 - Vue 导入问题导致黑屏

**症状：**
- 页面显示 CRT 扫描线，但 Vue 组件不渲染
- 控制台显示 main.ts 执行成功，但页面黑屏

**原因：**
- Vue 模块从 CDN 导入与 Vite 构建版本冲突
- 使用了 `importmap` 但 Vite 已经内置了 Vue

**解决方案：**
1. 移除 index.html 中的 importmap
2. 直接在 main.ts 中导入：`import { createApp } from 'vue'`
3. 使用 .vue 单文件组件

**文件对比：**

❌ **错误配置：**
```html
<script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
    }
  }
</script>
```

✅ **正确配置：**
```html
<!-- 不需要 importmap，Vite 会处理 -->
<script type="module" src="/src/main.ts"></script>
```

```typescript
// main.ts
import { createApp } from 'vue'  // Vite 会处理
import App from './App.vue'
createApp(App).mount('#app')
```

---

## 关键经验总结

### Vue 3 + Vite 集成要点

1. **始终使用 .vue 单文件组件**
   - 不要在 JavaScript 中使用 `template` 选项
   - 不要使用 CDN 版本的 Vue

2. **变量命名规范**
   - 统一使用英文变量名
   - 避免使用中文或其他特殊字符

3. **模块导入**
   - 相信 Vite 的模块处理能力
   - 不要手动添加 importmap 或其他配置
   - 直接 `import { createApp } from 'vue'` 即可

4. **调试步骤**
   - 先用原生 JavaScript 测试基础功能
   - 确认浏览器和 DOM 操作正常
   - 再逐步添加 Vue 和其他库
