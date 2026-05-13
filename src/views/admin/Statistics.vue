<template>
  <div class="page-card">
    <div class="page-title">统计分析</div>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="答题概览" name="overview">
        <div style="margin-bottom: 20px; display: flex; gap: 10px;">
          <el-select v-model="selectedExamOverview" placeholder="选择考试" clearable style="width: 250px;">
            <el-option label="全部考试" value="" />
            <el-option label="安全生产知识考试" value="1" />
            <el-option label="设备操作规程考试" value="2" />
            <el-option label="应急处理能力测试" value="3" />
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
          <el-select v-model="selectedExam" placeholder="选择考试" style="width: 250px;">
            <el-option label="安全生产知识考试" value="1" />
            <el-option label="设备操作规程考试" value="2" />
            <el-option label="应急处理能力测试" value="3" />
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
          <el-select v-model="selectedExamErrors" placeholder="选择考试" clearable style="width: 250px;">
            <el-option label="全部考试" value="" />
            <el-option label="安全生产知识考试" value="1" />
            <el-option label="设备操作规程考试" value="2" />
            <el-option label="应急处理能力测试" value="3" />
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
      
      <el-tab-pane label="个人详情" name="personal">
        <div style="margin-bottom: 20px;">
          <el-select v-model="selectedUser" placeholder="选择员工" style="width: 250px;">
            <el-option label="王五 (运维部)" value="4" />
            <el-option label="赵六 (检修部)" value="5" />
            <el-option label="钱七 (运维部)" value="6" />
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
                <el-table-column prop="examName" label="考试名称" />
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
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { statistics as mockStats, examRecords as mockRecords, exams as mockExams } from '@/data/mockData'

const activeTab = ref('overview')
const selectedExamOverview = ref('')
const selectedExamErrors = ref('')
const selectedExam = ref('1')
const selectedUser = ref('4')
const departmentChartRef = ref(null)
const monthlyChartRef = ref(null)
const scoreDistributionRef = ref(null)
const personalTrendRef = ref(null)
const stats = ref({ ...mockStats })
const wrongQuestions = ref(mockStats.wrongQuestionStats)
const userRecords = ref([])

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

watch(selectedExamOverview, () => {
  if (selectedExamOverview.value) {
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
  }
})

onMounted(() => {
  initDepartmentChart()
  initMonthlyChart()
  loadUserRecords()
})
</script>
