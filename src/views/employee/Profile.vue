<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="avatar">
        <el-avatar :size="80" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
      </div>
      <div class="user-info">
        <h3>{{ userStore.user?.name }}</h3>
        <p>{{ userStore.user?.department }}</p>
      </div>
    </div>

    <div class="profile-stats">
      <div class="stat-item">
        <div class="stat-number">{{ userStats.examCount }}</div>
        <div class="stat-label">参与考试</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ userStats.averageScore }}</div>
        <div class="stat-label">平均分</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ userStats.studyHours }}h</div>
        <div class="stat-label">学习时长</div>
      </div>
    </div>

    <div class="profile-menu">
      <el-cell-group>
        <el-cell title="个人信息" is-link @click="showEditProfile">
          <template #icon>
            <el-icon><User /></el-icon>
          </template>
        </el-cell>
        <el-cell title="修改密码" is-link @click="showChangePassword">
          <template #icon>
            <el-icon><Lock /></el-icon>
          </template>
        </el-cell>
        <el-cell title="我的积分" is-link @click="router.push('/employee/points')">
          <template #icon>
            <el-icon><Star /></el-icon>
          </template>
          <template #value>
            <span style="color: #E6A23C; font-weight: bold;">{{ userStats.points }}</span>
          </template>
        </el-cell>
      </el-cell-group>
    </div>

    <div class="profile-menu" style="margin-top: 20px;">
      <el-cell-group>
        <el-cell title="帮助中心" is-link>
          <template #icon>
            <el-icon><QuestionFilled /></el-icon>
          </template>
        </el-cell>
        <el-cell title="关于我们" is-link>
          <template #icon>
            <el-icon><InfoFilled /></el-icon>
          </template>
        </el-cell>
      </el-cell-group>
    </div>

    <div style="padding: 20px;">
      <el-button type="danger" style="width: 100%;" @click="handleLogout">退出登录</el-button>
    </div>

    <el-dialog v-model="editProfileVisible" title="个人信息" width="90%" style="max-width: 500px;">
      <el-form :model="profileForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
          >
            <el-avatar :size="80" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          </el-upload>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="profileForm.department" disabled />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="profileForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editProfileVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="changePasswordVisible" title="修改密码" width="90%" style="max-width: 500px;">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changePasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="savePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const editProfileVisible = ref(false)
const changePasswordVisible = ref(false)
const passwordFormRef = ref(null)
const unreadCount = ref(3)

const userStats = reactive({
  examCount: 12,
  averageScore: 82,
  studyHours: 45,
  points: 580
})

const profileForm = reactive({
  name: userStore.user?.name || '',
  department: userStore.user?.department || '',
  phone: userStore.user?.phone || '13800138000',
  email: userStore.user?.email || 'user@example.com'
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
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const showEditProfile = () => {
  editProfileVisible.value = true
}

const showChangePassword = () => {
  changePasswordVisible.value = true
}

const saveProfile = () => {
  ElMessage.success('个人信息保存成功')
  editProfileVisible.value = false
}

const savePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('密码修改成功，请重新登录')
      changePasswordVisible.value = false
      passwordFormRef.value.resetFields()
    }
  })
}

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
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 70px;
}

.profile-header {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.avatar {
  margin-bottom: 15px;
}

.user-info h3 {
  margin: 0;
  font-size: 20px;
  margin-bottom: 5px;
}

.user-info p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.profile-stats {
  display: flex;
  background: white;
  margin: -30px 20px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.profile-menu {
  margin: 0 10px;
  border-radius: 8px;
  overflow: hidden;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}
</style>
