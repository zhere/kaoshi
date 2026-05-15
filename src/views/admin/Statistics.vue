<template>
  <div class="page-card">
    <div class="page-title">统计分析</div>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="答题概览" name="overview">
        <div style="margin-bottom: 20px; display: flex; gap: 10px;">
          <el-select v-model="overviewFilterCategory" placeholder="考试类目" clearable style="width: 150px;">
            <el-option label="全部类目" value="" />
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
          <el-select v-model="overviewFilterExam" placeholder="选择考试" clearable style="width: 250px;">
            <el-option label="全部考试" value="" />
            <el-option v-for="exam in filteredExamsByCategory(overviewFilterCategory)" :key="exam.id" :label="exam.name" :value="exam.id" />
          </el-select>
        </div>
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalExams }}</div>
              <div class="stat-label">考试总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalRecords }}</div>
              <div class="stat-label">答题记录</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ stats.averageScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ stats.passRate }}%</div>
              <div class="stat-label">通过率</div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-title">部门答题情况对比</div>
              <div ref="departmentChartRef" style="height: 300px;"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-title">月度考试趋势</div>
              <div ref="monthlyChartRef" style="height: 300px;"></div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
      
      <el-tab-pane label="成绩统计" name="scores">
        <div style="margin-bottom: 20px; display: flex; gap: 10px;">
          <el-select v-model="scoreFilterCategory" placeholder="考试类目" clearable style="width: 150px;">
            <el-option label="全部类目" value="" />
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
          <el-select v-model="selectedExam" placeholder="选择考试" style="width: 250px;">
            <el-option v-for="exam in filteredExamsByCategory(scoreFilterCategory)" :key="exam.id" :label="exam.name" :value="exam.id" />
          </el-select>
        </div>
        
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ examScoreStats.participants }}</div>
              <div class="stat-label">参与人数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ examScoreStats.passRate }}%</div>
              <div class="stat-label">及格率</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ examScoreStats.excellentRate }}%</div>
              <div class="stat-label">优秀率</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ examScoreStats.averageScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-title">分数段分布</div>
              <div ref="scoreDistributionRef" style="height: 300px;"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-title">成绩排名TOP10</div>
              <el-table :data="topScores" border stripe max-height="300">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="department" label="部门" />
                <el-table-column prop="score" label="得分" width="80">
                  <template #default="{ row }">
                    <span style="color: #67C23A; font-weight: bold;">{{ row.score }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="time" label="用时" width="100" />
              </el-table>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
      
      <el-tab-pane label="错题分析" name="errors">
        <div style="margin-bottom: 20px; display: flex; gap: 10px;">
          <el-select v-model="errorFilterCategory" placeholder="考试类目" clearable style="width: 150px;">
            <el-option label="全部类目" value="" />
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
          <el-select v-model="selectedExamErrors" placeholder="选择考试" clearable style="width: 250px;">
            <el-option label="全部考试" value="" />
            <el-option v-for="exam in filteredExamsByCategory(errorFilterCategory)" :key="exam.id" :label="exam.name" :value="exam.id" />
          </el-select>
        </div>
        <div class="chart-container">
          <div class="chart-title">错题分布TOP10</div>
          <el-table :data="wrongQuestions" border stripe>
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="wrongCount" label="错误次数" width="100" />
            <el-table-column prop="wrongRate" label="错误率" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.wrongRate" :stroke-width="10" :show-text="false" />
                <span>{{ row.wrongRate }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewQuestionDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="部门统计" name="department">
        <div style="margin-bottom: 20px; display: flex; gap: 10px;">
          <el-select v-model="deptStatDepartment" placeholder="选择部门" clearable style="width: 150px;">
            <el-option label="全部部门" value="" />
            <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
          </el-select>
          <el-select v-model="deptStatCategory" placeholder="考试类目" clearable style="width: 150px;">
            <el-option label="全部类目" value="" />
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
          <el-select v-model="deptStatExam" placeholder="选择考试" clearable style="width: 250px;">
            <el-option label="全部考试" value="" />
            <el-option v-for="exam in filteredExamsByCategory(deptStatCategory)" :key="exam.id" :label="exam.name" :value="exam.id" />
          </el-select>
        </div>
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ deptStats.examCount }}</div>
              <div class="stat-label">考试次数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ deptStats.userCount }}</div>
              <div class="stat-label">参与人数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ deptStats.averageScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ deptStats.passRate }}%</div>
              <div class="stat-label">通过率</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-title">部门成绩趋势</div>
              <div ref="deptTrendChartRef" style="height: 300px;"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-title">部门答题统计</div>
              <el-table :data="deptDetailList" border stripe max-height="300">
                <el-table-column prop="department" label="部门" />
                <el-table-column prop="examCount" label="考试次数" width="100" />
                <el-table-column prop="userCount" label="参与人数" width="100" />
                <el-table-column prop="averageScore" label="平均分" width="80" />
                <el-table-column prop="passRate" label="通过率" width="80">
                  <template #default="{ row }">
                    <span style="color: #67C23A; font-weight: bold;">{{ row.passRate }}%</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
      
      <el-tab-pane label="个人详情" name="personal">
        <div style="margin-bottom: 20px; display: flex; gap: 10px;">
          <el-select v-model="personalFilterDepartment" placeholder="选择部门" clearable style="width: 150px;">
            <el-option label="全部部门" value="" />
            <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
          </el-select>
          <el-select v-model="selectedUser" placeholder="选择员工" style="width: 200px;">
            <el-option v-for="u in filteredUsersByDepartment(personalFilterDepartment)" :key="u.id" :label="u.name + ' (' + u.department + ')'" :value="u.id" />
          </el-select>
        </div>
        
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ personalStats.totalExams }}</div>
              <div class="stat-label">参与考试</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ personalStats.averageScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ personalStats.passRate }}%</div>
              <div class="stat-label">通过率</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ personalStats.studyHours }}</div>
              <div class="stat-label">学习时长(h)</div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-title">成绩趋势</div>
              <div ref="personalTrendRef" style="height: 300px;"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-title">答题记录</div>
              <el-table :data="userRecords" border stripe max-height="300">
                <el-table-column prop="examName" label="考试名称" show-overflow-tooltip />
                <el-table-column prop="score" label="得分" width="80" />
                <el-table-column prop="isPass" label="结果" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.isPass ? 'success' : 'danger'" size="small">
                      {{ row.isPass ? '通过' : '未通过' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="submitTime" label="提交时间" width="160" />
              </el-table>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { statistics as mockStats, examRecords as mockRecords, exams as mockExams, users as mockUsers, categories as mockCategories } from '@/data/mockData'

const activeTab = ref('overview')

// ===== 类目 + 考试筛选（答题概览） =====
const overviewFilterCategory = ref('')
const overviewFilterExam = ref('')

// ===== 类目 + 考试筛选（成绩统计） =====
const scoreFilterCategory = ref('')
const selectedExam = ref('')

// ===== 类目 + 考试筛选（错题分析） =====
const errorFilterCategory = ref('')
const selectedExamErrors = ref('')

// ===== 部门统计（部门Tab） =====
const deptStatDepartment = ref('')
const deptStatCategory = ref('')
const deptStatExam = ref('')

// ===== 个人详情（个人详情右侧） =====
const personalFilterDepartment = ref('')
const selectedUser = ref('')

const departmentChartRef = ref(null)
const monthlyChartRef = ref(null)
const scoreDistributionRef = ref(null)
const personalTrendRef = ref(null)
const deptTrendChartRef = ref(null)

const stats = ref({ ...mockStats })
const wrongQuestions = ref(mockStats.wrongQuestionStats)
const userRecords = ref([])

const categories = computed(() => mockCategories)

const departments = computed(() => {
  const deptSet = new Set(mockUsers.filter(u => u.role === 'employee').map(u => u.department))
  return [...deptSet]
})

const filteredExamsByCategory = (categoryId) => {
  if (!categoryId) return mockExams
  return mockExams.filter(e => e.category === categoryId)
}

const filteredUsersByDepartment = (department) => {
  const employees = mockUsers.filter(u => u.role === 'employee')
  if (!department) return employees
  return employees.filter(u => u.department === department)
}

const examScoreStats = ref({
  participants: 45,
  passRate: 82,
  excellentRate: 35,
  averageScore: 76
})

const topScores = ref([
  { name: '张三', department: '技术部', score: 98, time: '25分钟' },
  { name: '李四', department: '运维部', score: 95, time: '28分钟' },
  { name: '王五', department: '运维部', score: 92, time: '30分钟' },
  { name: '赵六', department: '检修部', score: 90, time: '32分钟' },
  { name: '钱七', department: '运维部', score: 88, time: '35分钟' }
])

const personalStats = ref({
  totalExams: 12,
  averageScore: 82,
  passRate: 83,
  studyHours: 45
})

const deptStats = ref({
  examCount: 8,
  userCount: 15,
  averageScore: 78,
  passRate: 85
})

const deptDetailList = ref([
  { department: '运维部', examCount: 3, userCount: 15, averageScore: 78, passRate: 85 },
  { department: '检修部', examCount: 2, userCount: 10, averageScore: 72, passRate: 75 },
  { department: '安全部', examCount: 2, userCount: 8, averageScore: 82, passRate: 90 },
  { department: '培训部', examCount: 1, userCount: 5, averageScore: 75, passRate: 80 }
])

const initDepartmentChart = () => {
  const chart = echarts.init(departmentChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['参与人数', '平均分', '通过率']
    },
    xAxis: {
      type: 'category',
      data: mockStats.departmentStats.map(d => d.name)
    },
    yAxis: [
      { type: 'value', name: '人数/分数' },
      { type: 'value', name: '通过率(%)', max: 100 }
    ],
    series: [
      {
        name: '参与人数',
        type: 'bar',
        data: mockStats.departmentStats.map(d => d.count),
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '平均分',
        type: 'bar',
        data: mockStats.departmentStats.map(d => d.averageScore),
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '通过率',
        type: 'line',
        yAxisIndex: 1,
        data: mockStats.departmentStats.map(d => d.passRate),
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

const initMonthlyChart = () => {
  const chart = echarts.init(monthlyChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['考试次数', '参与人数', '平均分']
    },
    xAxis: {
      type: 'category',
      data: mockStats.monthlyStats.map(d => d.month)
    },
    yAxis: [
      { type: 'value', name: '次数/人数' },
      { type: 'value', name: '平均分', max: 100 }
    ],
    series: [
      {
        name: '考试次数',
        type: 'line',
        data: mockStats.monthlyStats.map(d => d.examCount),
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '参与人数',
        type: 'line',
        data: mockStats.monthlyStats.map(d => d.userCount),
        smooth: true,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '平均分',
        type: 'line',
        yAxisIndex: 1,
        data: mockStats.monthlyStats.map(d => d.averageScore),
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

const initScoreDistributionChart = () => {
  if (!scoreDistributionRef.value) return
  const chart = echarts.init(scoreDistributionRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '分数段',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 5, name: '0-59分' },
          { value: 10, name: '60-69分' },
          { value: 15, name: '70-79分' },
          { value: 12, name: '80-89分' },
          { value: 8, name: '90-100分' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

const initPersonalTrendChart = () => {
  if (!personalTrendRef.value) return
  const chart = echarts.init(personalTrendRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      max: 100
    },
    series: [
      {
        data: [75, 78, 82, 80, 85, 88],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.2)'
        }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

const initDeptTrendChart = () => {
  if (!deptTrendChartRef.value) return
  const chart = echarts.init(deptTrendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      max: 100
    },
    series: [
      {
        data: [72, 75, 78, 76, 80, 82],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#67C23A' },
        areaStyle: {
          color: 'rgba(103, 194, 58, 0.2)'
        }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

const loadUserRecords = () => {
  const records = mockRecords.filter(r => r.userId === parseInt(selectedUser.value))
  userRecords.value = records.map(r => {
    const exam = mockExams.find(e => e.id === r.examId)
    return {
      examName: exam ? exam.name : '未知考试',
      score: r.score,
      isPass: r.isPass,
      submitTime: r.submitTime
    }
  })
}

const viewQuestionDetail = (row) => {
  console.log('查看题目详情', row)
}

watch(selectedUser, () => {
  loadUserRecords()
})

watch(selectedExam, () => {
  if (activeTab.value === 'scores') {
    initScoreDistributionChart()
  }
})

watch(overviewFilterExam, () => {
  if (overviewFilterExam.value) {
    stats.value = {
      totalExams: 1,
      totalRecords: 45,
      averageScore: 78,
      passRate: 85,
      departmentStats: mockStats.departmentStats,
      monthlyStats: mockStats.monthlyStats,
      wrongQuestionStats: mockStats.wrongQuestionStats
    }
  } else {
    stats.value = { ...mockStats }
  }
})

watch(selectedExamErrors, () => {
  if (selectedExamErrors.value) {
    wrongQuestions.value = mockStats.wrongQuestionStats.slice(0, 5)
  } else {
    wrongQuestions.value = mockStats.wrongQuestionStats
  }
})

watch(activeTab, (newVal) => {
  if (newVal === 'scores') {
    setTimeout(() => initScoreDistributionChart(), 100)
  } else if (newVal === 'personal') {
    setTimeout(() => initPersonalTrendChart(), 100)
  } else if (newVal === 'department') {
    setTimeout(() => initDeptTrendChart(), 100)
  }
})

onMounted(() => {
  initDepartmentChart()
  initMonthlyChart()
  loadUserRecords()
})
</script>

<style scoped>
.page-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 15px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}
</style>