<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div style="padding: 20px; text-align: center; border-bottom: 1px solid #3a4a5d;">
        <h3 style="color: white; margin: 0;">管理端</h3>
      </div>
      <el-menu :default-active="activeMenu" background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" router>
        <el-menu-item index="/admin/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/material">
          <el-icon><Reading /></el-icon>
          <span>学习资料管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/question">
          <el-icon><Notebook /></el-icon>
          <span>题目管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/exam">
          <el-icon><EditPen /></el-icon>
          <span>考试管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/points">
          <el-icon><Star /></el-icon>
          <span>积分管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计分析</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column;">
      <div class="admin-header">
        <div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/user' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
          <el-dropdown>
            <span style="cursor: pointer; display: flex; align-items: center; gap: 5px;">
              <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span>{{ userStore.user?.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/admin/profile')">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="admin-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const pageTitles = {
  '/admin/user': '用户管理',
  '/admin/material': '学习资料管理',
  '/admin/question': '题目管理',
  '/admin/exam': '考试管理',
  '/admin/points': '积分管理',
  '/admin/statistics': '统计分析',
  '/admin/profile': '个人中心'
}

const currentPageTitle = computed(() => pageTitles[route.path] || '')

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/admin-login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}
</script>
