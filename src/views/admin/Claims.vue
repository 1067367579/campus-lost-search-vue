<template>
  <div class="admin-claims-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>认领申请管理</h3>
          <el-radio-group v-model="searchForm.status" @change="handleSearch">
            <el-radio-button :label="">全部</el-radio-button>
            <el-radio-button :label="0">待处理</el-radio-button>
            <el-radio-button :label="1">已通过</el-radio-button>
            <el-radio-button :label="2">已拒绝</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 认领列表 -->
      <el-table
        v-loading="loading"
        :data="claimList"
        style="width: 100%"
      >
        <el-table-column label="申请人" width="120">
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
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              @click="handleProcess(row, 1)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              @click="handleProcess(row, 2)"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              link
              @click="handleBlacklist(row)"
            >
              加入黑名单
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

    <!-- 加入黑名单对话框 -->
    <el-dialog
      v-model="blacklistVisible"
      title="加入黑名单"
      width="500px"
    >
      <el-form
        ref="blacklistFormRef"
        :model="blacklistForm"
        :rules="blacklistRules"
        label-width="80px"
      >
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="blacklistForm.type">
            <el-radio :label="0">冒领</el-radio>
            <el-radio :label="1">多次违规</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="原因" prop="reason">
          <el-input
            v-model="blacklistForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入加入黑名单的原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="blacklistVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBlacklist">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const adminStore = useAdminStore()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const claimList = ref([])
const blacklistVisible = ref(false)
const blacklistFormRef = ref(null)
const currentUser = ref(null)

const searchForm = reactive({
  status: '',
  pageNum: 1,
  pageSize: 10
})

const blacklistForm = reactive({
  type: 0,
  reason: ''
})

const blacklistRules = {
  reason: [
    { required: true, message: '请输入原因', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 ��� 500 个字符', trigger: 'blur' }
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
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('admin/claims', { params })
    claimList.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取认领列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchClaims()
}

const handleProcess = async (row, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === 1 ? '通过' : '拒绝'}该认领申请吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: status === 1 ? 'success' : 'warning'
      }
    )
    
    await request.put(`admin/claims/${row.claimId}`, { status })
    ElMessage.success('处理成功')
    fetchClaims()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '处理失败')
    }
  }
}

const handleBlacklist = (row) => {
  currentUser.value = row.userId
  blacklistVisible.value = true
}

const submitBlacklist = async () => {
  if (!blacklistFormRef.value) return
  
  await blacklistFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await adminStore.addToBlacklist({
          userId: currentUser.value,
          ...blacklistForm
        })
        ElMessage.success('已将用户加入黑名单')
        blacklistVisible.value = false
        blacklistFormRef.value.resetFields()
        fetchClaims()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchClaims()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchClaims()
}
</script>

<style scoped>
.admin-claims-container {
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