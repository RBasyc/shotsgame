# 学习记录 - ShotsGame 项目

## 项目概述

成功实现了一个完整的 1v1 在线射击游戏，使用了 Vue 3 + Three.js + Socket.io 技术栈，采用了 Retro-Futurism 设计风格。

## 关键学习点

### 1. Vue 3 + Three.js 集成

**学习要点：**
- Three.js 场景初始化应该在 `onMounted` 钩子中进行
- 必须在 `onUnmounted` 中正确清理资源（renderer.dispose()）
- 使用 template refs 获取 DOM 元素来附加 canvas

**最佳实践：**
```typescript
// 在 onMounted 中初始化
onMounted(() => {
  initScene();
  animate();
});

// 在 onUnmounted 中清理
onUnmounted(() => {
  cancelAnimationFrame(animationId);
  renderer.dispose();
});
```

### 2. Socket.io 事件处理

**学习要点：**
- 使用 Map 管理事件回调，便于清理
- 服务器和客户端的事件名称要一致
- 处理断线重连很重要

**架构设计：**
```typescript
// NetworkManager 类封装所有 Socket.io 逻辑
class NetworkManager {
  private socket: Socket | null = null;
  private callbacks = new Map<string, EventCallback[]>();

  // 统一的事件发送和接收接口
  send(event: string, data?: any) { ... }
  on(event: string, callback: EventCallback) { ... }
}
```

### 3. 第一人称控制器

**学习要点：**
- 使用 Pointer Lock API 实现鼠标控制视角
- 分离 pitch（上下）和 yaw（左右）旋转
- 限制 pitch 角度防止过度旋转

**关键代码：**
```typescript
// 鼠标移动回调
inputManager.setMouseMoveCallback((movementX, movementY) => {
  yaw -= movementX * MOUSE_SENSITIVITY;
  pitch -= movementY * MOUSE_SENSITIVITY;
  pitch = Math.max(-PI/2, Math.min(PI/2, pitch));

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
});
```

### 4. 网络同步策略

**学习要点：**
- 客户端预测：立即更新本地位置，同时发送给服务器
- 服务器验证：射击事件由服务器验证并广播结果
- 状态同步：20Hz 更新频率平衡性能和流畅度

### 5. 音效系统设计

**学习要点：**
- Web Audio API 需要用户交互后才能初始化
- 使用 OscillatorNode 生成音效，无需外部文件
- 不同的波形类型产生不同的音色

**实现方式：**
```typescript
// 使用振荡器生成复古音效
const oscillator = audioCtx.createOscillator();
oscillator.type = 'square'; // 方波产生复古声音
oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
```

### 6. Retro-Futurism 设计风格（来自 ui-ux-pro-max 技能）

**UI/UX 设计要点：**
- **色彩：** 霓虹紫 (#7C3AED) + 玫瑰红 (#F43F5E) + 深蓝黑背景 (#0F0F23)
- **字体：** Russo One（标题）+ Chakra Petch（正文）
- **视觉效果：**
  - CRT 扫描线：repeating-linear-gradient
  - 霓虹发光：text-shadow + box-shadow
  - Glitch 效果：CSS animation + transform

### 7. 移动端适配

**学习要点：**
- 检测设备方向并提示横屏
- 使用 touch 事件实现虚拟控制
- 禁用页面缩放和滚动

**CSS 实现：**
```css
@media screen and (max-width: 768px) and (orientation: portrait) {
  .landscape-warning {
    display: flex; /* 显示横屏提示 */
  }
}
```

### 8. TypeScript 类型安全

**学习要点：**
- 定义清晰的接口和类型
- 使用常量枚举避免魔法数字
- 类型定义集中管理（Game.ts）

## 项目结构总结

成功的架构模式：
1. **分层设计：** components（UI）→ game（逻辑）→ utils（工具）
2. **单一职责：** 每个类/组件只负责一件事
3. **依赖注入：** 通过 props 和 emit 传递数据
4. **资源管理：** 正确的初始化和清理顺序

## 性能优化

1. **Three.js：**
   - 使用对象池避免频繁创建/销毁
   - 降低阴影质量提升性能
   - 使用简单的几何体（BoxGeometry）

2. **网络：**
   - 限制更新频率（20Hz）
   - 只同步必要的数据
   - 使用二进制数据（可选）

3. **渲染：**
   - 使用 requestAnimationFrame
   - 离屏元素使用 pointer-events: none
   - CRT 效果使用伪元素减少重绘

## 已知限制

1. **客户端权威：** 射击检测由客户端报告，可能被作弊
2. **无插值：** 对手移动可能有卡顿
3. **简单碰撞：** 只使用 AABB 碰撞检测
4. **单房间：** 服务器只支持单个游戏房间

## 未来改进方向

1. **服务器端射线检测：** 防止作弊
2. **插值平滑：** 提升对手移动流畅度
3. **更多武器：** 添加不同类型的武器
4. **匹配系统：** ELO 评级和匹配
5. **回放系统：** 游戏录像和回放
6. **地图编辑器：** 自定义地图

## 结论

这个项目成功展示了现代 Web 技术创建实时多人游戏的潜力。Vue 3 的 Composition API 让代码组织更清晰，Three.js 提供强大的 3D 渲染能力，Socket.io 实现可靠的实时通信。

**最重要的教训：**
- 从小处开始，逐步迭代
- 正确的资源管理至关重要
- 网络同步需要仔细设计
- 良好的架构让扩展更容易
