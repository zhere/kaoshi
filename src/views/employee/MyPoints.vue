<template>
  <div>
    <div class="page-card">
      <div class="page-title">我的积分</div>
      
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="8">
          <div class="points-card">
            <div class="points-icon" style="background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);">
              <el-icon :size="32"><Star /></el-icon>
            </div>
            <div class="points-info">
              <div class="points-value">{{ userPointsInfo.points }}</div>
              <div class="points-label">当前积分</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="points-card">
            <div class="points-icon" style="background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="points-info">
              <div class="points-value">{{ userPointsInfo.totalPoints }}</div>
              <div class="points-label">累计积分</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="points-card">
            <div class="points-icon" style="background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);">
              <el-icon :size="32"><Calendar /></el-icon>
            </div>
            <div class="points-info">
              <div class="points-value">{{ userPointsInfo.learningDays }}</div>
              <div class="points-label">连续学习天数</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-card style="margin-bottom: 20px;">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>积分排行</span>
            <el-tag type="warning">第 {{ myRank }} 名</el-tag>
          </div>
        </template>
        <el-table :data="topRanking" border stripe size="small">
          <el-table-column type="index" label="排名" width="80">
            <template #default="{ $index }">
              <el-tag v-if="$index < 3" :type="$index === 0 ? 'danger' : $index === 1 ? 'warning' : 'success'" size="small">
                {{ $index + 1 }}
              </el-tag>
              <span v-else>{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="points" label="积分" />
        </el-table>
      </el-card>

      <el-card>
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>积分记录</span>
            <el-select v-model="filterType" placeholder="筛选类型" clearable size="small" style="width: 120px;">
              <el-option label="学习积分" value="study" />
              <el-option label="考试积分" value="exam" />
            </el-select>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item v-for="record in filteredRecords" :key="record.id" :timestamp="record.createTime" placement="top">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <el-tag :type="record.type === 'study' ? 'success' : 'primary'" size="small" style="margin-right: 8px;">
                  {{ record.type === 'study' ? '学习' : '考试' }}
                </el-tag>
                <span>{{ record.description }}</span>
              </div>
              <span style="color: #67C23A; font-weight: bold; font-size: 16px;">+{{ record.points }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { userPoints, pointsRecords, users } from '@/data/mockData'

const userStore = useUserStore()
const filterType = ref('')

const userPointsInfo = computed(() => {
  const userId = userStore.user?.id
  return userPoints.find(p => p.userId === userId) || { points: 0, totalPoints: 0, learningDays: 0 }
})

const myRecords = computed(() => {
  const userId = userStore.user?.id
  return pointsRecords.filter(r => r.userId === userId)
})

const filteredRecords = computed(() => {
  if (!filterType.value) return myRecords.value
  return myRecords.value.filter(r => r.type === filterType.value)
})

const rankingList = computed(() => {
  const employees = users.filter(u => u.role === 'employee')
  return employees.map(emp => {
    const pointsInfo = userPoints.find(p => p.userId === emp.id) || { points: 0 }
    return {
      ...emp,
      points: pointsInfo.points
    }
  }).sort((a, b) => b.points - a.points)
})

const myRank = computed(() => {
  const userId = userStore.user?.id
  return rankingList.value.findIndex(r => r.id === userId) + 1
})

const topRanking = computed(() => rankingList.value.slice(0, 5))
</script>

<style scoped>
.points-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.points-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.points-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.points-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}
</style>
