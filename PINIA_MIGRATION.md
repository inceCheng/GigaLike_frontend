# Pinia 状态管理迁移说明

## 概述

本项目已从基础的 localStorage 状态管理迁移到使用 Pinia 状态管理库。这次迁移解决了服务端 session 过期但前端 localStorage 仍然保存用户信息的 bug。

## 主要改进

### 1. 统一的状态管理
- 使用 Pinia store 管理用户状态
- 响应式的登录状态检查
- 集中化的用户信息管理

### 2. Session 过期处理
- 自动检测服务端 session 状态
- 当 session 过期时自动清除本地状态
- 自动重定向到登录页面

### 3. 请求拦截器
- 统一处理 401/403 错误
- 自动清除过期的用户数据
- 优雅的错误处理

## 文件结构

```
src/
├── stores/
│   └── user.js                 # 用户状态管理 store
├── services/
│   ├── axios.js               # axios 配置和拦截器
│   └── api.js                 # API 调用方法
├── composables/
│   └── useAuth.js             # 认证相关的组合式函数
└── views/
    ├── App.vue                # 更新为使用 Pinia
    ├── LoginPage.vue          # 更新登录逻辑
    ├── ProfilePage.vue        # 更新用户信息管理
    └── BlogDetailView.vue     # 更新认证检查
```

## 核心功能

### 用户 Store (`src/stores/user.js`)

```javascript
// 主要功能
- user: 用户信息状态
- isLoggedIn: 登录状态计算属性
- login(): 登录方法
- logout(): 退出登录方法
- validateSession(): 验证 session 有效性
- updateUserInfo(): 更新用户信息
```

### Axios 拦截器 (`src/services/axios.js`)

```javascript
// 响应拦截器自动处理
- 401/403 错误自动清除用户状态
- 自动重定向到登录页面
- 统一的错误处理
```

### 路由守卫 (`src/router/index.js`)

```javascript
// 增强的路由保护
- 检查登录状态
- 验证 session 有效性
- 自动处理过期状态
```

## 使用方法

### 在组件中使用

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 检查登录状态
if (userStore.isLoggedIn) {
  // 用户已登录
}

// 获取用户信息
const user = userStore.user

// 登录
const result = await userStore.login({ username, password })

// 退出登录
await userStore.logout()
</script>
```

### 使用组合式函数

```vue
<script setup>
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn, user, requireAuth, logout } = useAuth()

// 需要认证的操作
const handleAction = () => {
  requireAuth(() => {
    // 执行需要登录的操作
  })
}
</script>
```

## Bug 修复

### 问题描述
之前的实现中，当服务端 session 过期后，前端的 localStorage 仍然保存着 `gigaLikeUserId` 和 `gigaLikeUser`，导致：
1. 前端认为用户仍然登录
2. API 请求因为 session 过期而失败
3. 用户无法正常使用功能

### 解决方案
1. **Session 验证**: 在路由守卫中验证 session 有效性
2. **自动清理**: 当检测到 session 过期时自动清除本地状态
3. **拦截器处理**: 通过 axios 拦截器统一处理认证错误
4. **状态同步**: 确保前端状态与服务端 session 状态同步

### 具体实现
1. `validateSession()` 方法定期检查 session 状态
2. 401/403 错误自动触发状态清理
3. 路由守卫在每次导航时验证认证状态
4. 统一的错误处理和用户反馈

## 迁移完成的文件

- ✅ `src/stores/user.js` - 新增 Pinia store
- ✅ `src/services/axios.js` - 新增 axios 配置
- ✅ `src/main.js` - 添加 Pinia 配置
- ✅ `src/router/index.js` - 更新路由守卫
- ✅ `src/App.vue` - 使用 Pinia store
- ✅ `src/views/LoginPage.vue` - 使用 store 登录
- ✅ `src/views/ProfilePage.vue` - 使用 store 管理用户信息
- ✅ `src/views/BlogDetailView.vue` - 使用 store 检查认证
- ✅ `src/services/api.js` - 使用新的 axios 配置
- ✅ `src/composables/useAuth.js` - 新增认证组合式函数

## 测试建议

1. **登录流程测试**
   - 正常登录
   - 登录失败处理
   - 登录状态持久化

2. **Session 过期测试**
   - 手动清除服务端 session
   - 验证前端自动清理状态
   - 验证自动重定向到登录页

3. **路由保护测试**
   - 未登录访问受保护页面
   - 登录后正常访问
   - Session 过期后的重定向

4. **状态同步测试**
   - 多标签页状态同步
   - 刷新页面后状态恢复
   - 网络错误处理

## 注意事项

1. 确保后端正确返回 401/403 状态码当 session 过期时
2. 测试时可以通过开发者工具手动删除服务端 session 来模拟过期
3. 注意处理网络错误和服务器错误的区别
4. 考虑添加 token 刷新机制（如果使用 JWT）

## 性能优化建议

1. 考虑使用 Pinia 的持久化插件
2. 实现更精细的状态更新策略
3. 添加请求缓存机制
4. 考虑实现离线状态处理 