<template>
  <div class="publish-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>{{ isLost ? '发布丢失物品' : '发布拾取物品' }}</h3>
          <el-switch v-model="isLost" :active-text="'丢失物品'" :inactive-text="'拾取物品'" />
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="物品名称" prop="itemName">
          <el-input v-model="formData.itemName" placeholder="请输入物品名称" />
        </el-form-item>

        <el-form-item label="物品类别" prop="categoryId">
          <div v-if="!isCustomCategory">
            <el-select 
              v-model="formData.categoryId" 
              placeholder="请选择物品类别" 
              style="width: 150px"
            >
              <el-option
                v-for="category in categories"
                :key="category.categoryId"
                :label="category.name"
                :value="category.categoryId"
              />
              <el-divider />
              <el-option label="+ 添加新类别" value="custom" />
            </el-select>
          </div>

          <div v-else class="custom-category">
            <div class="input-wrapper">
              <el-input v-model="newCategoryName" placeholder="请输入新的物品类别名称" />
              <div class="button-group">
                <el-button type="primary" @click="handleAddCategory">添加</el-button>
                <el-button @click="isCustomCategory = false">取消</el-button>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="详细描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请详细描述物品的特征、状态等信息" />
        </el-form-item>

        <el-form-item label="地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入丢失/拾取地点" />
        </el-form-item>

        <el-form-item :label="isLost ? '丢失时间' : '拾取时间'" prop="time">
          <el-date-picker v-model="formData.time" type="datetime" :placeholder="`请选择${isLost ? '丢失' : '拾取'}时间`"
            style="width: 100%" />
        </el-form-item>

        <el-form-item label="物品图片" prop="images">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            action="#"
            :http-request="handleUpload"
            list-type="picture-card"
            :limit="3"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-remove="handleRemove"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png 格式图片，单张不超过 5MB，最多上传 3 张
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">发布</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const itemStore = useItemStore()
const formRef = ref(null)
const isLost = ref(true)

const formData = reactive({
  itemName: '',
  categoryId: undefined,
  description: '',
  location: '',
  time: '',
  images: []
})

const isCustomCategory = ref(false)
const newCategoryName = ref('')

const categories = ref([])

const fileList = ref([])

// 计算当前选中的类别名称
const selectedCategoryName = computed(() => {
  const category = categories.value.find(c => c.categoryId === formData.categoryId)
  return category ? category.name : ''
})

// 获取物品类别列表
const fetchCategories = async () => {
  try {
    const data = await request.get('category/list')
    categories.value = data
  } catch (error) {
    ElMessage.error('获取物品类别失败')
  }
}

// 监听类别选择
watch(() => formData.categoryId, (newVal) => {
  if (newVal === 'custom') {
    isCustomCategory.value = true
    formData.categoryId = undefined
  }
})

// 添加新类别
const handleAddCategory = async () => {
  if (!newCategoryName.value) {
    ElMessage.warning('请输入类别名称')
    return
  }

  try {
    const data = await request.post('category', {
      name: newCategoryName.value,
      status: 1
    })
    
    // 添加到类别列表
    categories.value.push({
      categoryId: data.categoryId,
      name: newCategoryName.value,
      status: 1
    })
    
    // 选中新添加的类别
    formData.categoryId = data.categoryId
    
    ElMessage.success('添加类别成功')
    isCustomCategory.value = false
    newCategoryName.value = ''
  } catch (error) {
    ElMessage.error(error.message || '添加类别失败')
  }
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

// 处理文件上传
const handleUpload = async (options) => {
  try {
    // 创建 FormData
    const uploadFormData = new FormData()
    uploadFormData.append('file', options.file)
    
    // 调用上传接口
    const data = await request.post('upload/image', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // 将返回的图片URL添加到表单数据中
    formData.images.push(data.url)
    
    // 更新上传列表的状态
    options.onSuccess()
  } catch (error) {
    options.onError()
    ElMessage.error('图片上传失败')
  }
}

// 添加上传成功和失败的处理函数
const handleUploadSuccess = (response, file) => {
  console.log('上传成功:', file)
}

const handleUploadError = (error) => {
  console.error('上传失败:', error)
}

// 添加删除图片的处理
const handleRemove = (file) => {
  const index = formData.images.indexOf(file.url)
  if (index > -1) {
    formData.images.splice(index, 1)
  }
}

const rules = {
  itemName: [
    { required: true, message: '请输入物品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择或添加物品类别', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入详细描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入地点', trigger: 'blur' }
  ],
  time: [
    { required: true, message: '请选择时间', trigger: 'change' }
  ],
  images: [
    { 
      required: true, 
      message: '请上传至少一张物品图片', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (formData.images.length === 0) {
          callback(new Error('请上传至少一张物品图片'))
        } else {
          callback()
        }
      }
    }
  ]
}

onMounted(() => {
  fetchCategories()  // 组件加载时获取类别列表
})

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          ...formData,
          [isLost.value ? 'lostTime' : 'foundTime']: formData.time
        }
        delete submitData.time

        if (isLost.value) {
          await itemStore.publishLostItem(submitData)
        } else {
          await itemStore.publishFoundItem(submitData)
        }

        ElMessage.success('发布成功')
        router.push(isLost.value ? '/lost-items' : '/found-items')
      } catch (error) {
        ElMessage.error(error.message || '发布失败')
      }
    }
  })
}
</script>

<style scoped>
.publish-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-category {
  width: 100%;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 8px;
}

.upload-demo {
  :deep(.el-upload--picture-card) {
    width: 148px;
    height: 148px;
    line-height: 148px;
  }
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style>