<template>
  <div class="page-card">
    <div class="page-title">积分管理</div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="积分排行" name="ranking">
        <el-table :data="rankingList" border stripe>
          <el-table-column type="index" label="排名" width="80">
            <template #default="{ $index }">
              <el-tag v-if="$index < 3" :type="$index === 0 ? 'danger' : $index === 1 ? 'warning' : 'success'">
                {{ $index + 1 }}
              </el-tag>
              <span v-else>{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="员工姓名" width="120" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="points" label="当前积分" width="120">
            <template #default="{ row }">
              <span style="color: #409EFF; font-weight: bold;">{{ row.points }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalPoints" label="累计积分" width="120" />
          <el-table-column prop="learningDays" label="连续学习天数" width="120">
            <template #default="{ row }">
              <el-tag type="warning" size="small">{{ row.learningDays }}天</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewDetail(row)">查看明细</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="积分规则配置" name="rules">
        <div style="padding: 20px;">
          <el-form label-width="150px">
            <el-form-item label="完成单篇资料">
              <el-input-number v-model="pointsRules.completeMaterial" :min="0" :max="100" />
              <span style="margin-left: 10px;">积分</span>
            </el-form-item>
            <el-form-item label="完成全部关联资料">
              <el-input-number v-model="pointsRules.completeAllMaterials" :min="0" :max="100" />
              <span style="margin-left: 10px;">积分</span>
            </el-form-item>
            <el-form-item label="考试及格">
              <el-input-number v-model="pointsRules.examPass" :min="0" :max="100" />
              <span style="margin-left: 10px;">积分</span>
            </el-form-item>
            <el-form-item label="考试不及格">
              <el-input-number v-model="pointsRules.examFail" :min="0" :max="100" />
              <span style="margin-left: 10px;">积分（参与奖）</span>
            </el-form-item>
            <el-form-item label="考试满分">
              <el-input-number v-model="pointsRules.examFullScore" :min="0" :max="100" />
              <span style="margin-left: 10px;">积分</span>
            </el-form-item>
            <el-form-item label="连续学习7天">
              <el-input-number v-model="pointsRules.continuous7Days" :min="0" :max="200" />
              <span style="margin-left: 10px;">积分</span>
            </el-form-item>
            <el-form-item label="连续学习30天">
              <el-input-number v-model="pointsRules.continuous30Days" :min="0" :max="500" />
              <span style="margin-left: 10px;">积分</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveRules">保存规则</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane label="积分明细" name="records">
        <div style="margin-bottom: 15px; display: flex; gap: 10px;">
          <el-select v-model="filterUser" placeholder="选择员工" clearable style="width: 150px;">
            <el-option v-for="user in employees" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
          <el-select v-model="filterType" placeholder="积分类型" clearable style="width: 120px;">
            <el-option label="学习积分" value="study" />
            <el-option label="考试积分" value="exam" />
          </el-select>
        </div>
        <el-table :data="filteredRecords" border stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="userName" label="员工" width="100" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'study' ? 'success' : 'primary'" size="small">
                {{ row.type === 'study' ? '学习' : '考试' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="行为" width="150" />
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
          <el-table-column prop="points" label="积分" width="100">
            <template #default="{ row }">
              <span style="color: #67C23A; font-weight: bold;">+{{ row.points }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="时间" width="160" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="手动调整" name="adjust">
        <div style="padding: 20px; max-width: 600px;">
          <el-form :model="adjustForm" :rules="adjustRules" ref="adjustFormRef" label-width="100px">
            <el-form-item label="选择员工" prop="userId">
              <el-select v-model="adjustForm.userId" placeholder="请选择员工" style="width: 100%">
                <el-option v-for="user in employees" :key="user.id" :label="user.name" :value="user.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="调整类型" prop="type">
              <el-radio-group v-model="adjustForm.type">
                <el-radio label="add">增加积分</el-radio>
                <el-radio label="reduce">减少积分</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="积分数量" prop="points">
              <el-input-number v-model="adjustForm.points" :min="1" :max="1000" />
            </el-form-item>
            <el-form-item label="调整原因" prop="reason">
              <el-input v-model="adjustForm.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAdjust">确认调整</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>

  <el-dialog v-model="detailDialogVisible" title="积分明细" width="700px">
    <div v-if="currentUser">
      <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
        <el-row :gutter="20">
          <el-col :span="8">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #409EFF;">{{ currentUser.points }}</div>
              <div style="color: #666;">当前积分</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #67C23A;">{{ currentUser.totalPoints }}</div>
              <div style="color: #666;">累计积分</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #E6A23C;">{{ currentUser.learningDays }}</div>
              <div style="color: #666;">连续学习天数</div>
            </div>
          </el-col>
        </el-row>
      </div>
      <el-table :data="userRecords" border stripe max-height="300">
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'study' ? 'success' : 'primary'" size="small">
              {{ row.type === 'study' ? '学习' : '考试' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="行为" width="150" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="points" label="积分" width="80">
          <template #default="{ row }">
            <span style="color: #67C23A; font-weight: bold;">+{{ row.points }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="160" />
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userPoints, pointsRecords as mockPointsRecords, pointsRules as mockPointsRules, users as mockUsers } from '@/data/mockData'

const activeTab = ref('ranking')
const filterUser = ref('')
const filterType = ref('')
const detailDialogVisible = ref(false)
const currentUser = ref(null)

const pointsRules = reactive({ ...mockPointsRules })

const employees = computed(() => mockUsers.filter(u => u.role === 'employee'))

const rankingList = computed(() => {
  return employees.value.map(emp => {
    const pointsInfo = userPoints.find(p => p.userId === emp.id) || { points: 0, totalPoints: 0, learningDays: 0 }
    return {
      ...emp,
      userName: emp.name,
      ...pointsInfo
    }
  }).sort((a, b) => b.points - a.points)
})

const allRecords = computed(() => {
  return mockPointsRecords.map(r => {
    const user = mockUsers.find(u => u.id === r.userId)
    return {
      ...r,
      userName: user ? user.name : '未知'
    }
  })
})

const filteredRecords = computed(() => {
  return allRecords.value.filter(r => {
    if (filterUser.value && r.userId !== filterUser.value) return false
    if (filterType.value && r.type !== filterType.value) return false
    return true
  })
})

const userRecords = computed(() => {
  if (!currentUser.value) return []
  return allRecords.value.filter(r => r.userId === currentUser.value.id)
})

const adjustFormRef = ref(null)
const adjustForm = reactive({
  userId: '',
  type: 'add',
  points: 10,
  reason: ''
})

const adjustRules = {
  userId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  type: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  points: [{ required: true, message: '请输入积分数量', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
}

const viewDetail = (row) => {
  currentUser.value = { ...row }
  detailDialogVisible.value = true
}

const saveRules = () => {
  ElMessage.success('积分规则保存成功')
}

const handleAdjust = async () => {
  if (!adjustFormRef.value) return
  await adjustFormRef.value.validate((valid) => {
    if (valid) {
      const user = employees.value.find(u => u.id === adjustForm.userId)
      const action = adjustForm.type === 'add' ? '增加' : '减少'
      ElMessage.success(`已为 ${user.name} ${action} ${adjustForm.points} 积分`)
      adjustFormRef.value.resetFields()
    }
  })
}
</script>
