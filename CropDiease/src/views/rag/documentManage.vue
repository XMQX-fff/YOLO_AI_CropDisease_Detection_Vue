<template>
  <div class="document-manage-container">
    <div class="page-header">
      <h1 class="page-title">文档管理</h1>
      <p class="page-subtitle">管理知识库文档，支持PDF、TXT、Word格式</p>
    </div>

    <div class="content-section">
      <!-- 上传区域 -->
      <div class="upload-section">
        <el-upload
          class="upload-area"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept=".pdf,.txt,.doc,.docx"
        >
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="upload-text">
            <span>拖拽文件到此处上传</span>
            <span class="upload-hint">或点击选择文件</span>
          </div>
          <div class="upload-tip">支持 PDF、TXT、Word 格式，单个文件不超过 100MB</div>
        </el-upload>
      </div>

      <!-- 文档列表 -->
      <div class="document-list-section">
        <div class="section-header">
          <h3>文档列表</h3>
          <el-button type="primary" @click="loadDocuments" :loading="loading">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>

        <el-table
          :data="documentList"
          v-loading="loading"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="documentId" label="ID" width="80" align="center" />
          <el-table-column prop="documentName" label="文档名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="documentType" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getFileTypeTag(row.documentType)">{{ row.documentType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="fileSize" label="大小" width="100" align="center">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="chunkCount" label="分片数" width="80" align="center" />
          <el-table-column prop="vectorStatus" label="向量化状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.vectorStatus)">{{ row.vectorStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="180" align="center" />
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
                :loading="deleteLoading[row.documentId]"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <el-empty v-if="!loading && documentList.length === 0" description="暂无文档" />
      </div>
    </div>

    <!-- 上传进度对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文档"
      width="400px"
      :close-on-click-modal="false"
      :show-close="!uploading"
    >
      <div class="upload-progress">
        <p>正在上传: {{ currentFile?.name }}</p>
        <el-progress :percentage="uploadProgress" :status="uploadStatus" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Refresh, Delete } from '@element-plus/icons-vue';
import { useRagApi } from '/@/api/rag';

const ragApi = useRagApi();

// 类型定义
interface DocumentUploadResponse {
  documentId: number;
  documentName: string;
  documentType: string;
  fileSize: number;
  chunkCount: number;
  vectorStatus: string;
  uploadTime: string;
}

const loading = ref(false);
const documentList = ref<DocumentUploadResponse[]>([]);
const uploadDialogVisible = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref('');
const currentFile = ref<File | null>(null);
const deleteLoading = ref<Record<number, boolean>>({});

// 加载文档列表
const loadDocuments = async () => {
  loading.value = true;
  try {
    const res: any = await ragApi.listDocuments();
    if (res.code === 200) {
      documentList.value = res.data || [];
    } else {
      ElMessage.error(res.message || '获取文档列表失败');
    }
  } catch (error) {
    console.error('获取文档列表失败:', error);
    ElMessage.error('获取文档列表失败');
  } finally {
    loading.value = false;
  }
};

// 文件选择处理
const handleFileChange = async (file: any) => {
  const rawFile = file.raw as File;
  
  // 检查文件类型
  const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
  const fileExtension = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    ElMessage.error('不支持的文件格式，请上传 PDF、TXT 或 Word 文件');
    return;
  }
  
  // 检查文件大小 (100MB)
  const maxSize = 100 * 1024 * 1024;
  if (rawFile.size > maxSize) {
    ElMessage.error('文件大小超过 100MB 限制');
    return;
  }
  
  currentFile.value = rawFile;
  await uploadFile(rawFile);
};

// 上传文件
const uploadFile = async (file: File) => {
  uploadDialogVisible.value = true;
  uploading.value = true;
  uploadProgress.value = 0;
  uploadStatus.value = '';
  
  try {
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 10;
      }
    }, 500);
    
    const res: any = await ragApi.uploadDocument(file);
    
    clearInterval(progressInterval);
    uploadProgress.value = 100;
    uploadStatus.value = 'success';
    
    if (res.code === 200) {
      ElMessage.success('文档上传成功');
      await loadDocuments();
    } else {
      uploadStatus.value = 'exception';
      ElMessage.error(res.message || '上传失败');
    }
  } catch (error) {
    uploadStatus.value = 'exception';
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    setTimeout(() => {
      uploading.value = false;
      uploadDialogVisible.value = false;
      currentFile.value = null;
    }, 500);
  }
};

// 删除文档
const handleDelete = async (row: DocumentUploadResponse) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文档 "${row.documentName}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    deleteLoading.value[row.documentId] = true;
    const res: any = await ragApi.deleteDocument(row.documentId);
    
    if (res.code === 200) {
      ElMessage.success('删除成功');
      await loadDocuments();
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  } finally {
    deleteLoading.value[row.documentId] = false;
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取文件类型标签样式
const getFileTypeTag = (type: string): string => {
  const typeMap: Record<string, string> = {
    'PDF': 'danger',
    'TXT': 'info',
    'DOC': 'primary',
    'DOCX': 'primary'
  };
  return typeMap[type?.toUpperCase()] || 'info';
};

// 获取状态标签样式
const getStatusTag = (status: string): string => {
  const statusMap: Record<string, string> = {
    'COMPLETED': 'success',
    'PROCESSING': 'warning',
    'FAILED': 'danger',
    'PENDING': 'info'
  };
  return statusMap[status?.toUpperCase()] || 'info';
};

onMounted(() => {
  loadDocuments();
});
</script>

<style scoped>
.document-manage-container {
  padding: 30px;
  background-color: #ffffff;
  min-height: 100%;
}

.page-header {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0 0;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.upload-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #374151;
  font-size: 16px;
}

.upload-hint {
  color: #6b7280;
  font-size: 14px;
}

.upload-tip {
  margin-top: 12px;
  color: #9ca3af;
  font-size: 12px;
}

.document-list-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.upload-progress {
  padding: 20px;
  text-align: center;
}

.upload-progress p {
  margin-bottom: 20px;
  color: #374151;
  word-break: break-all;
}

@media (max-width: 768px) {
  .document-manage-container {
    padding: 16px;
  }
  
  .upload-area :deep(.el-upload-dragger) {
    height: 160px;
  }
}
</style>
