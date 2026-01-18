<template>
	<div class="error layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<div class="error-flex">
				<div class="left">
					<div class="left-item">
						<div class="left-item-animation left-item-num">404</div>
						<div class="left-item-animation left-item-title">{{ $t('message.notFound.foundTitle') }}</div>
						<div class="left-item-animation left-item-msg">{{ $t('message.notFound.foundMsg') }}</div>
						<div class="left-item-animation left-item-btn">
							<el-button type="primary" size="default" round @click="onGoHome">{{ $t('message.notFound.foundBtn') }}</el-button>
						</div>
					</div>
				</div>
				<div class="right">
					<img
						src="https://img-blog.csdnimg.cn/9eb1d85a417f4ed1ba7107f149ce3da1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAbHl0LXRvcA==,size_16,color_FFFFFF,t_70,g_se,x_16"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="notFound">
import { useRouter } from 'vue-router';

// 定义变量内容
const router = useRouter();

// 返回首页
const onGoHome = () => {
	router.push('/');
};
</script>

<style scoped lang="scss">
.error {
	height: 100vh;
	width: 100%;
	background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	padding: 20px;
	
	.layout-padding-auto {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(72, 187, 120, 0.2);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(72, 187, 120, 0.2);
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 12px 48px rgba(72, 187, 120, 0.3);
		}
	}
	
	.error-flex {
		margin: auto;
		display: flex;
		height: 350px;
		width: 900px;
		.left {
			flex: 1;
			height: 100%;
			align-items: center;
			display: flex;
			.left-item {
				.left-item-animation {
					opacity: 0;
					animation-name: error-num;
					animation-duration: 0.5s;
					animation-fill-mode: forwards;
				}
				.left-item-num {
					color: #48bb78;
					font-size: 55px;
					font-weight: 700;
				}
				.left-item-title {
					font-size: 20px;
					color: #2d3748;
					margin: 15px 0 5px 0;
					animation-delay: 0.1s;
				}
				.left-item-msg {
					color: #4a5568;
					font-size: 14px;
					margin-bottom: 30px;
					animation-delay: 0.2s;
				}
				.left-item-btn {
					animation-delay: 0.2s;
					
					:deep(.el-button) {
						background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
						border: none;
						border-radius: 12px;
						padding: 10px 30px;
						font-size: 16px;
						font-weight: 500;
						transition: all 0.3s ease;
						box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
						
						&:hover {
							transform: translateY(-3px);
							box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
							background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
						}
					}
				}
			}
		}
		.right {
			flex: 1;
			opacity: 0;
			animation-name: error-img;
			animation-duration: 2s;
			animation-fill-mode: forwards;
			img {
				width: 100%;
				height: 100%;
			}
		}
	}
}
</style>
