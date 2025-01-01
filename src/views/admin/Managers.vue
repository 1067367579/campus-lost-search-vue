<template>
  <div class="managers-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>管理员管理</h3>
          <div class="header-right">
            <el-input
              v-model="searchForm.username"
              placeholder="搜索用户名"
              style="width: 200px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-button type="primary" @click="handleAdd">
              添加管理员
            </el-button>
          </div>
        </div>
      </template>

      <!-- 管理员列表 -->
      <el-table v-loading="loading" :data="managerList" style="width: 100%">
        <el-table-column label="用户名" prop="username" width="150" />
        <el-table-column label="创建时间" prop="createTime" width="180" />
        
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
              v-if="row.username !== 'admin1'"
              :type="row.status === 1 ? 'danger' : 'success'"
              link
              @click="handleStatusChange(row)"
            >
              {{ row.status === 1 ? '冻结' : '解冻' }}
            </el-button>
            <el-button
              v-if="row.username !== 'admin1'"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="'添加管理员'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="管理员编号" prop="idNumber">
          <el-input v-model="form.idNumber" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const managerList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

// 表单相关
const form = reactive({
  username: '',
  password: '',
  phone: '',
  email: '',
  idNumber: '',
  userType: 1
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  idNumber: [
    { required: true, message: '请输入管理员编号', trigger: 'blur' },
    { pattern: /(^\d{3}$)/, message: '请输入正确的管理员编号', trigger: 'blur' }
  ]
}

// 搜索表单
const searchForm = reactive({
  username: '',
  pageNum: 1,
  pageSize: 10
})

// 获取管理员列表
const fetchManagers = async () => {
  // 只有admin1可以访问
  if (userStore.userInfo?.username !== 'admin1') {
    ElMessage.error('无权限访问')
    return
  }

  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('admin/managers', { params })
    managerList.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

// 添加管理员
const handleAdd = () => {
  Object.keys(form).forEach(key => form[key] = '')
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('admin/managers', form)
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchManagers()
      } catch (error) {
        ElMessage.error(error.message || '添加失败')
      }
    }
  })
}

// 修改状态
const handleStatusChange = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 1 ? '冻结' : '解冻'}该管理员吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: row.status === 1 ? 'warning' : 'success'
      }
    )
    
    await request.put(`admin/managers/${row.userId}/${row.status}`, {
      status: row.status === 1 ? 0 : 1
    })
    ElMessage.success('操作成功')
    fetchManagers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 删除管理员
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该管理员吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await request.delete(`admin/managers/${row.userId}`)
    ElMessage.success('删除成功')
    fetchManagers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchManagers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchManagers()
}

// 搜索相关
const handleSearch = () => {
  currentPage.value = 1
  fetchManagers()
}

onMounted(() => {
  fetchManagers()
})
</script>

<style scoped>
.managers-container {
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
</style>