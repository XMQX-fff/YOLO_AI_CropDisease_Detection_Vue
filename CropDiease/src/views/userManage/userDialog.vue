<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserApi } from '/@/api/user';

const userApi = useUserApi();

const emit = defineEmits(['refresh']);

const formRef = ref<FormInstance>();

const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const dialogTitle = ref('');
const submitText = ref('');
const loading = ref(false);

const form = reactive({
  id: null as number | null,
  username: '',
  password: '',
  name: '',
  sex: '',
  email: '',
  tel: '',
  role: '',
  avatar: '',
});

const rules: FormRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  tel: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
};

const sexOptions = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
];

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
];

const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialogType.value = type;
  dialogVisible.value = true;
  
  if (type === 'edit' && row) {
    dialogTitle.value = '修改用户';
    submitText.value = '保存';
    nextTick(() => {
      Object.assign(form, {
        id: row.id,
        username: row.username,
        password: row.password || '',
        name: row.name,
        sex: row.sex,
        email: row.email || '',
        tel: row.tel || '',
        role: row.role,
        avatar: row.avatar || '',
      });
    });
  } else {
    dialogTitle.value = '新增用户';
    submitText.value = '添加';
    nextTick(() => {
      Object.assign(form, {
        id: null,
        username: '',
        password: '',
        name: '',
        sex: '',
        email: '',
        tel: '',
        role: '',
        avatar: '',
      });
      formRef.value?.resetFields();
    });
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
};

const onSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        let response;
        if (dialogType.value === 'edit') {
          response = await userApi.updateUser(form);
        } else {
          response = await userApi.register(form);
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
      class="user-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" placeholder="请输入账号" clearable :disabled="dialogType === 'edit'" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" clearable show-password />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-select v-model="form.sex" placeholder="请选择性别" style="width: 100%">
              <el-option v-for="item in sexOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="tel">
            <el-input v-model="form.tel" placeholder="请输入手机号码" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
              <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
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
.user-form {
  padding: 20px 10px;
}
</style>
