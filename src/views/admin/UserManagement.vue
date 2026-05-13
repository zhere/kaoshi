<template>
  <div class="page-card">
    <div class="page-title">用户管理</div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="用户管理" name="users">
        <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>添加用户
          </el-button>
          <el-button type="success" @click="handleImport">
            <el-icon><Upload /></el-icon>导入用户
          </el-button>
          <el-button @click="handleDownloadTemplate">
            <el-icon><Download /></el-icon>下载模板
          </el-button>
          <el-select v-model="filterRole" placeholder="角色筛选" clearable style="width: 120px;">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="普通管理员" value="admin" />
            <el-option label="员工" value="employee" />
          </el-select>
          <el-select v-model="filterDepartment" placeholder="部门筛选" clearable style="width: 150px;">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
          <el-select v-model="filterUserStatus" placeholder="状态筛选" clearable style="width: 120px;">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
          <el-date-picker v-model="filterDateRange" type="daterange" range-separator="至" start-placeholder="创建起始" end-placeholder="创建结束" value-format="YYYY-MM-DD" style="width: 240px;" />
          <el-input v-model="searchKeyword" placeholder="搜索用户名或姓名" clearable style="width: 200px;">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" link @click="showAdvancedSearch = !showAdvancedSearch">
            {{ showAdvancedSearch ? '收起高级搜索' : '展开高级搜索' }}
            <el-icon><ArrowDown v-if="!showAdvancedSearch" /><ArrowUp v-else /></el-icon>
          </el-button>
        </div>
        <el-collapse-transition>
          <div v-if="showAdvancedSearch" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
            <el-form :inline="true" label-width="80px">
              <el-form-item label="用户名">
                <el-input v-model="advSearch.username" placeholder="用户名" clearable style="width: 150px;" />
              </el-form-item>
              <el-form-item label="姓名">
                <el-input v-model="advSearch.name" placeholder="姓名" clearable style="width: 150px;" />
              </el-form-item>
              <el-form-item label="角色">
                <el-select v-model="advSearch.role" placeholder="全部" clearable style="width: 120px;">
                  <el-option label="超级管理员" value="super_admin" />
                  <el-option label="普通管理员" value="admin" />
                  <el-option label="员工" value="employee" />
                </el-select>
              </el-form-item>
              <el-form-item label="部门">
                <el-select v-model="advSearch.department" placeholder="全部" clearable style="width: 150px;">
                  <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="advSearch.status" placeholder="全部" clearable style="width: 100px;">
                  <el-option label="启用" value="active" />
                  <el-option label="禁用" value="disabled" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="applyAdvancedSearch">查询</el-button>
                <el-button @click="resetAdvancedSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-transition>
        <el-table :data="filteredUsers" border stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="row.role === 'super_admin' ? 'danger' : row.role === 'admin' ? 'primary' : 'success'">
                {{ row.role === 'super_admin' ? '超级管理员' : row.role === 'admin' ? '普通管理员' : '员工' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" width="120">
            <template #default="{ row }">
              {{ row.department || getDepartmentName(row.department) }}
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="联系电话" width="140" />
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="warning" size="small" @click="handleResetPassword(row)">重置密码</el-button>
              <el-button type="info" size="small" @click="handleSetPermissions(row)">权限</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)" :disabled="row.role === 'super_admin'">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="部门管理" name="departments">
        <div style="margin-bottom: 20px;">
          <el-button type="primary" @click="handleAddDepartment">
            <el-icon><Plus /></el-icon>添加部门
          </el-button>
        </div>
        <el-table :data="departments" border stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="部门名称" />
          <el-table-column prop="parentName" label="上级部门" />
          <el-table-column prop="manager" label="部门负责人" width="120" />
          <el-table-column prop="memberCount" label="成员数量" width="100" />
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditDepartment(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDeleteDepartment(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="角色管理" name="roles">
        <div style="margin-bottom: 20px;">
          <el-button type="primary" @click="handleAddRole">
            <el-icon><Plus /></el-icon>添加角色
          </el-button>
        </div>
        <el-table :data="roles" border stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="角色名称" width="150" />
          <el-table-column prop="code" label="角色代码" width="150" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="userCount" label="用户数" width="100" />
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditRole(row)">编辑</el-button>
              <el-button type="success" size="small" @click="handleSetRolePermissions(row)">权限设置</el-button>
              <el-button type="danger" size="small" @click="handleDeleteRole(row)" :disabled="row.code === 'super_admin'">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
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
          <el-option label="员工" value="employee" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门" prop="department">
        <el-select v-model="userForm.department" placeholder="请选择部门" style="width: 100%">
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
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

  <el-dialog v-model="importDialogVisible" title="导入用户" width="700px">
    <div style="margin-bottom: 20px;">
      <el-alert title="请先下载模板填写用户信息，然后上传 Excel 或 CSV 文件" type="info" :closable="false" show-icon />
    </div>
    <el-upload
      drag
      action="#"
      :auto-upload="false"
      :on-change="handleImportFileChange"
      accept=".xlsx,.xls,.csv"
      :limit="1"
      :file-list="importFileList"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          只能上传 xlsx、xls、csv 文件
        </div>
      </template>
    </el-upload>
    <div v-if="importPreviewData.length > 0" style="margin-top: 20px;">
      <el-divider />
      <h4 style="margin-bottom: 15px;">导入预览（共 {{ importPreviewData.length }} 条）</h4>
      <div v-if="importDuplicateCount > 0" style="margin-bottom: 10px;">
        <el-alert :title="`检测到 ${importDuplicateCount} 条重复数据`" type="warning" :closable="false" show-icon>
          <template #default>
            <el-radio-group v-model="importDuplicateMode" size="small" style="margin-top: 5px;">
              <el-radio value="skip">跳过重复</el-radio>
              <el-radio value="overwrite">覆盖已有</el-radio>
            </el-radio-group>
          </template>
        </el-alert>
      </div>
      <el-table :data="importPreviewData" border stripe max-height="300">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.role === 'super_admin' ? '超级管理员' : row.role === 'admin' ? '管理员' : '员工' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" label="部门" width="100" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
        <el-table-column label="导入状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row._duplicate" type="warning" size="small">重复</el-tag>
            <el-tag v-else type="success" size="small">新增</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="importDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmImport" :disabled="importPreviewData.length === 0">确认导入</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="departmentDialogVisible" :title="isEditDepartment ? '编辑部门' : '添加部门'" width="500px">
    <el-form :model="departmentForm" :rules="departmentRules" ref="departmentFormRef" label-width="100px">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="departmentForm.name" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="上级部门">
        <el-select v-model="departmentForm.parentId" placeholder="请选择上级部门" clearable style="width: 100%">
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门负责人">
        <el-input v-model="departmentForm.manager" placeholder="请输入部门负责人" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="departmentForm.description" type="textarea" :rows="3" placeholder="请输入部门描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="departmentDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveDepartment">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="roleDialogVisible" :title="isEditRole ? '编辑角色' : '添加角色'" width="500px">
    <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色代码" prop="code">
        <el-input v-model="roleForm.code" :disabled="isEditRole" placeholder="请输入角色代码" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="roleDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveRole">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="permissionDialogVisible" title="权限设置" width="500px">
    <el-tree
      :data="permissionTree"
      show-checkbox
      node-key="id"
      :default-checked-keys="currentPermissions"
      :props="{ children: 'children', label: 'label' }"
    />
    <template #footer>
      <el-button @click="permissionDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="savePermissions">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { users as mockUsers } from '@/data/mockData'

const activeTab = ref('users')
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const isEdit = ref(false)
const userFormRef = ref(null)
const userList = ref([...mockUsers])

const filterRole = ref('')
const filterDepartment = ref('')
const filterUserStatus = ref('')
const filterDateRange = ref([])
const searchKeyword = ref('')
const showAdvancedSearch = ref(false)

const advSearch = reactive({
  username: '',
  name: '',
  role: '',
  department: '',
  status: ''
})

const importDialogVisible = ref(false)
const importFileList = ref([])
const importPreviewData = ref([])
const importDuplicateMode = ref('skip')

const importDuplicateCount = computed(() => {
  return importPreviewData.value.filter(item => item._duplicate).length
})

const departmentDialogVisible = ref(false)
const departmentFormRef = ref(null)
const isEditDepartment = ref(false)

const roleDialogVisible = ref(false)
const roleFormRef = ref(null)
const isEditRole = ref(false)

const permissionDialogVisible = ref(false)

const departments = ref([
  { id: 1, name: '技术部', parentName: '-', manager: '张三', memberCount: 15, description: '负责系统开发和维护' },
  { id: 2, name: '运维部', parentName: '-', manager: '李四', memberCount: 12, description: '负责系统运维' },
  { id: 3, name: '检修部', parentName: '-', manager: '王五', memberCount: 20, description: '负责设备检修' },
  { id: 4, name: '安全部', parentName: '-', manager: '赵六', memberCount: 8, description: '负责安全管理' }
])

const roles = ref([
  { id: 1, name: '超级管理员', code: 'super_admin', description: '拥有系统所有权限', userCount: 1 },
  { id: 2, name: '普通管理员', code: 'admin', description: '管理日常业务', userCount: 2 },
  { id: 3, name: '员工', code: 'employee', description: '普通员工，参与考试和学习', userCount: 50 }
])

const userForm = reactive({
  id: null,
  username: '',
  name: '',
  role: 'employee',
  department: '',
  phone: '',
  email: '',
  password: '',
  status: 'active',
  createTime: ''
})

const departmentForm = reactive({
  id: null,
  name: '',
  parentId: null,
  manager: '',
  description: ''
})

const roleForm = reactive({
  id: null,
  name: '',
  code: '',
  description: ''
})

const currentPermissions = ref([])
const permissionTree = ref([
  {
    id: 'user',
    label: '用户管理',
    children: [
      { id: 'user:view', label: '查看用户' },
      { id: 'user:add', label: '添加用户' },
      { id: 'user:edit', label: '编辑用户' },
      { id: 'user:delete', label: '删除用户' }
    ]
  },
  {
    id: 'exam',
    label: '考试管理',
    children: [
      { id: 'exam:view', label: '查看考试' },
      { id: 'exam:add', label: '创建考试' },
      { id: 'exam:edit', label: '编辑考试' },
      { id: 'exam:delete', label: '删除考试' }
    ]
  },
  {
    id: 'question',
    label: '题目管理',
    children: [
      { id: 'question:view', label: '查看题目' },
      { id: 'question:add', label: '添加题目' },
      { id: 'question:edit', label: '编辑题目' },
      { id: 'question:delete', label: '删除题目' }
    ]
  },
  {
    id: 'material',
    label: '学习资料管理',
    children: [
      { id: 'material:view', label: '查看资料' },
      { id: 'material:add', label: '上传资料' },
      { id: 'material:edit', label: '编辑资料' },
      { id: 'material:delete', label: '删除资料' }
    ]
  },
  {
    id: 'statistics',
    label: '统计分析',
    children: [
      { id: 'statistics:view', label: '查看统计' },
      { id: 'statistics:export', label: '导出数据' }
    ]
  }
])

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const departmentRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色代码', trigger: 'blur' }]
}

const filteredUsers = computed(() => {
  return userList.value.filter(user => {
    if (filterRole.value && user.role !== filterRole.value) return false
    if (filterDepartment.value && user.department !== filterDepartment.value) return false
    if (filterUserStatus.value && user.status !== filterUserStatus.value) return false
    if (filterDateRange.value && filterDateRange.value.length === 2) {
      const createDate = user.createTime ? user.createTime.substring(0, 10) : ''
      if (createDate < filterDateRange.value[0] || createDate > filterDateRange.value[1]) return false
    }
    if (searchKeyword.value && !user.username.includes(searchKeyword.value) && !user.name.includes(searchKeyword.value)) return false
    if (showAdvancedSearch.value) {
      if (advSearch.username && !user.username.includes(advSearch.username)) return false
      if (advSearch.name && !user.name.includes(advSearch.name)) return false
      if (advSearch.role && user.role !== advSearch.role) return false
      if (advSearch.department && user.department !== advSearch.department) return false
      if (advSearch.status && user.status !== advSearch.status) return false
    }
    return true
  })
})

const getDepartmentName = (deptId) => {
  const dept = departments.value.find(d => d.id === deptId)
  return dept ? dept.name : ''
}

const resetForm = () => {
  Object.assign(userForm, {
    id: null,
    username: '',
    name: '',
    role: 'employee',
    department: '',
    phone: '',
    email: '',
    password: '',
    status: 'active',
    createTime: ''
  })
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogTitle.value = '添加用户'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, { ...row, password: '' })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  await userFormRef.value.validate((valid) => {
    if (valid) {
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      if (isEdit.value) {
        const index = userList.value.findIndex(u => u.id === userForm.id)
        if (index !== -1) {
          userList.value[index] = { ...userList.value[index], ...userForm }
        }
        ElMessage.success('编辑成功')
      } else {
        const newUser = {
          ...userForm,
          id: userList.value.length + 1,
          createTime: now
        }
        userList.value.push(newUser)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
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
  ElMessageBox.confirm('确定要重置该用户的密码吗？重置后的密码为 123456。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置为 123456')
  }).catch(() => {})
}

const handleSetPermissions = (row) => {
  currentPermissions.value = ['user:view', 'exam:view', 'question:view']
  permissionDialogVisible.value = true
}

// ===== 导入用户 =====
const handleImport = () => {
  importPreviewData.value = []
  importFileList.value = []
  importDuplicateMode.value = 'skip'
  importDialogVisible.value = true
}

const handleImportFileChange = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    return
  }
  const mockImportData = [
    { username: 'emp004', name: '孙八', role: 'employee', departmentName: '技术部', department: 1, phone: '13800138006', email: 'sunba@power.com', _duplicate: false },
    { username: 'emp005', name: '周九', role: 'employee', departmentName: '运维部', department: 2, phone: '13800138007', email: 'zhoujiu@power.com', _duplicate: false },
    { username: 'emp001', name: '王五', role: 'employee', departmentName: '运维部', department: 2, phone: '13800138003', email: 'wangwu@power.com', _duplicate: true }
  ]
  importPreviewData.value = mockImportData.map(item => ({
    ...item,
    _duplicate: userList.value.some(u => u.username === item.username)
  }))
  ElMessage.success('文件解析成功')
}

const confirmImport = () => {
  let successCount = 0
  let skipCount = 0
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  importPreviewData.value.forEach(item => {
    const existingIndex = userList.value.findIndex(u => u.username === item.username)
    if (existingIndex !== -1) {
      if (importDuplicateMode.value === 'overwrite') {
        userList.value[existingIndex] = { ...userList.value[existingIndex], name: item.name, department: item.department, phone: item.phone, email: item.email }
        successCount++
      } else {
        skipCount++
      }
    } else {
      userList.value.push({
        id: userList.value.length + 1,
        username: item.username,
        name: item.name,
        role: item.role,
        department: item.department,
        phone: item.phone || '',
        email: item.email || '',
        password: '123456',
        status: 'active',
        createTime: now
      })
      successCount++
    }
  })
  const resultMsg = `导入成功 ${successCount} 条` + (skipCount > 0 ? `，跳过 ${skipCount} 条重复` : '')
  ElMessage.success(resultMsg)
  importDialogVisible.value = false
}

const handleDownloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

// ===== 高级搜索 =====
const applyAdvancedSearch = () => {
  showAdvancedSearch.value = true
  ElMessage.success('已应用高级搜索条件')
}

const resetAdvancedSearch = () => {
  Object.assign(advSearch, { username: '', name: '', role: '', department: '', status: '' })
  ElMessage.info('高级搜索条件已重置')
}

// ===== 部门管理 =====
const handleAddDepartment = () => {
  Object.assign(departmentForm, { id: null, name: '', parentId: null, manager: '', description: '' })
  isEditDepartment.value = false
  departmentDialogVisible.value = true
}

const handleEditDepartment = (row) => {
  isEditDepartment.value = true
  Object.assign(departmentForm, { ...row })
  departmentDialogVisible.value = true
}

const handleDeleteDepartment = (row) => {
  ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = departments.value.findIndex(d => d.id === row.id)
    if (index !== -1) {
      departments.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const saveDepartment = () => {
  if (!departmentForm.name) {
    ElMessage.warning('请输入部门名称')
    return
  }
  if (isEditDepartment.value) {
    const index = departments.value.findIndex(d => d.id === departmentForm.id)
    if (index !== -1) {
      departments.value[index] = { ...departments.value[index], ...departmentForm }
    }
    ElMessage.success('编辑成功')
  } else {
    departments.value.push({
      ...departmentForm,
      id: departments.value.length + 1,
      parentName: departmentForm.parentId ? departments.value.find(d => d.id === departmentForm.parentId)?.name : '-',
      memberCount: 0
    })
    ElMessage.success('添加成功')
  }
  departmentDialogVisible.value = false
}

// ===== 角色管理 =====
const handleAddRole = () => {
  Object.assign(roleForm, { id: null, name: '', code: '', description: '' })
  isEditRole.value = false
  roleDialogVisible.value = true
}

const handleEditRole = (row) => {
  isEditRole.value = true
  Object.assign(roleForm, { ...row })
  roleDialogVisible.value = true
}

const handleDeleteRole = (row) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = roles.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      roles.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSetRolePermissions = (row) => {
  currentPermissions.value = ['user:view', 'exam:view', 'question:view']
  permissionDialogVisible.value = true
}

const saveRole = () => {
  if (!roleForm.name || !roleForm.code) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (isEditRole.value) {
    const index = roles.value.findIndex(r => r.id === roleForm.id)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...roleForm }
    }
    ElMessage.success('编辑成功')
  } else {
    roles.value.push({ ...roleForm, id: roles.value.length + 1, userCount: 0 })
    ElMessage.success('添加成功')
  }
  roleDialogVisible.value = false
}

const savePermissions = () => {
  ElMessage.success('权限设置成功')
  permissionDialogVisible.value = false
}
</script>