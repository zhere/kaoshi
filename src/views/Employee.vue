<template>
  <div class="employee-layout">
    <div class="employee-header">
      <div style="display: flex; align-items: center; gap: 15px;">
        <h3 style="margin: 0; color: #409EFF;">考试系统</h3>
        <span style="color: #666;">|</span>
        <span>{{ userStore.user?.name }} ({{ userStore.user?.department }})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 15px;">
        <el-button type="primary" link @click="router.push('/employee/exam-list')">考试列表</el-button>
        <el-button type="primary" link @click="router.push('/employee/history')">历史记录</el-button>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    <div class="employee-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
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
