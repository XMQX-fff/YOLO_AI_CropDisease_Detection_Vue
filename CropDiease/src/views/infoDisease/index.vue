<template>
  <div class="info-disease-container">
    <!-- 页面内容区域 -->
    <div class="page-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">病虫害检测</h1>
        <p class="page-subtitle">管理和检测农作物病虫害信息</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input v-model="state.tableData.param.name" size="default" placeholder="请输入病害名称" clearable style="width: 180px"> </el-input>
        <el-select v-model="state.tableData.param.cropType" size="default" class="ml10" placeholder="请选择作物类型" clearable style="width: 180px">
          <el-option v-for="item in state.cropTypes" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-button size="default" type="primary" class="ml10" @click="getTableData()">
          <el-icon>
            <el-icon-search />
          </el-icon>
          查询
        </el-button>
        <el-button size="default" type="primary" class="ml10" @click="onOpenAddDisease('add')">
          <el-icon>
            <el-icon-plus />
          </el-icon>
          添加
        </el-button>
      </div>
      
      <!-- 数据表格 -->
      <div class="table-section">
        <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
          <el-table-column prop="num" label="序号" width="80" align="center" />
          <el-table-column prop="cropType" label="作物类型" show-overflow-tooltip width="80" align="center" />
          <el-table-column prop="name" label="病害名称" show-overflow-tooltip width="150" align="center" />
          <el-table-column prop="symptoms" label="病害症状" show-overflow-tooltip min-width="200" align="center"/>
          <el-table-column prop="causes" label="发病原因" show-overflow-tooltip min-width="200" align="center"/>
          <el-table-column prop="prevention" label="防治方法" show-overflow-tooltip min-width="200" align="center"/>
          <el-table-column label="图片" width="100" align="center">
            <template #default="scope">
              <el-image 
                style="width: 35px; height: 35px" 
                :src="scope.row.image" 
                :preview-src-list="[scope.row.image]"
                :preview-teleported="true"
                :hide-on-click-modal="true"
                fit="cover"
                :preview-options="{
                  zoom: false,
                  closeOnPressEscape: true,
                  toolbar: false
                }"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" @click="onOpenDetail(scope.row)">详情</el-button>
              <el-button size="small" type="primary" @click="onOpenEditDisease('edit', scope.row)">修改</el-button>
              <el-button size="small" type="danger" @click="onRowDel(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
          @size-change="onHandleSizeChange"
          @current-change="onHandleCurrentChange"
          class="mt15"
          :pager-count="5"
          :page-sizes="[10, 20, 30]"
          v-model:current-page="state.tableData.param.pageNum"
          background
          v-model:page-size="state.tableData.param.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="state.tableData.total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search as ElIconSearch, Plus as ElIconPlus } from '@element-plus/icons-vue';
import { useDiseaseApi } from '/@/api/disease';

// 定义变量内容
const diseaseDialogRef = ref();
const diseaseApi = useDiseaseApi();
const state = reactive({
  tableData: {
    data: [] as any,
    total: 0,
    loading: false,
    param: {
      name: '',
      cropType: '',
      pageNum: 1,
      pageSize: 10,
    },
  },
  cropTypes: ['玉米', '水稻', '小麦', '马铃薯', '棉花', '苹果', '葡萄', '番茄', '草莓'] // 作物类型选项
});

// 使用API获取数据
const getTableData = async () => {
  state.tableData.loading = true;
  try {
    const response = await diseaseApi.getDiseaseList({
      ...state.tableData.param,
      page: state.tableData.param.pageNum,
      limit: state.tableData.param.pageSize
    });
    const data = response?.data;
    if (data && data.records) {
      state.tableData.data = data.records.map((item: any, index: number) => ({
        ...item,
        num: (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize + index + 1
      }));
      state.tableData.total = data.total || 0;
    } else {
      state.tableData.data = [];
      state.tableData.total = 0;
      ElMessage({
        type: 'warning',
        message: '未获取到数据',
      });
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取数据失败',
    });
    console.error('获取病害数据失败:', error);
    state.tableData.data = [];
    state.tableData.total = 0;
  } finally {
    state.tableData.loading = false;
  }
};

// 打开新增病害弹窗
const onOpenAddDisease = async (type: string) => {
  try {
    // 这里可以打开添加病害的表单
    ElMessage({
      type: 'info',
      message: '添加病害功能开发中',
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '操作失败',
    });
  }
};

// 打开修改病害弹窗
const onOpenEditDisease = async (type: string, row: any) => {
  try {
    // 这里可以打开修改病害的表单
    ElMessage({
      type: 'info',
      message: '修改病害功能开发中',
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '操作失败',
    });
  }
};

// 打开详情弹窗
const onOpenDetail = async (row: any) => {
  try {
    const response = await diseaseApi.getDiseaseDetail(row.id);
    const detail = response.data;
    // 这里可以显示病害详情
    ElMessage({
      type: 'info',
      message: `查看病害详情: ${detail.name}`,
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取详情失败',
    });
  }
};

// 删除病害
const onRowDel = async (row: any) => {
  ElMessageBox.confirm(`此操作将永久删除该病害信息，是否继续?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await diseaseApi.deleteDisease(row.id);
        ElMessage({
          type: 'success',
          message: '删除成功！',
        });
        getTableData();
      } catch (error) {
        ElMessage({
          type: 'error',
          message: '删除失败',
        });
      }
    })
    .catch(() => {});
};

// 分页改变
const onHandleSizeChange = (val: number) => {
  state.tableData.param.pageSize = val;
  getTableData();
};

// 分页改变
const onHandleCurrentChange = (val: number) => {
  state.tableData.param.pageNum = val;
  getTableData();
};

// 页面加载时
onMounted(() => {
  getTableData();
});
</script>

<style scoped>
.info-disease-container {
  padding: 24px;
  background-color: #ffffff;
  min-height: calc(100vh - 120px);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.search-section {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.table-section {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ml10 {
  margin-left: 10px;
}

.mt15 {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 表格样式调整 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  th {
    background-color: #f3f4f6;
    font-weight: 500;
    color: #374151;
  }
}

:deep(.el-table__row) {
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f9fafb;
  }
}

/* 按钮样式调整 */
:deep(.el-button) {
  border-radius: 6px;
  font-size: 13px;
  padding: 6px 12px;
}

:deep(.el-button--primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
  
  &:hover {
    background-color: #2563eb;
    border-color: #2563eb;
  }
}

:deep(.el-button--danger) {
  background-color: #ef4444;
  border-color: #ef4444;
  
  &:hover {
    background-color: #dc2626;
    border-color: #dc2626;
  }
}

/* 输入框和选择器样式调整 */
:deep(.el-input),
:deep(.el-select) {
  border-radius: 6px;
  
  & .el-input__wrapper {
    border-radius: 6px;
  }
}

/* 分页样式调整 */
:deep(.el-pagination) {
  .el-pager li {
    border-radius: 4px;
    
    &.active {
      background-color: #3b82f6;
      color: #ffffff;
    }
  }
  
  .btn-prev,
  .btn-next {
    border-radius: 4px;
  }
}

/* 图片样式 */
:deep(.el-image) {
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}
</style>