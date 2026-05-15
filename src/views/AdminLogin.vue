<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">管理端登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loading">登 录</el-button>
        </el-form-item>
        <el-form-item style="text-align: center; margin-bottom: 0;">
          <el-button type="text" @click="goToEmployeeLogin">员工端登录</el-button>
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

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
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
          if (user.role === 'employee') {
            ElMessage.error('该账号无管理端权限')
            loading.value = false
            return
          }
          userStore.setUser(user)
          userStore.setLoginType('admin')
          ElMessage.success('登录成功')
          router.push('/admin/user')
        } else {
          ElMessage.error('用户名或密码错误')
        }
        loading.value = false
      }, 500)
    }
  })
}

const goToEmployeeLogin = () => {
  router.push('/employee-login')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  width: 400px;
}

.login-title {
  text-align: center;
  color: #303133;
  font-size: 24px;
  margin-bottom: 30px;
}
</style>