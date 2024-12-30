<template>
  <div class="publish-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="header">
          <h3>编辑{{ itemType === 0 ? '丢失' : '拾取' }}物品</h3>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="物品名称" prop="itemName">
          <el-input v-model="formData.itemName" placeholder="请输入物品名称" />
        </el-form-item>

        <el-form-item label="物品类别" prop="categoryId">
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
          </el-select>
        </el-form-item>

        <el-form-item label="详细描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请详细描述物品的特征、状态等信息" />
        </el-form-item>

        <el-form-item label="地点" prop="location">
          <el-input v-model="formData.location" :placeholder="`请输入${itemType === 0 ? '丢失' : '拾取'}地点`" />
        </el-form-item>

        <el-form-item :label="itemType === 0 ? '丢失时间' : '拾取时间'" prop="time">
          <el-date-picker 
            v-model="formData.time" 
            type="datetime" 
            :placeholder="`请选择${itemType === 0 ? '丢失' : '拾取'}时间`"
            style="width: 100%" 
          />
        </el-form-item>

        <el-form-item label="物品图片" prop="images">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            action="#"
            :http-request="handleUpload"
            list-type="picture-card"
            :limit="6"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-remove="handleRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import dayjs from 'dayjs'

const props = defineProps({
  itemId: {
    type: Number,
    required: true
  },
  itemType: {
    type: Number,
    required: true
  }
})

const router = useRouter()
const loading = ref(false)
const formRef = ref(null)
const categories = ref([])
const fileList = ref([])

const formData = reactive({
  itemName: '',
  categoryId: null,
  description: '',
  location: '',
  time: '',
  images: []
})

// 获取物品详情
const fetchItemDetail = async () => {
  loading.value = true
  try {
    const url = 'item'
    const data = await request.get(`${url}/${props.itemId}`)
    
    // 设置表单数据
    formData.itemName = data.itemName
    formData.categoryId = data.categoryId
    formData.description = data.description
    formData.location = data.location
    formData.time = dayjs(props.itemType === 0 ? data.lostTime : data.foundTime).toDate()
    formData.images = data.images || []
    
    // 设置文件列表
    fileList.value = (data.images || []).map(url => ({
      url,
      name: url.split('/').pop()
    }))
  } catch (error) {
    ElMessage.error('获取物品信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 获取物品类别列表
const fetchCategories = async () => {
  try {
    const data = await request.get('category/list')
    categories.value = data
  } catch (error) {
    ElMessage.error('获取物品类别失败')
  }
}

onMounted(() => {
  fetchCategories()
  fetchItemDetail()
})

// 图片上传相关代码与 PublishItem.vue 相同
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

const handleUpload = async (options) => {
  try {
    const uploadFormData = new FormData()
    uploadFormData.append('file', options.file)
    
    const data = await request.post('upload/image', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    formData.images.push(data.url)
    options.onSuccess()
  } catch (error) {
    options.onError()
    ElMessage.error('图片上传失败')
  }
}

const handleUploadSuccess = (response, file) => {
  console.log('上传成功:', file)
}

const handleUploadError = (error) => {
  console.error('上传失败:', error)
}

const handleRemove = (file) => {
  const index = formData.images.indexOf(file.url)
  if (index > -1) {
    formData.images.splice(index, 1)
  }
}

// 表单验证规则
const rules = {
  itemName: [
    { required: true, message: '请输入物品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择物品类别', trigger: 'change' }
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

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url = props.itemType === 0 ? 'lost-item' : 'found-item'
        const submitData = {
          itemId: props.itemId,
          itemName: formData.itemName,
          categoryId: formData.categoryId,
          description: formData.description,
          location: formData.location,
          images: formData.images,
          [props.itemType === 0 ? 'lostTime' : 'foundTime']: dayjs(formData.time).toISOString()
        }

        await request.put(url, submitData)
        ElMessage.success('保存成功')
        router.push(props.itemType === 0 ? '/lost-items' : '/found-items')
      } catch (error) {
        ElMessage.error(error.message || '保存失败')
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