<template>
  <div class="operation-logs-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>操作日志</h3>
          <div class="header-right">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="shortcuts"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="defaultTime"
              @change="handleDateChange"
            />
            <el-button type="primary" @click="handleExport">导出日志</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="logs"
        style="width: 100%"
      >
        <el-table-column prop="logId" label="日志ID" width="120" show-overflow-tooltip />
        <el-table-column prop="adminName" label="操作人" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="150" />
        <el-table-column prop="operationContent" label="操作内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="createTime" label="操作时间" width="180" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const logs = ref([])
const dateRange = ref([])

const defaultTime = [
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59)
]

const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

onMounted(() => {
  fetchLogs()
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1]
    }
    const data = await request.get('/api/admin/operation-logs', { params })
    logs.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取操作日志失败')
  } finally {
    loading.value = false
  }
}

const handleDateChange = () => {
  currentPage.value = 1
  fetchLogs()
}

const handleExport = async () => {
  try {
    const params = {
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1]
    }
    const response = await request.get('/api/admin/operation-logs/export', { 
      params,
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '操作日志.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchLogs()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchLogs()
}
</script>

<style scoped>
.operation-logs-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 