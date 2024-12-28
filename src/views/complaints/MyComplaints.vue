<template>
  <div class="complaints-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>我的投诉</h3>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="complaintList"
        style="width: 100%"
      >
        <el-table-column label="认领信息" min-width="200">
          <template #default="{ row }">
            <div>
              <p><strong>物品名称：</strong>{{ row.claimInfo.itemName }}</p>
              <p><strong>认领时间：</strong>{{ row.claimInfo.createTime }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="投诉类型" width="120" />
        
        <el-table-column prop="reason" label="投诉原因" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'">
              {{ row.status === 0 ? '待处理' : '已处理' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="adminFeedback" label="处理结果" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.adminFeedback || '暂无' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="投诉时间" width="180" />
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const complaintList = ref([])

onMounted(() => {
  fetchComplaints()
})

const fetchComplaints = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('/api/complaint/list', { params })
    complaintList.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取投诉列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchComplaints()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchComplaints()
}
</script>

<style scoped>
.complaints-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 