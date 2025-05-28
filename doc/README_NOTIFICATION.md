# GigaLike 消息通知系统

## 概述

GigaLike 消息通知系统是一个完整的实时通知解决方案，支持点赞、评论、关注、系统通知等多种类型的消息推送。系统采用 WebSocket 技术实现实时通信，提供了完善的前端界面和用户体验。

## 功能特性

### 🔔 实时通知
- **WebSocket 连接**: 基于 WebSocket 的实时通信
- **自动重连**: 连接断开时自动重连机制
- **心跳检测**: 定期心跳保持连接活跃
- **连接状态显示**: 实时显示连接状态

### 📱 通知类型
- **点赞通知**: 用户点赞你的内容时收到通知
- **评论通知**: 用户评论你的内容时收到通知
- **关注通知**: 用户关注你时收到通知
- **系统通知**: 系统管理员发送的重要通知

### 🎨 用户界面
- **消息页面**: 完整的消息列表界面
- **筛选功能**: 按类型和状态筛选消息
- **实时弹窗**: 右上角实时通知弹窗
- **徽章提示**: 导航栏未读消息徽章
- **响应式设计**: 适配移动端和桌面端

### ⚡ 交互功能
- **一键已读**: 批量标记所有消息为已读
- **单独操作**: 单独标记已读或删除消息
- **智能跳转**: 点击通知跳转到相关内容
- **浏览器通知**: 支持原生浏览器通知

## 技术架构

### 前端技术栈
- **Vue 3**: 响应式框架
- **Pinia**: 状态管理
- **WebSocket**: 实时通信
- **Axios**: HTTP 请求

### 后端接口
- **通知列表**: `/api/notification/list`
- **未读数量**: `/api/notification/unread/count`
- **标记已读**: `/api/notification/read/{id}`
- **批量已读**: `/api/notification/read/all`
- **删除通知**: `/api/notification/{id}`
- **WebSocket**: `/ws/notification?userId={userId}`

## 使用指南

### 1. 基本使用

#### 查看消息
1. 点击侧边栏的"消息"按钮
2. 查看所有通知列表
3. 使用筛选器按类型查看

#### 管理消息
- **标记已读**: 点击单个消息的"已读"按钮
- **全部已读**: 点击页面顶部的"全部已读"按钮
- **删除消息**: 点击消息的删除按钮

### 2. 实时通知

#### 弹窗通知
- 收到新消息时右上角会显示弹窗
- 弹窗会自动消失，也可手动关闭
- 点击弹窗可跳转到相关内容

#### 徽章提示
- 侧边栏消息图标显示未读数量
- 红色徽章会闪烁提醒
- 超过99条显示"99+"

### 3. 浏览器通知

#### 权限设置
1. 首次使用会请求通知权限
2. 允许后可收到桌面通知
3. 可在浏览器设置中管理权限

#### 通知内容
- 显示发送者和消息内容
- 点击通知会聚焦到网页
- 3秒后自动关闭

## 开发指南

### 1. 组件结构

```
src/
├── components/
│   └── NotificationToast.vue     # 通知弹窗组件
├── services/
│   ├── api.js                    # API 接口
│   └── notificationWebSocket.js  # WebSocket 管理
├── stores/
│   └── notification.js           # 通知状态管理
└── views/
    ├── Messages.vue              # 消息页面
    └── NotificationTest.vue      # 测试页面
```

### 2. 状态管理

#### Notification Store
```javascript
// 获取通知列表
await notificationStore.loadNotifications()

// 标记已读
await notificationStore.markAsRead(notificationId)

// 获取未读数量
await notificationStore.loadUnreadCount()
```

#### WebSocket 连接
```javascript
// 连接 WebSocket
notificationWS.connect(userId)

// 订阅消息
const unsubscribe = notificationWS.subscribe((message) => {
  // 处理消息
})

// 断开连接
notificationWS.disconnect()
```

### 3. API 调用

#### 获取通知列表
```javascript
const response = await api.getNotificationList({
  current: 1,
  pageSize: 20,
  isRead: 0,  // 0-未读, 1-已读, null-全部
  type: 'LIKE' // 通知类型
})
```

#### 标记已读
```javascript
// 单个标记
await api.markNotificationAsRead(notificationId)

// 批量标记
await api.markAllNotificationsAsRead()
```

### 4. 自定义配置

#### WebSocket 配置
```javascript
// 修改重连参数
notificationWS.maxReconnectAttempts = 5
notificationWS.reconnectInterval = 3000
notificationWS.heartbeatInterval = 30000
```

#### 通知弹窗配置
```vue
<NotificationToast
  :notification="notification"
  :duration="5000"
  :autoClose="true"
  @close="handleClose"
/>
```

## 测试功能

### 访问测试页面
访问 `/notification-test` 页面可以测试通知功能：

1. **连接状态**: 查看 WebSocket 连接状态
2. **加载通知**: 测试获取通知列表
3. **标记已读**: 测试标记功能
4. **发送通知**: 发送测试通知（需要后端支持）
5. **浏览器通知**: 测试原生通知

### 调试信息
- 打开浏览器开发者工具
- 查看 Console 中的 WebSocket 连接日志
- 监控 Network 中的 API 请求

## 故障排除

### 常见问题

#### 1. WebSocket 连接失败
- 检查后端 WebSocket 服务是否启动
- 确认用户已登录且有有效的 userId
- 检查网络连接和防火墙设置

#### 2. 通知不显示
- 确认浏览器通知权限已开启
- 检查 WebSocket 连接状态
- 查看控制台是否有错误信息

#### 3. 未读数量不更新
- 检查 API 接口是否正常
- 确认 WebSocket 消息格式正确
- 验证状态管理是否正常工作

### 调试步骤

1. **检查连接状态**
   ```javascript
   console.log('WebSocket 连接状态:', notificationWS.isConnected())
   ```

2. **查看通知数据**
   ```javascript
   console.log('通知列表:', notificationStore.notifications)
   console.log('未读数量:', notificationStore.unreadCount)
   ```

3. **测试 API 接口**
   ```javascript
   // 在浏览器控制台中测试
   api.getUnreadNotificationCount().then(console.log)
   ```

## 更新日志

### v1.0.0 (2024-01-15)
- ✨ 实现基础通知功能
- ✨ 添加 WebSocket 实时通信
- ✨ 完成消息页面界面
- ✨ 支持点赞通知类型
- ✨ 添加实时弹窗提醒
- ✨ 实现未读徽章显示

### 后续计划
- 🔄 添加评论通知支持
- 🔄 实现关注通知功能
- 🔄 添加消息推送设置
- 🔄 支持消息分组显示
- 🔄 添加消息搜索功能

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进通知系统！

### 开发环境
1. 克隆项目
2. 安装依赖: `npm install`
3. 启动开发服务器: `npm run dev`
4. 访问测试页面: `http://localhost:5173/notification-test`

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 样式调整
- refactor: 代码重构
- test: 测试相关

---

如有问题，请查看 [后端接口文档](后端接口文档.md) 或联系开发团队。 