<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
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
const dialogType = ref<'add' | 'edit'>('add');
const dialogTitle = ref('');
const submitText = ref('');
const loading = ref(false);

// 表单数据
const form = reactive({
  id: null as number | null,
  productName: '',
  price: 0,
  quantity: 1,
  supplier: '',
  region: '',
  phone: '',
  manager: '',
  remark: '',
});

// 表单验证规则
const rules: FormRules = {
  productName: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' },
  ],
  quantity: [
    { required: true, message: '请输入采购数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量不能小于1', trigger: 'blur' },
  ],
  supplier: [
    { required: true, message: '请输入供货商', trigger: 'blur' },
  ],
  region: [
    { required: true, message: '请输入地区', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' },
  ],
  manager: [
    { required: true, message: '请输入采购人', trigger: 'blur' },
  ],
};

// 打开对话框
const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialogType.value = type;
  dialogVisible.value = true;
  
  if (type === 'edit' && row) {
    dialogTitle.value = '修改采购信息';
    submitText.value = '保存';
    nextTick(() => {
      Object.assign(form, {
        id: row.id,
        productName: row.productName,
        price: row.price,
        quantity: row.quantity,
        supplier: row.supplier,
        region: row.region,
        phone: row.phone,
        manager: row.manager,
        remark: row.remark,
      });
    });
  } else {
    dialogTitle.value = '新增采购';
    submitText.value = '添加';
    nextTick(() => {
      Object.assign(form, {
        id: null,
        productName: '',
        price: 0,
        quantity: 1,
        supplier: '',
        region: '',
        phone: '',
        manager: '',
        remark: '',
      });
    });
  }
  
  // 重置表单验证
  nextTick(() => {
    formRef.value?.resetFields();
  });
};

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
};

// 提交表单
const onSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        let response;
        if (dialogType.value === 'edit') {
          response = await purchaseApi.updatePurchase(form);
        } else {
          response = await purchaseApi.addPurchase(form);
        }
        
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
          ElMessage.success(dialogType.value === 'edit' ? '修改成功！' : '添加成功！');
          closeDialog();
          emit('refresh');
        } else {
          ElMessage.error(response.msg || '操作失败');
        }
      } catch (error) {
        console.error('提交失败:', error);
        ElMessage.error('操作失败');
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
    width="700px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="purchase-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="form.productName" placeholder="请输入产品名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供货商" prop="supplier">
            <el-input v-model="form.supplier" placeholder="请输入供货商" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="价格" prop="price">
            <el-input-number 
              v-model="form.price" 
              :precision="2" 
              :step="0.01" 
              :min="0" 
              style="width: 100%" 
              placeholder="请输入价格"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采购数量" prop="quantity">
            <el-input-number 
              v-model="form.quantity" 
              :min="1" 
              :step="1"
              style="width: 100%" 
              placeholder="请输入数量"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="地区" prop="region">
            <el-input v-model="form.region" placeholder="请输入地区" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入电话" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="采购人" prop="manager">
            <el-input v-model="form.manager" placeholder="请输入采购人" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input 
              v-model="form.remark" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入备注信息"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="loading">
          {{ submitText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.purchase-form {
  padding: 20px 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
