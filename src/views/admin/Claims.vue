<template>
  <div class="admin-claims-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>认领申请管理</h3>
          <div class="header-right">
            <!-- 申请类型筛选 -->
            <el-radio-group v-model="searchForm.claimType" @change="handleSearch">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="claim">认领申请</el-radio-button>
              <el-radio-button label="return">还回申请</el-radio-button>
            </el-radio-group>
            <!-- 状态筛选 -->
            <el-radio-group v-model="searchForm.status" @change="handleSearch">
              <el-radio-button :label="null">全部</el-radio-button>
              <el-radio-button :label="0">待处理</el-radio-button>
              <el-radio-button :label="1">已通过</el-radio-button>
              <el-radio-button :label="2">已拒绝</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 认领列表 -->
      <el-table v-loading="loading" :data="claimList" style="width: 100%">
        <el-table-column label="申请人" width="120">
          <template #default="{ row }">
            <span>{{ row.username }}</span>
          </template>
        </el-table-column>

        <el-table-column label="物品名称" min-width="120">
          <template #default="{ row }">
            {{ row.itemName }}
          </template>
        </el-table-column>

        <el-table-column label="申请类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.claimType === 'claim' ? 'primary' : 'success'">
              {{ row.claimType === 'claim' ? '认领' : '还回' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="申请时间" width="180" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">
              查看详情
            </el-button>
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

    <!-- 处理对话框 -->
    <el-dialog v-model="processVisible" :title="processTitle" width="500px">
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="80px">
        <el-form-item label="处理备注" prop="remark">
          <el-input
            v-model="processForm.remark"
            type="textarea"
            :rows="4"
            :placeholder="processForm.status === 1 ? '请输入通过原因' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button :type="processForm.status === 1 ? 'success' : 'danger'" @click="submitProcess">
          确定{{ processForm.status === 1 ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 加入黑名单对话框 -->
    <el-dialog v-model="blacklistVisible" title="加入黑名单" width="500px">
      <el-form ref="blacklistFormRef" :model="blacklistForm" :rules="blacklistRules" label-width="80px">
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
        <el-button type="danger" @click="submitBlacklist">确定</el-button>
      </template>
    </el-dialog>

    <!-- 申请详情对话框 -->
    <el-dialog v-model="detailVisible" title="申请详情" width="800px">
      <template v-if="currentClaim">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请人">{{ currentClaim.username }}</el-descriptions-item>
          <el-descriptions-item label="申请类型">
            <el-tag :type="currentClaim.claimType === 'claim' ? 'primary' : 'success'">
              {{ currentClaim.claimType === 'claim' ? '认领申请' : '还回申请' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentClaim.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentClaim.status)">
              {{ getStatusText(currentClaim.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理时间" v-if="currentClaim.handleTime">
            {{ currentClaim.handleTime }}
          </el-descriptions-item>
          <el-descriptions-item label="处理备注" v-if="currentClaim.handleRemark">
            {{ currentClaim.handleRemark }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>物品信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物品名称">{{ currentClaim.itemName }}</el-descriptions-item>
            <el-descriptions-item label="物品类型">
              {{ currentClaim.itemType === 0 ? '丢失物品' : '拾取物品' }}
            </el-descriptions-item>
            <el-descriptions-item label="物品类别">{{ currentClaim.categoryName }}</el-descriptions-item>
            <el-descriptions-item label="地点">{{ currentClaim.location }}</el-descriptions-item>
            <el-descriptions-item :label="currentClaim.itemType === 0 ? '丢失时间' : '拾取时间'">
              {{ currentClaim.itemType === 0 ? currentClaim.lostTime : currentClaim.foundTime }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 物品图片 -->
          <div class="images-section" v-if="currentClaim.images?.length">
            <h4>物品图片</h4>
            <div class="images-container">
              <el-image
                v-for="url in currentClaim.images"
                :key="url"
                :src="url"
                :preview-src-list="currentClaim.images"
                fit="cover"
                style="width: 100px; height: 100px; margin-right: 10px; margin-bottom: 10px;"
              />
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>申请说明</h4>
          <p>{{ currentClaim.description }}</p>
        </div>

        <!-- 证明材料 -->
        <div class="detail-section" v-if="currentClaim.evidence">
          <h4>证明材料</h4>
          <el-image
            :src="currentClaim.evidence"
            :preview-src-list="[currentClaim.evidence]"
            fit="contain"
            style="max-width: 100%; max-height: 400px;"
          />
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/admin'
import request from '@/utils/request'

const adminStore = useAdminStore()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const claimList = ref([])

// 详情对话框相关
const detailVisible = ref(false)
const currentClaim = ref(null)

// 处理对话框相关
const processVisible = ref(false)
const processFormRef = ref(null)
const processForm = reactive({
  status: 0,
  remark: ''
})

const processRules = {
  remark: [
    { required: true, message: '请输入处理备注', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ]
}

// 搜索表单
const searchForm = reactive({
  claimType: '',  // 认领类型：claim 或 return
  status: null,   // 状态：0待处理，1已通过，2已拒绝
  pageNum: 1,
  pageSize: 10
})

// 获取认领列表
const fetchClaims = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('admin/claims', { params })
    claimList.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取认领列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const showDetail = async (row) => {
  try {
    const data = await request.get(`claim/${row.claimId}`)
    currentClaim.value = data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取申请详情失败')
  }
}

// 处理申请
const handleProcess = async (row, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === 1 ? '通过' : '拒绝'}该申请吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: status === 1 ? 'success' : 'warning'
      }
    )
    
    processForm.status = status
    processForm.remark = ''
    currentClaim.value = row
    processVisible.value = true
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 提交处理结果
const submitProcess = async () => {
  if (!processFormRef.value) return
  
  await processFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.put(`admin/claims/${currentClaim.value.claimId}/status`, {
          status: processForm.status,
          remark: processForm.remark
        })
        ElMessage.success('处理成功')
        processVisible.value = false
        fetchClaims()
      } catch (error) {
        ElMessage.error(error.message || '处理失败')
      }
    }
  })
}

// 状态显示相关
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0: return '待处理'
    case 1: return '已通过'
    case 2: return '已拒绝'
    default: return '未知'
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchClaims()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchClaims()
}

// 搜索相关
const handleSearch = () => {
  currentPage.value = 1
  fetchClaims()
}

onMounted(() => {
  fetchClaims()
})
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

.header-right {
  display: flex;
  gap: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 