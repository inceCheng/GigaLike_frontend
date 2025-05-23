<template>
  <div class="messages-container">
    <div class="empty-state">
      <i class="fa-solid fa-bell empty-icon"></i>
      <p>暂无消息</p>
    </div>
  </div>
</template>

<style scoped>
.messages-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
}
</style> 