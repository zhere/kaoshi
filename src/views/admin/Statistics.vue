<template>
  <div class="page-card">
    <div class="page-title">统计分析</div>
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

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div class="chart-container">
          <div class="chart-title">错题分布TOP10</div>
          <el-table :data="wrongQuestions" border stripe max-height="300">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
            <el-table-column prop="wrongCount" label="错误次数" width="100" />
            <el-table-column prop="wrongRate" label="错误率" width="100">
              <template #default="{ row }">
                <el-progress :percentage="row.wrongRate" :stroke-width="10" :show-text="false" />
                <span>{{ row.wrongRate }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-container">
          <div class="chart-title">个人答题详情</div>
          <el-select v-model="selectedUser" placeholder="选择员工" style="width: 100%; margin-bottom: 15px;">
            <el-option label="王五 (运维部)" value="4" />
            <el-option label="赵六 (检修部)" value="5" />
            <el-option label="钱七 (运维部)" value="6" />
          </el-select>
          <el-table :data="userRecords" border stripe max-height="250">
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { statistics as mockStats, examRecords as mockRecords, exams as mockExams } from '@/data/mockData'

const departmentChartRef = ref(null)
const monthlyChartRef = ref(null)
const stats = ref({ ...mockStats })
const wrongQuestions = ref(mockStats.wrongQuestionStats)
const selectedUser = ref('4')
const userRecords = ref([])

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

watch(selectedUser, () => {
  loadUserRecords()
})

onMounted(() => {
  initDepartmentChart()
  initMonthlyChart()
  loadUserRecords()
})
</script>
