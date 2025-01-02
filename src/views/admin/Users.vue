<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>用户管理</h3>
          <div class="header-right">
            <el-input
              v-model="searchForm.username"
              placeholder="搜索用户名"
              style="width: 300px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-select v-model="searchForm.status" placeholder="状态" clearable @change="handleSearch">
              <el-option label="正常" :value="1" />
              <el-option label="已冻结" :value="0" />
            </el-select>
          </div>
        </div>
      </template>

      <!-- 用户列表 -->
      <el-table v-loading="loading" :data="userList" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="createTime" label="注册时间" width="180" />
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '已冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="showDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="danger"
              link
              @click="handleBlock(row)"
            >
              加入黑名单
            </el-button>
            <el-button
              v-else
              type="success"
              link
              @click="handleUnblock(row)"
            >
              解除冻结
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
    <el-dialog v-model="blockDialogVisible" title="加入黑名单" width="500px">
      <el-form ref="blockFormRef" :model="blockForm" :rules="blockRules" label-width="100px">
        <el-form-item label="违规类型" prop="type">
          <el-select v-model="blockForm.type" placeholder="请选择违规类型">
            <el-option :value="0" label="冒领物品" />
            <el-option :value="1" label="多次违规" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因说明" prop="reason">
          <el-input
            v-model="blockForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入加入黑名单的原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="blockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBlock">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="600px">
      <template v-if="currentUser">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
              {{ currentUser.status === 1 ? '正常' : '已冻结' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
          <el-descriptions-item label="是否在黑名单">
            <el-tag :type="currentUser.inBlacklist ? 'danger' : 'info'">
              {{ currentUser.inBlacklist ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 如果在黑名单中,显示黑名单信息 -->
        <div v-if="currentUser.inBlacklist" class="blacklist-info">
          <h4>黑名单信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="违规类型">
              {{ currentUser.type === 0 ? '冒领物品' : '多次违规' }}
            </el-descriptions-item>
            <el-descriptions-item label="原因说明">
              {{ currentUser.reason }}
            </el-descriptions-item>
            <el-descriptions-item label="加入时间">
              {{ currentUser.blacklistCreateTime }}
            </el-descriptions-item>
            <el-descriptions-item label="操作人">
              {{ currentUser.operatorName }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userList = ref([])

// 搜索表单
const searchForm = reactive({
  username: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

// 黑名单表单
const blockDialogVisible = ref(false)
const blockFormRef = ref(null)
const currentUser = ref(null)
const blockForm = reactive({
  type: '',
  reason: ''
})

// 详情对话框
const detailVisible = ref(false)

const blockRules = {
  type: [
    { required: true, message: '请选择违规类型', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入原因说明', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('admin/users', { params })
    userList.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 查看用户详情
const showDetail = async (row) => {
  try {
    const response = await request.get(`admin/users/${row.userId}`)
    console.log(response)
    // 检查响应格式
    currentUser.value = response
    console.log('用户详情数据:', currentUser.value)
    detailVisible.value = true
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 加入黑名单
const handleBlock = (row) => {
  currentUser.value = row
  blockForm.type = ''
  blockForm.reason = ''
  blockDialogVisible.value = true
}

// 提交加入黑名单
const submitBlock = async () => {
  if (!blockFormRef.value) return
  
  await blockFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post(`admin/users/${currentUser.value.userId}/block`, {
          type: blockForm.type,
          reason: blockForm.reason
        })
        ElMessage.success('操作成功')
        blockDialogVisible.value = false
        fetchUsers()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

// 解除冻结
const handleUnblock = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要解除该用户的冻结状态吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await request.post(`admin/users/${row.userId}/unlock`)
    ElMessage.success('操作成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUsers()
}

// 搜索相关
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-container {
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
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.blacklist-info {
  margin-top: 20px;

  h4 {
    margin: 10px 0;
    color: #606266;
    font-weight: bold;
  }
}
</style> 