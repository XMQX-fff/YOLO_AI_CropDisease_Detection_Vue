<script setup lang="ts">
import { reactive, ref, nextTick, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { usePurchaseApi } from '/@/api/purchase';

// API
const purchaseApi = usePurchaseApi();

// 定义事件
const emit = defineEmits(['refresh']);

// 表单引用
const formRef = ref<FormInstance>();

// 对话框状态
const dialogVisible = ref(false);
const loading = ref(false);
const currentOrder = ref<any>(null);

// 表单数据
const form = reactive({
  id: '',
  orderId: '',
  orderNo: '',
  logisticsNo: '',
  logisticsCompany: '',
  logisticsStatus: 'pending',
  logisticsInfo: '',
  shipTime: null as Date | null,
});

// 表单验证规则
const rules: FormRules = {
  logisticsNo: [
    { required: true, message: '请输入物流单号', trigger: 'blur' },
    { min: 5, max: 50, message: '物流单号长度在 5 到 50 个字符', trigger: 'blur' },
  ],
  logisticsCompany: [
    { required: true, message: '请输入物流公司', trigger: 'blur' },
    { min: 2, max: 20, message: '物流公司名称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  logisticsStatus: [
    { required: true, message: '请选择物流状态', trigger: 'change' },
  ],
  logisticsInfo: [
    { required: true, message: '请输入物流信息', trigger: 'blur' },
    { min: 5, message: '物流信息长度不能少于 5 个字符', trigger: 'blur' },
  ],
};

// 对话框标题
const dialogTitle = computed(() => {
  return form.id ? '编辑物流信息' : '新增物流信息';
});

// 获取订单状态文本
const getOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

// 打开对话框
const openDialog = async (order: any) => {
  currentOrder.value = order;
  dialogVisible.value = true;
  
  // 初始化表单数据
  nextTick(() => {
    Object.assign(form, {
      id: '',
      orderId: order.id,
      orderNo: order.orderNo,
      logisticsNo: '',
      logisticsCompany: '',
      logisticsStatus: 'pending',
      logisticsInfo: '',
      shipTime: null,
    });
  });
  
  // 查询现有物流信息
  if (order.id) {
    try {
      const response = await purchaseApi.getLogisticsByOrderId(order.id);
      if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
        if (response.data) {
          const logisticsData = response.data;
          Object.assign(form, {
            id: logisticsData.id || '',
            logisticsNo: logisticsData.logisticsNo || '',
            logisticsCompany: logisticsData.logisticsCompany || '',
            logisticsStatus: logisticsData.logisticsStatus || 'pending',
            logisticsInfo: logisticsData.logisticsInfo || '',
            shipTime: logisticsData.shipTime ? new Date(logisticsData.shipTime) : null,
          });
        }
      }
    } catch (error) {
      console.error('获取物流信息失败:', error);
    }
  }
  
  // 重置表单验证
  nextTick(() => {
    formRef.value?.resetFields();
  });
};

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
  currentOrder.value = null;
  formRef.value?.resetFields();
};

// 提交表单
const onSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const saveData = {
          id: form.id,
          orderId: form.orderId,
          logisticsNo: form.logisticsNo,
          logisticsCompany: form.logisticsCompany,
          logisticsStatus: form.logisticsStatus,
          logisticsInfo: form.logisticsInfo,
          shipTime: form.shipTime ? form.shipTime.toISOString() : null,
        };
        
        let response;
        if (form.id) {
          response = await purchaseApi.updateLogistics(saveData);
        } else {
          response = await purchaseApi.addLogistics(saveData);
        }
        
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
          // 如果物流状态是已发货/运输中/已签收，更新订单状态
          if (['shipped', 'transporting', 'delivered'].includes(form.logisticsStatus)) {
            try {
              await purchaseApi.updateOrderStatus(form.orderId, 'shipped');
            } catch (e) {
              // 订单状态更新失败不影响物流信息保存
            }
          }
          
          ElMessage.success('物流信息保存成功');
          closeDialog();
          emit('refresh');
        } else {
          ElMessage.error(response.msg || '保存失败');
        }
      } catch (error) {
        console.error('保存物流信息失败:', error);
        ElMessage.error('保存失败');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 暴露方法
defineExpose({
  openDialog,
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="logistics-form"
    >
      <el-form-item label="订单号">
        <el-input v-model="form.orderNo" disabled />
      </el-form-item>
      
      <el-form-item label="订单状态">
        <el-input :value="getOrderStatusText(currentOrder?.status)" disabled />
      </el-form-item>
      
      <el-form-item label="物流单号" prop="logisticsNo">
        <el-input v-model="form.logisticsNo" placeholder="请输入物流单号" clearable />
      </el-form-item>
      
      <el-form-item label="物流公司" prop="logisticsCompany">
        <el-input v-model="form.logisticsCompany" placeholder="请输入物流公司" clearable />
      </el-form-item>
      
      <el-form-item label="物流状态" prop="logisticsStatus">
        <el-select v-model="form.logisticsStatus" placeholder="请选择物流状态" style="width: 100%">
          <el-option label="待发货" value="pending" />
          <el-option label="已发货" value="shipped" />
          <el-option label="运输中" value="transporting" />
          <el-option label="已签收" value="delivered" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="物流信息" prop="logisticsInfo">
        <el-input
          v-model="form.logisticsInfo"
          type="textarea"
          :rows="3"
          placeholder="请输入物流信息"
        />
      </el-form-item>
      
      <el-form-item label="发货时间">
        <el-date-picker
          v-model="form.shipTime"
          type="datetime"
          placeholder="请选择发货时间"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="loading">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.logistics-form {
  padding: 20px 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
