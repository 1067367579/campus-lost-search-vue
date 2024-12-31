<template>
  <div class="my-complaints-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>我的投诉</h3>
          <el-radio-group v-model="searchForm.status" @change="handleSearch">
            <el-radio-button :label="null">全部</el-radio-button>
            <el-radio-button :label="0">待处理</el-radio-button>
            <el-radio-button :label="1">已处理</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 投诉列表 -->
      <el-table v-loading="loading" :data="complaintList" style="width: 100%">
        <el-table-column label="认领信息" min-width="200">
          <template #default="{ row }">
            <div>
              <p><strong>物品名称：</strong>{{ row.claimInfo.itemName }}</p>
              <p><strong>申请类型：</strong>{{ row.claimInfo.claimType === 'claim' ? '认领申请' : '还回申请' }}</p>
              <p><strong>申请时间：</strong>{{ row.claimInfo.createTime }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="投诉原因" min-width="200" show-overflow-tooltip />

        <el-table-column prop="createTime" label="投诉时间" width="180" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'">
              {{ row.status === 0 ? '待处理' : '已处理' }}
            </el-tag>
          </template>
        </el-table-column>
        
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

    <!-- 投诉详情对话框 -->
    <el-dialog v-model="detailVisible" title="投诉详情" width="600px">
      <template v-if="currentComplaint">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="投诉时间">{{ currentComplaint.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentComplaint.status === 0 ? 'warning' : 'success'">
              {{ currentComplaint.status === 0 ? '待处理' : '已处理' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>认领申请信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物品名称">{{ currentComplaint.claimInfo.itemName }}</el-descriptions-item>
            <el-descriptions-item label="申请类型">
              {{ currentComplaint.claimInfo.claimType === 'claim' ? '认领申请' : '还回申请' }}
            </el-descriptions-item>
            <el-descriptions-item label="申请人">{{ currentComplaint.claimInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentComplaint.claimInfo.createTime }}</el-descriptions-item>
            <el-descriptions-item label="申请说明">{{ currentComplaint.claimInfo.description }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>投诉原因</h4>
          <p>{{ currentComplaint.reason }}</p>
        </div>

        <div class="detail-section" v-if="currentComplaint.adminFeedback">
          <h4>处理意见</h4>
          <p>{{ currentComplaint.adminFeedback }}</p>
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
const complaintList = ref([])

// 详情对话框相关
const detailVisible = ref(false)
const currentComplaint = ref(null)

// 搜索表单
const searchForm = reactive({
  status: null,   // 状态：0待处理，1已处理
  pageNum: 1,
  pageSize: 10
})

// 获取投诉列表
const fetchComplaints = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('complaint/my-list', { params })
    complaintList.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取投诉列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const showDetail = (row) => {
  currentComplaint.value = row
  detailVisible.value = true
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchComplaints()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchComplaints()
}

// 搜索相关
const handleSearch = () => {
  currentPage.value = 1
  fetchComplaints()
}

onMounted(() => {
  fetchComplaints()
})
</script>

<style scoped>
.my-complaints-container {
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
</style> 