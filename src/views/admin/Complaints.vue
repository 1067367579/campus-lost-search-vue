<template>
  <div class="complaints-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>投诉管理</h3>
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="状态">
              <el-select 
                v-model="searchForm.status" 
                placeholder="全部状态" 
                clearable
                @change="handleSearch"
              >
                <el-option label="待处理" :value="0" />
                <el-option label="已处理" :value="1" />
              </el-select>
            </el-form-item>

            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索投诉人/被投诉人"
                clearable
                @input="handleSearch"
                @keyup.enter="handleSearch"
                @clear="handleSearch"
              />
            </el-form-item>

            <el-form-item>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>

      <!-- 投诉列表 -->
      <el-table v-loading="loading" :data="complaintList" style="width: 100%">
        <el-table-column label="投诉人" width="120">
          <template #default="{ row }">
            <span>{{ row.username }}</span>
          </template>
        </el-table-column>

        <el-table-column label="认领信息" min-width="200">
          <template #default="{ row }">
            <div>
              <p><strong>物品名称：</strong>{{ row.itemName }}</p>
              <p><strong>申请类型：</strong>{{ row.claimType === 'claim' ? '认领申请' : '还回申请' }}</p>
              <p><strong>申请时间：</strong>{{ row.createTime }}</p>
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
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="warning"
              link
              @click="handleProcess(row)"
            >
              处理
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
    <el-dialog v-model="detailVisible" title="投诉详情" width="800px">
      <template v-if="currentComplaint">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="投诉人">{{ currentComplaint.complainantUserName }}</el-descriptions-item>
          <el-descriptions-item label="投诉时间">{{ currentComplaint.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentComplaint.status === 0 ? 'warning' : 'success'">
              {{ currentComplaint.status === 0 ? '待处理' : '已处理' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="领回单处理时间" v-if="currentComplaint.handleTime">
            {{ currentComplaint.handleTime }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>认领申请信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物品名称">{{ currentComplaint.itemName }}</el-descriptions-item>
            <el-descriptions-item label="申请类型">
              {{ currentComplaint.claimType === 'claim' ? '认领申请' : '还回申请' }}
            </el-descriptions-item>
            <el-descriptions-item label="申请人">{{ currentComplaint.applicantUserName }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentComplaint.claimCreateTime }}</el-descriptions-item>
            <el-descriptions-item label="申请说明">{{ currentComplaint.claimDescription }}</el-descriptions-item>
          </el-descriptions>

          <!-- 证明材料 -->
          <div v-if="currentComplaint.evidence" class="evidence-section">
            <h4>申请证明材料</h4>
            <el-image
              :src="currentComplaint.evidence"
              :preview-src-list="[currentComplaint.evidence]"
              fit="contain"
              style="max-width: 100%; max-height: 400px;"
            />
          </div>
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

    <!-- 处理投诉对话框 -->
    <el-dialog v-model="processVisible" title="处理投诉" width="500px">
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="100px">
        <el-form-item label="处理意见" prop="feedback">
          <el-input
            v-model="processForm.feedback"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见"
          />
        </el-form-item>

        <el-form-item label="惩罚措施" prop="needPunish">
          <el-switch
            v-model="processForm.needPunish"
            active-text="加入黑名单"
            inactive-text="不加入黑名单"
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

// 处理对话框相关
const processVisible = ref(false)
const processFormRef = ref(null)
const processForm = reactive({
  feedback: '',
  needPunish: false
})

const processRules = {
  feedback: [
    { required: true, message: '请输入处理意见', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ]
}

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
    const data = await request.get('admin/complaints', { params })
    complaintList.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取投诉列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const showDetail = async (row) => {
  try {
    const data = await request.get(`complaint/${row.complaintId}`)
    currentComplaint.value = data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取投诉详情失败')
  }
}

// 处理投诉
const handleProcess = (row) => {
  currentComplaint.value = row
  processForm.feedback = ''
  processForm.needPunish = false
  processVisible.value = true
}

// 提交处理结果
const submitProcess = async () => {
  if (!processFormRef.value) return
  
  await processFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.put(`admin/complaints/${currentComplaint.value.complaintId}`, {
          feedback: processForm.feedback,
          needPunish: processForm.needPunish
        })
        ElMessage.success('处理成功')
        processVisible.value = false
        fetchComplaints()
      } catch (error) {
        ElMessage.error(error.message || '处理失败')
      }
    }
  })
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

const resetSearch = () => {
  searchForm.status = null
  searchForm.keyword = ''
  fetchComplaints()
}

onMounted(() => {
  fetchComplaints()
})
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

.evidence-section {
  margin-top: 20px;
}
</style>