<template>
  <div class="page-card">
    <div class="page-title">用户管理</div>
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加管理人员
      </el-button>
    </div>
    <el-table :data="adminUsers" border stripe>
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role === 'super_admin' ? 'danger' : 'primary'">
            {{ row.role === 'super_admin' ? '超级管理员' : '普通管理员' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="department" label="部门" width="120" />
      <el-table-column prop="phone" label="联系电话" width="140" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" size="small" @click="handleResetPassword(row)">重置密码</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)" :disabled="row.role === 'super_admin'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" :disabled="isEdit" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="userForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
          <el-option label="超级管理员" value="super_admin" />
          <el-option label="普通管理员" value="admin" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门" prop="department">
        <el-input v-model="userForm.department" placeholder="请输入部门" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="userForm.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { users } from '@/data/mockData'

const dialogVisible = ref(false)
const dialogTitle = ref('添加管理人员')
const isEdit = ref(false)
const userFormRef = ref(null)
const userList = ref([...users])

const adminUsers = computed(() => userList.value.filter(u => u.role !== 'employee'))

const userForm = reactive({
  id: null,
  username: '',
  name: '',
  role: 'admin',
  department: '',
  phone: '',
  email: '',
  password: '',
  status: 'active'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const resetForm = () => {
  Object.assign(userForm, {
    id: null,
    username: '',
    name: '',
    role: 'admin',
    department: '',
    phone: '',
    email: '',
    password: '',
    status: 'active'
  })
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogTitle.value = '添加管理人员'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑管理人员'
  Object.assign(userForm, { ...row, password: '' })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  await userFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = userList.value.findIndex(u => u.id === userForm.id)
        if (index !== -1) {
          userList.value[index] = { ...userList.value[index], ...userForm }
        }
        ElMessage.success('编辑成功')
      } else {
        const newUser = {
          ...userForm,
          id: userList.value.length + 1
        }
        userList.value.push(newUser)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该管理人员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = userList.value.findIndex(u => u.id === row.id)
    if (index !== -1) {
      userList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleResetPassword = (row) => {
  ElMessageBox.confirm('确定要重置该管理人员的密码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置为：123456')
  }).catch(() => {})
}
</script>
