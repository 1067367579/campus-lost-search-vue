<template>
  <div class="claims-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>我的认领申请</h3>
        </div>
      </template>

      <!-- 认领列表 -->
      <el-table
        v-loading="loading"
        :data="claimList"
        style="width: 100%"
      >
        <el-table-column label="物品信息" min-width="200">
          <template #default="{ row }">
            <div>
              <p><strong>名称：</strong>{{ row.itemInfo.itemName }}</p>
              <p><strong>类型：</strong>{{ row.itemInfo.itemType === 0 ? '丢失物品' : '拾取物品' }}</p>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="认领说明" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="申请时间" width="180" />
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 2" 
              type="primary"
              link
              @click="handleComplaint(row)"
            >
              投诉
            </el-button>
            <el-button
              type="primary"
              link
              @click="showDetail(row)"
            >
              详情
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

    <!-- 投诉对话框 -->
    <el-dialog
      v-model="complaintVisible"
      title="提交投诉"
      width="500px"
    >
      <el-form
        ref="complaintFormRef"
        :model="complaintForm"
        :rules="complaintRules"
        label-width="80px"
      >
        <el-form-item label="投诉类型" prop="category">
          <el-select v-model="complaintForm.category" placeholder="请选择投诉类型" style="width: 100%">
            <el-option label="冒领" value="冒领" />
            <el-option label="态度恶劣" value="态度恶劣" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="投诉原因" prop="reason">
          <el-input
            v-model="complaintForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细描述投诉原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="complaintVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComplaint">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useClaimStore } from '@/stores/claim'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const claimStore = useClaimStore()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const claimList = ref([])
const complaintVisible = ref(false)
const complaintFormRef = ref(null)
const currentClaim = ref(null)

const complaintForm = reactive({
  category: '',
  reason: ''
})

const complaintRules = {
  category: [
    { required: true, message: '请选择投诉类型', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入投诉原因', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const getStatusType = (status) => {
  const map = {
    0: 'info',    // 待处理
    1: 'success', // 已通过
    2: 'danger'   // 已拒绝
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    0: '待处理',
    1: '已通过',
    2: '已拒绝'
  }
  return map[status]
}

onMounted(() => {
  fetchClaims()
})

const fetchClaims = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('/api/claim/list', { params })
    claimList.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取认领列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchClaims()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchClaims()
}

const handleComplaint = (row) => {
  currentClaim.value = row
  complaintVisible.value = true
}

const submitComplaint = async () => {
  if (!complaintFormRef.value) return
  
  await complaintFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await claimStore.submitComplaint({
          claimId: currentClaim.value.claimId,
          ...complaintForm
        })
        ElMessage.success('投诉提交成功')
        complaintVisible.value = false
        complaintFormRef.value.resetFields()
      } catch (error) {
        ElMessage.error(error.message || '投诉提交失败')
      }
    }
  })
}

const showDetail = (row) => {
  // TODO: 实现查看详情功能
}
</script>

<style scoped>
.claims-container {
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