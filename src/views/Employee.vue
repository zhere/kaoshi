<template>
  <div class="employee-layout">
    <div class="employee-header">
      <div class="header-left">
        <h3 class="header-title">考试系统</h3>
        <span class="header-divider">|</span>
        <span class="header-user">{{ userStore.user?.name }} ({{ userStore.user?.department }})</span>
      </div>
      <div class="header-right">
        <el-button type="primary" link @click="router.push('/employee/exam-list')">
          <el-icon><EditPen /></el-icon><span class="btn-text">考试列表</span>
        </el-button>
        <el-button type="success" link @click="router.push('/employee/material')">
          <el-icon><Reading /></el-icon><span class="btn-text">学习资料</span>
        </el-button>
        <el-button type="warning" link @click="router.push('/employee/points')">
          <el-icon><Star /></el-icon><span class="btn-text">我的积分</span>
        </el-button>
        <el-button type="info" link @click="router.push('/employee/history')">
          <el-icon><Clock /></el-icon><span class="btn-text">历史记录</span>
        </el-button>
        <el-button type="primary" link @click="router.push('/employee/profile')">
          <el-icon><User /></el-icon><span class="btn-text">个人中心</span>
        </el-button>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    <div class="employee-content">
      <router-view />
    </div>
    
    <div class="mobile-nav">
      <div class="mobile-nav-item" :class="{ active: route.path === '/employee/exam-list' }" @click="router.push('/employee/exam-list')">
        <el-icon><EditPen /></el-icon>
        <span>考试</span>
      </div>
      <div class="mobile-nav-item" :class="{ active: route.path === '/employee/material' }" @click="router.push('/employee/material')">
        <el-icon><Reading /></el-icon>
        <span>学习</span>
      </div>
      <div class="mobile-nav-item" :class="{ active: route.path === '/employee/points' }" @click="router.push('/employee/points')">
        <el-icon><Star /></el-icon>
        <span>积分</span>
      </div>
      <div class="mobile-nav-item" :class="{ active: route.path === '/employee/history' }" @click="router.push('/employee/history')">
        <el-icon><Clock /></el-icon>
        <span>历史</span>
      </div>
      <div class="mobile-nav-item" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        <span>退出</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}
</script>

<style scoped>
.employee-layout {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 60px;
}

.employee-header {
  background: white;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-title {
  margin: 0;
  color: #409EFF;
  font-size: 18px;
}

.header-divider {
  color: #666;
}

.header-user {
  color: #333;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-text {
  margin-left: 5px;
}

.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 8px 0;
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.mobile-nav-item .el-icon {
  font-size: 20px;
}

.mobile-nav-item.active {
  color: #409EFF;
}

.mobile-nav-item:active {
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .employee-layout {
    padding-bottom: 70px;
  }
  
  .employee-header {
    padding: 10px 15px;
  }
  
  .header-title {
    font-size: 16px;
  }
  
  .header-divider,
  .header-user {
    display: none;
  }
  
  .header-right {
    display: none;
  }
  
  .mobile-nav {
    display: flex;
  }
  
  .employee-content {
    padding: 10px;
  }
}

@media (min-width: 769px) {
  .employee-content {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
