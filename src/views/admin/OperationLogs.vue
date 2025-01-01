<template>
  <div class="operation-logs-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>操作日志</h3>
          <div class="search-form">
            <!-- 操作类型筛选 -->
            <el-select
              v-model="searchForm.operationType"
              placeholder="操作类型"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <el-option label="处理认领" value="处理认领" />
              <el-option label="处理投诉" value="处理投诉" />
              <el-option label="管理黑名单" value="管理黑名单" />
              <el-option label="管理类别" value="管理类别" />
            </el-select>

            <!-- 时间范围选择 -->
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              :default-time="[
                new Date(2000, 1, 1, 0, 0, 0),
                new Date(2000, 1, 1, 23, 59, 59)
              ]"
              @change="handleDateRangeChange"
            />
          </div>
        </div>
      </template>

      <!-- 日志列表 -->
      <el-table v-loading="loading" :data="logList" style="width: 100%">
        <el-table-column label="操作人" prop="username" width="120" />
        
        <el-table-column label="操作类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTag(row.operationType)">
              {{ getOperationTypeText(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column 
          label="操作内容" 
          prop="operationContent" 
          min-width="400" 
          show-overflow-tooltip 
        />
        
        <el-table-column label="操作时间" prop="createTime" width="180" />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="操作详情" width="600px">
      <template v-if="currentLog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作人">{{ currentLog.username }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationTypeTag(currentLog.operationType)">
              {{ getOperationTypeText(currentLog.operationType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ currentLog.createTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>操作内容</h4>
          <p>{{ currentLog.operationContent }}</p>
        </div>

        <!-- 相关数据展示 -->
        <div class="detail-section" v-if="currentLog.relatedData">
          <h4>相关数据</h4>
          <pre class="json-content">{{ formatJson(currentLog.relatedData) }}</pre>
        </div>
      </template>
    </el-dialog>
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
const logList = ref([])
const dateRange = ref([])

// 详情对话框相关
const detailVisible = ref(false)
const currentLog = ref(null)

// 搜索表单
const searchForm = reactive({
  operationType: '',
  startTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10
})

// 获取日志列表
const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('admin/operation-logs', { params })
    logList.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取日志列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const showDetail = (row) => {
  currentLog.value = row
  detailVisible.value = true
}

// 操作类型相关
const getOperationTypeTag = (type) => {
  const map = {
    'CLAIM_PROCESS': 'primary',
    'COMPLAINT_PROCESS': 'warning',
    'BLACKLIST_MANAGE': 'danger',
    'CATEGORY_MANAGE': 'success'
  }
  return map[type] || 'info'
}

const getOperationTypeText = (type) => {
  const map = {
    'CLAIM_PROCESS': '认领处理',
    'COMPLAINT_PROCESS': '投诉处理',
    'BLACKLIST_MANAGE': '黑名单管理',
    'CATEGORY_MANAGE': '类别管理'
  }
  return map[type] || type
}

// 日期范围变化
const handleDateRangeChange = (val) => {
  if (val) {
    // 确保时间格式符合 ISO 8601 标准
    searchForm.startTime = val[0]
    searchForm.endTime = val[1]
  } else {
    searchForm.startTime = ''
    searchForm.endTime = ''
  }
  handleSearch()
}

// JSON格式化
const formatJson = (json) => {
  try {
    return JSON.stringify(JSON.parse(json), null, 2)
  } catch (e) {
    return json
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchLogs()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchLogs()
}

// 搜索相关
const handleSearch = () => {
  currentPage.value = 1
  fetchLogs()
}

onMounted(() => {
  fetchLogs()
})
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

.search-form {
  display: flex;
  gap: 16px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.detail-section {
  margin-top: 20px;

  h4 {
    margin-bottom: 10px;
    color: #606266;
    font-weight: bold;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
}

.json-content {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style> 