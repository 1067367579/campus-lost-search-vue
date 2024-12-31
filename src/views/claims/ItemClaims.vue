<template>
  <div class="claims-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>物品认领记录</h3>
          <div class="header-right">
            <el-button type="primary" @click="handleClaim" v-if="itemInfo.status === 0">
              申请认领
            </el-button>
          </div>
        </div>
      </template>

      <!-- 物品基本信息 -->
      <div class="item-info">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="物品名称">{{ itemInfo.itemName }}</el-descriptions-item>
          <el-descriptions-item label="物品类别">{{ itemInfo.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="物品状态">
            <el-tag :type="itemInfo.status === 0 ? 'warning' : 'success'">
              {{ itemInfo.status === 0 ? '未认领' : '已认领' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ itemInfo.createTime }}</el-descriptions-item>
          <el-descriptions-item label="拾取地点">{{ itemInfo.location }}</el-descriptions-item>
          <el-descriptions-item label="拾取时间">{{ itemInfo.foundTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="item-images" v-if="itemInfo.images?.length">
          <el-image
            v-for="url in itemInfo.images"
            :key="url"
            :src="url"
            :preview-src-list="itemInfo.images"
            fit="cover"
            style="width: 100px; height: 100px; margin-right: 10px"
          />
        </div>
      </div>

      <!-- 认领记录列表 -->
      <div class="claims-list">
        <h4>认领记录</h4>
        <el-table v-loading="loading" :data="claimList" style="width: 100%">
          <el-table-column label="认领人" prop="username" width="120" />
          <el-table-column label="认领说明" prop="description" min-width="200" show-overflow-tooltip />
          <el-table-column label="认领时间" prop="createTime" width="180" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 1" 
                type="warning" 
                link 
                @click="handleComplaint(row)"
              >
                投诉
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 认领申请对话框 -->
    <el-dialog v-model="claimVisible" title="申请认领" width="500px">
      <el-form ref="claimFormRef" :model="claimForm" :rules="claimRules" label-width="80px">
        <el-form-item label="认领说明" prop="description">
          <el-input
            v-model="claimForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述物品特征，以及能证明您是物品主人的信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="claimVisible = false">取消</el-button>
        <el-button type="primary" @click="submitClaim">提交</el-button>
      </template>
    </el-dialog>

    <!-- 投诉对话框 -->
    <el-dialog v-model="complaintVisible" title="投诉认领" width="500px">
      <el-form ref="complaintFormRef" :model="complaintForm" :rules="complaintRules" label-width="80px">
        <el-form-item label="投诉类型" prop="category">
          <el-select v-model="complaintForm.category" placeholder="请选择投诉类型" style="width: 100%">
            <el-option label="冒充失主" value="冒充失主" />
            <el-option label="提供虚假信息" value="提供虚假信息" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="投诉原因" prop="reason">
          <el-input
            v-model="complaintForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细描述投诉原因，并提供您是真实失主的证明信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="complaintVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComplaint">提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="申请详情" width="600px">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const loading = ref(false)
const itemInfo = ref({})
const claimList = ref([])
const claimVisible = ref(false)
const complaintVisible = ref(false)
const currentClaim = ref(null)

// 表单相关
const claimFormRef = ref(null)
const complaintFormRef = ref(null)
const claimForm = ref({
  description: ''
})
const complaintForm = ref({
  category: '',
  reason: ''
})

// 表单校验规则
const claimRules = {
  description: [
    { required: true, message: '请输入认领说明', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const complaintRules = {
  category: [
    { required: true, message: '请选择投诉类型', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入投诉原因', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 获取物品信息和认领记录
const fetchData = async () => {
  loading.value = true
  try {
    const [itemRes, claimsRes] = await Promise.all([
      request.get(`/item/${route.params.id}`),
      request.get(`/item/${route.params.id}/claims`)
    ])
    itemInfo.value = itemRes
    claimList.value = claimsRes
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 状态相关方法
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

// 处理认领申请
const handleClaim = () => {
  claimVisible.value = true
}

const submitClaim = async () => {
  if (!claimFormRef.value) return
  
  await claimFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('claim', {
          itemId: route.params.id,
          description: claimForm.value.description
        })
        ElMessage.success('申请提交成功')
        claimVisible.value = false
        claimFormRef.value.resetFields()
        fetchData() // 刷新数据
      } catch (error) {
        ElMessage.error(error.message || '申请提交失败')
      }
    }
  })
}

// 处理投诉
const handleComplaint = (row) => {
  currentClaim.value = row
  complaintVisible.value = true
}

const submitComplaint = async () => {
  if (!complaintFormRef.value) return
  
  await complaintFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('complaint', {
          claimId: currentClaim.value.claimId,
          category: complaintForm.value.category,
          reason: complaintForm.value.reason
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

onMounted(() => {
  fetchData()
})
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

.item-info {
  margin-bottom: 20px;
}

.item-images {
  margin-top: 20px;
}

.claims-list {
  margin-top: 30px;
}

h4 {
  margin-bottom: 15px;
  color: #606266;
}
</style> 