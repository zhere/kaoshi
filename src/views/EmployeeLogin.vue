<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">员工端登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0">
        <el-form-item prop="phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号" prefix-icon="Iphone" size="large" maxlength="11" />
        </el-form-item>
        <el-form-item prop="smsCode">
          <div style="display: flex; gap: 10px; width: 100%;">
            <el-input v-model="loginForm.smsCode" placeholder="请输入短信验证码" prefix-icon="Key" size="large" style="flex: 1;" maxlength="6" @keyup.enter="handleLogin" />
            <el-button type="primary" size="large" @click="handleSendSms" :disabled="!!smsTimer">
              {{ smsTimer ? smsTimer + 's' : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loading">登 录</el-button>
        </el-form-item>
        <el-form-item style="text-align: center; margin-bottom: 0;">
          <el-button type="text" @click="goToAdminLogin">管理端登录</el-button>
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
const smsTimer = ref(0)

const loginForm = reactive({
  phone: '',
  smsCode: ''
})

const phoneValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1\d{10}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const rules = {
  phone: [{ required: true, validator: phoneValidator, trigger: 'blur' }],
  smsCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }]
}

const handleSendSms = () => {
  if (!/^1\d{10}$/.test(loginForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (smsTimer.value > 0) return
  ElMessage.success('验证码已发送，默认验证码为 1234')
  smsTimer.value = 60
  const timer = setInterval(() => {
    smsTimer.value--
    if (smsTimer.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        if (loginForm.smsCode !== '1234') {
          ElMessage.error('验证码错误')
          loading.value = false
          return
        }
        const user = users.find(u => u.phone === loginForm.phone && u.role === 'employee')
        if (user) {
          userStore.setUser(user)
          userStore.setLoginType('employee')
          ElMessage.success('登录成功')
          router.push('/employee/exam-list')
        } else {
          ElMessage.error('该手机号未注册')
        }
        loading.value = false
      }, 500)
    }
  })
}

const goToAdminLogin = () => {
  router.push('/admin-login')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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