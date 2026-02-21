<template>
  <div class="personal-container">
    <!-- 页面内容区域 -->
    <div class="page-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">个人中心</h1>
        <p class="page-subtitle">管理个人账号信息</p>
      </div>
      
      <!-- 个人信息内容 -->
      <div class="personal-content">
        <!-- 左侧头像区域 -->
        <div class="left-section">
          <div class="avatar-card">
            <div class="avatar-wrapper">
              <div class="avatar-content">
                <img v-if="imageUrl" :src="imageUrl" class="avatar-image" />
                <div v-else class="avatar-placeholder">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <span>点击上传头像</span>
                </div>
              </div>
            </div>
            <h3 class="welcome-text">欢迎回来</h3>
            <div class="user-role">{{ state.form.role }}</div>
          </div>
        </div>

        <!-- 右侧信息表单 -->
        <div class="right-section">
          <div class="info-card">
            <h2 class="section-title">个人信息</h2>
            <el-form 
              ref="formRef"
              :model="state.form" 
              :rules="rules"
              label-width="100px"
              class="info-form"
            >
              <div class="form-grid">
                <el-form-item label="账号" prop="username">
                  <el-input v-model="state.form.username" placeholder="请输入账号">
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input 
                    v-model="state.form.password" 
                    type="password" 
                    placeholder="请输入密码"
                    show-password
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="state.form.name" placeholder="请输入姓名">
                    <template #prefix>
                      <el-icon><UserFilled /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                  <el-select v-model="state.form.sex" placeholder="请选择性别">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select>
                </el-form-item>
                <el-form-item label="Email" prop="email">
                  <el-input v-model="state.form.email" placeholder="请输入Email">
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="手机号码" prop="tel">
                  <el-input v-model="state.form.tel" placeholder="请输入手机号码">
                    <template #prefix>
                      <el-icon><Phone /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </div>
              <div class="form-footer">
                <el-button type="primary" @click="submitForm" class="submit-button" :loading="loading">
                  <el-icon><Check /></el-icon>
                  确认修改
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Plus, Check, User, Lock, UserFilled, Message, Phone } from '@element-plus/icons-vue';
import { useUserApi } from '/@/api/user';

// 定义变量
const formRef = ref<FormInstance>();
const imageUrl = ref('');
const userApi = useUserApi();
const loading = ref(false);

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  tel: [
    { required: true, message: '请输入手机号码', trigger: 'blur' }
  ]
};

// 定义表单数据
const state = reactive({
  form: {
    username: 'admin',
    password: '123456',
    name: '管理员',
    sex: '男',
    email: 'admin@example.com',
    tel: '13800138001',
    role: '管理员',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar&image_size=square'
  },
});

// 获取用户信息
const getTableData = async () => {
  loading.value = true;
  try {
    // 这里假设获取当前登录用户的信息
    // 实际项目中可能需要从本地存储或状态管理中获取用户ID
    const response = await userApi.getUserDetail('admin');
    const userData = response.data;
    state.form = {
      ...userData,
      password: '' // 密码不返回
    };
    imageUrl.value = state.form.avatar;
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取用户信息失败',
    });
    console.error('获取用户信息失败:', error);
    // 模拟数据
    state.form = {
      username: 'admin',
      password: '123456',
      name: '管理员',
      sex: '男',
      email: 'admin@example.com',
      tel: '13800138001',
      role: '管理员',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar&image_size=square'
    };
    imageUrl.value = state.form.avatar;
  } finally {
    loading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true;
      try {
        await userApi.updateUser(state.form);
        ElMessage({
          type: 'success',
          message: '修改成功！',
        });
      } catch (error) {
        ElMessage({
          type: 'error',
          message: '修改失败',
        });
        console.error('修改用户信息失败:', error);
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error('请完善必填信息');
      return false;
    }
  });
};

// 页面加载时
onMounted(() => {
  getTableData();
});
</script>

<style scoped>
.personal-container {
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

.personal-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
}

/* 左侧头像区域 */
.left-section {
  .avatar-card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 40px 32px;
    text-align: center;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .avatar-wrapper {
      margin-bottom: 24px;

      .avatar-content {
        width: 180px;
        height: 180px;
        margin: 0 auto;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
        background-color: #f9fafb;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #6b7280;

          .upload-icon {
            font-size: 36px;
            margin-bottom: 12px;
            color: #3b82f6;
          }

          span {
            font-size: 14px;
          }
        }
      }
    }

    .welcome-text {
      font-size: 20px;
      color: #1f2937;
      margin: 0 0 16px;
      font-weight: 600;
    }

    .user-role {
      font-size: 15px;
      color: #3b82f6;
      font-weight: 500;
      padding: 8px 20px;
      background-color: #eff6ff;
      border-radius: 20px;
      display: inline-block;
      border: 1px solid #dbeafe;
    }
  }
}

/* 右侧信息表单 */
.right-section {
  .info-card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 40px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .section-title {
      font-size: 24px;
      color: #1f2937;
      margin: 0 0 32px;
      font-weight: 600;
    }

    .info-form {
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 32px;

        :deep(.el-form-item) {
          margin-bottom: 0;

          .el-form-item__label {
            font-weight: 500;
            color: #374151;
          }

          .el-input__wrapper {
            border-radius: 6px;
            transition: all 0.2s ease;

            &:hover,
            &.is-focus {
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }

            .el-input__prefix {
              margin-right: 8px;
              color: #3b82f6;
            }
          }

          .el-select {
            width: 100%;
            
            :deep(.el-input__wrapper) {
              border-radius: 6px;
              
              &:hover,
              &.is-focus {
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
              }
            }
          }
        }
      }

      .form-footer {
        margin-top: 40px;
        text-align: right;

        .submit-button {
          padding: 10px 32px;
          font-size: 15px;
          border-radius: 6px;
          background-color: #3b82f6;
          border: none;
          transition: all 0.2s ease;

          &:hover {
            background-color: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
        }
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .personal-container {
    padding: 16px;
  }
  
  .personal-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .left-section .avatar-card {
    padding: 24px;
  }
  
  .right-section .info-card {
    padding: 24px;
  }
  
  .info-form .form-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>