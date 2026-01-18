<template>
	<div class="system-role-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="800px" class="dia">
			<div class="imgs">
				<el-upload
					v-model="state.form.avatar"
					ref="uploadFile"
					class="avatar-uploader"
					action="http://localhost:9999/files/upload"
					:show-file-list="false"
					:on-success="handleAvatarSuccessone"
				>
					<img v-if="imageUrl" :src="imageUrl" class="avatar" />
					<el-icon v-if="!imageUrl"><Plus /></el-icon>
				</el-upload>
			</div>
			<el-form ref="roleDialogFormRef" :model="state.form" size="default" label-width="100px" :rules="rules">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="账号" prop="username" style="color: #000">
							<el-input v-model="state.form.username" placeholder="请输入账号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="密码" prop="password">
							<el-input v-model="state.form.password" placeholder="请输入密码" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="姓名" prop="name" style="color: #000">
							<el-input v-model="state.form.name" placeholder="请输入姓名" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="性别" prop="sex">
							<el-select v-model="state.form.sex" placeholder="请选择性别" style="width: 100%">
								<el-option label="男" value="男" />
								<el-option label="女" value="女" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="Email" prop="email">
							<el-input v-model="state.form.email" placeholder="请输入Email" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="手机号码" prop="tel">
							<el-input v-model="state.form.tel" placeholder="请输入手机号码" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="角色" prop="role">
							<el-select v-model="state.form.role" value-key="id" placeholder="请选择注册角色" style="width: 100%">
								<el-option v-for="item in option" :key="item.id" :label="item.label" :value="item.role" />
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemRoleDialog">
import { nextTick, computed, reactive, ref } from 'vue';
import type { UploadInstance, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useUserApi } from '/@/api/user';
const userApi = useUserApi();

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const imageUrl = ref('');
const uploadFile = ref<UploadInstance>();

const handleAvatarSuccessone: UploadProps['onSuccess'] = (response, uploadFile) => {
	console.log(response);
	imageUrl.value = URL.createObjectURL(uploadFile.raw!);
	state.form.avatar = response.data;
};

const option = [
	{ id: 1, label: '管理员', role: 'admin' },
	{ id: 2, label: '普通用户', role: 'common' },
	{ id: 3, label: '供应商', role: 'supplier' },
];

// 定义变量内容
const roleDialogFormRef = ref();
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
		{ required: true, message: '请输入邮箱', trigger: 'blur' },
		{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
	],
	tel: [
		{ required: true, message: '请输入手机号码', trigger: 'blur' },
		// { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
	],
	role: [
		{ required: true, message: '请选择角色', trigger: 'change' }
	]
};

const state = reactive({
	form: {} as any,
	menuData: [] as TreeType[],
	menuProps: {
		children: 'children',
		label: 'label',
	},
	submitTxt: '',
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = (type: string, row: RowRoleType) => {
	if (type === 'edit') {
		state.form = row;
		state.dialog.title = '修改信息';
		state.dialog.submitTxt = '修 改';
		imageUrl.value = state.form.avatar;
	} else {
		state.dialog.title = '新增信息';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			uploadFile.value!.clearFiles(); //该方法就是清理上传列表
			imageUrl.value = '';
		});
	}
	state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	if (!roleDialogFormRef.value) return;
	roleDialogFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			ElMessage.error('请完善必填信息');
			return false;
		}
		
		if (state.form['role'] == '管理员') {
			state.form['role'] = 'admin';
		} else if (state.form['role'] == '普通用户') {
			state.form['role'] = 'common';
		} else if (state.form['role'] == '其他用户') {
			state.form['role'] = 'others';
		} else if (state.form['role'] == '供应商') {
			state.form['role'] = 'supplier';
		}

		if (state.dialog.title == '修改信息') {
			userApi.updateUser(state.form).then((res) => {
				if (res.code == 0) {
					ElMessage.success('修改成功！');
					setTimeout(() => {
						closeDialog();
						emit('refresh');
					}, 500);
				} else {
					ElMessage({
						type: 'error',
						message: res.msg,
					});
				}
			});
		} else {
			userApi.addUser(state.form).then((res) => {
				if (res.code == 0) {
					ElMessage.success('添加成功！');
				} else {
					ElMessage({
						type: 'error',
						message: res.msg,
					});
				}
				setTimeout(() => {
					closeDialog();
					emit('refresh');
				}, 500);
			});
		}
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
:deep(.dia) {
	.el-dialog {
		margin-top: 8vh !important;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(72, 187, 120, 0.2);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(72, 187, 120, 0.2);
		
		.el-dialog__header {
			padding: 20px;
			margin-right: 0;
			border-bottom: 1px solid rgba(72, 187, 120, 0.2);
			
			.el-dialog__title {
				font-size: 18px;
				font-weight: 600;
				color: #2f855a;
			}
		}
		
		.el-dialog__body {
			padding: 20px;
		}
		
		.el-dialog__footer {
			padding: 20px;
			border-top: 1px solid rgba(72, 187, 120, 0.2);
			
			.dialog-footer {
				:deep(.el-button--primary) {
					background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
					border: none;
					box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
					transition: all 0.3s ease;
					
					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
						background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
					}
				}
			}
		}
	}
}

.el-form {
	width: 100%;
	margin: 0;
}

.imgs {
	font-size: 36px;
	color: #48bb78;
	width: 120px;
	height: 120px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 2px dashed rgba(72, 187, 120, 0.3);
	border-radius: 12px;
	cursor: pointer;
	margin: 0 auto 20px;
	transition: all 0.3s ease;
	background: rgba(72, 187, 120, 0.05);
	
	&:hover {
		border-color: #48bb78;
		background: rgba(72, 187, 120, 0.1);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(72, 187, 120, 0.2);
	}
}

.avatar-uploader {
	:deep(.el-upload) {
		width: 120px;
		height: 120px;
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
		background: transparent;
		
		&:hover {
			border-color: #48bb78;
		}
	}
}

.avatar {
	width: 120px;
	height: 120px;
	display: block;
	border-radius: 12px;
	transition: all 0.3s ease;
	box-shadow: 0 4px 16px rgba(72, 187, 120, 0.2);
}

:deep(.el-form-item__label) {
	font-weight: 600;
	color: #2f855a;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
	border-radius: 8px;
	transition: all 0.3s ease;
	
	&:hover {
		box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
		border-color: rgba(72, 187, 120, 0.4);
	}
	
	&.is-focus,
	&:focus-within {
		border-color: #48bb78;
		box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
	}
}

.mb20 {
	margin-bottom: 20px;
}

:deep(.el-icon-plus) {
	font-size: 36px;
	color: #48bb78;
}
</style>
