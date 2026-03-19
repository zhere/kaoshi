<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">考试管理系统</h2>
      <div class="login-type-switch">
        <el-radio-group v-model="loginType" size="large">
          <el-radio-button label="admin">管理端登录</el-radio-button>
          <el-radio-button label="employee">员工端登录</el-radio-button>
        </el-radio-group>
      </div>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名/工号" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item v-if="loginType === 'employee'">
          <el-checkbox v-model="loginForm.remember">记住登录状态</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loading">登 录</el-button>
        </el-form-item>
        <el-form-item v-if="loginType === 'employee'">
          <el-button type="text" @click="handleForgotPassword">忘记密码？</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { users } from '@/data/mockData'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const loginType = ref('admin')

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入用户名/工号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password)
        if (user) {
          if (loginType.value === 'admin' && user.role === 'employee') {
            ElMessage.error('该账号无管理端权限')
            loading.value = false
            return
          }
          if (loginType.value === 'employee' && user.role !== 'employee') {
            ElMessage.error('请使用员工账号登录员工端')
            loading.value = false
            return
          }
          userStore.setUser(user)
          userStore.setLoginType(loginType.value)
          ElMessage.success('登录成功')
          if (loginType.value === 'admin') {
            router.push('/admin/user')
          } else {
            router.push('/employee/exam-list')
          }
        } else {
          ElMessage.error('用户名或密码错误')
        }
        loading.value = false
      }, 500)
    }
  })
}

const handleForgotPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}
</script>
