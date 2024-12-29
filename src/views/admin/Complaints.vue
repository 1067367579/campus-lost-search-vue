<template>
  <div class="admin-complaints-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>投诉管理</h3>
          <el-radio-group v-model="searchForm.status" @change="handleSearch">
            <el-radio-button :label="">全部</el-radio-button>
            <el-radio-button :label="0">待处理</el-radio-button>
            <el-radio-button :label="1">已处理</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="complaintList"
        style="width: 100%"
      >
        <el-table-column label="投诉人" width="120">
          <template #default="{ row }">
            <el-tooltip
              effect="dark"
              :content="`ID: ${row.userId}`"
              placement="top"
            >
              <span>{{ row.username }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

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
        
        <el-table-column prop="createTime" label="投诉时间" width="180" />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="primary"
              link
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-button
              v-else
              type="info"
              link
              @click="showFeedback(row)"
            >
              查看结果
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

    <!-- 处理投诉对话框 -->
    <el-dialog
      v-model="processVisible"
      title="处理投诉"
      width="500px"
    >
      <el-form
        ref="processFormRef"
        :model="processForm"
        :rules="processRules"
        label-width="80px"
      >
        <el-form-item label="处理意见" prop="adminFeedback">
          <el-input
            v-model="processForm.adminFeedback"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const complaintList = ref([])
const processVisible = ref(false)
const processFormRef = ref(null)
const currentComplaint = ref(null)

const searchForm = reactive({
  status: '',
  pageNum: 1,
  pageSize: 10
})

const processForm = reactive({
  adminFeedback: ''
})

const processRules = {
  adminFeedback: [
    { required: true, message: '请输入处理意见', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchComplaints()
})

const fetchComplaints = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('admin/complaints', { params })
    complaintList.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取投诉列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchComplaints()
}

const handleProcess = (row) => {
  currentComplaint.value = row
  processVisible.value = true
}

const submitProcess = async () => {
  if (!processFormRef.value) return
  
  await processFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.put(`complaint/${currentComplaint.value.complaintId}`, processForm)
        ElMessage.success('处理成功')
        processVisible.value = false
        processFormRef.value.resetFields()
        fetchComplaints()
      } catch (error) {
        ElMessage.error(error.message || '处理失败')
      }
    }
  })
}

const showFeedback = (row) => {
  ElMessageBox.alert(row.adminFeedback, '处理结果', {
    confirmButtonText: '确定'
  })
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
.admin-complaints-container {
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