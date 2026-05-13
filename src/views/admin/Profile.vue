<template>
  <div class="page-card">
    <div class="page-title">个人中心</div>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="个人信息" name="info">
        <el-form :model="userInfo" label-width="100px" style="max-width: 500px;">
          <el-form-item label="用户名">
            <el-input v-model="userInfo.username" disabled />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="userInfo.name" />
          </el-form-item>
          <el-form-item label="角色">
            <el-tag :type="userInfo.role === 'super_admin' ? 'danger' : 'primary'">
              {{ userInfo.role === 'super_admin' ? '超级管理员' : '普通管理员' }}
            </el-tag>
          </el-form-item>
          <el-form-item label="部门">
            <el-input v-model="userInfo.department" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="userInfo.phone" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userInfo.email" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveUserInfo">保存修改</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px" style="max-width: 500px;">
          <el-form-item label="原密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePassword">修改密码</el-button>
            <el-button @click="resetPasswordForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const activeTab = ref('info')
const passwordFormRef = ref(null)

const userInfo = reactive({
  username: userStore.user?.username || 'admin',
  name: userStore.user?.name || '管理员',
  role: userStore.user?.role || 'admin',
  department: userStore.user?.department || '技术部',
  phone: userStore.user?.phone || '13800138000',
  email: userStore.user?.email || 'admin@example.com'
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const saveUserInfo = () => {
  userStore.updateUser(userInfo)
  ElMessage.success('个人信息保存成功')
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      if (passwordForm.oldPassword !== '123456') {
        ElMessage.error('原密码错误')
        return
      }
      
      ElMessage.success('密码修改成功，请重新登录')
      resetPasswordForm()
    }
  })
}

const resetPasswordForm = () => {
  passwordFormRef.value?.resetFields()
}
</script>

<style scoped>
.page-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
</style>
