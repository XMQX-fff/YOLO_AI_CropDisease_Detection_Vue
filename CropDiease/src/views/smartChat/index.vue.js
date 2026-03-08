import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
// 定义变量
const messageContainer = ref();
const userInput = ref('');
const loading = ref(false);
const messages = ref([
    {
        role: 'assistant',
        content: '你好，我是你的农业智能小助手，你可以向我提问关于农作物种植、病虫害防治、农业技术等方面的问题！'
    }
]);
const suggestedQuestions = [
    '如何防治水稻病害？',
    '玉米常见病虫害有哪些？',
    '小麦生长周期是多少天？',
    '如何提高农作物产量？',
    '农药使用注意事项有哪些？',
    '农作物施肥的最佳时间？',
    '如何识别植物病害症状？'
];
// Markdown渲染函数
const renderMarkdown = (text) => {
    if (!text)
        return '';
    // 替换标题
    text = text.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');
    // 替换粗体
    text = text.replace(/\*\*(.*?)\*\*/gim, '<strong class="markdown-bold">$1</strong>');
    // 替换列表
    text = text.replace(/^\s*\-\s+(.*$)/gim, '<li class="markdown-list-item">$1</li>');
    text = text.replace(/(<li class="markdown-list-item">[\s\S]*?<\/li>)/gim, '<ul class="markdown-list">$1</ul>');
    // 替换行内代码
    text = text.replace(/`(.*?)`/gim, '<code class="markdown-code">$1</code>');
    // 替换段落
    text = text.replace(/^(?!<h[1-6]>)(?!<li>)(?!<ul>)(?!<code>)(.*$)/gim, '<p class="markdown-paragraph">$1</p>');
    return text;
};
// 选择推荐问题
const selectQuestion = (question) => {
    userInput.value = question;
    sendMessage();
};
// 发送消息
const sendMessage = async () => {
    if (!userInput.value.trim() || loading.value)
        return;
    const userMessage = userInput.value.trim();
    messages.value.push({
        role: 'user',
        content: userMessage
    });
    userInput.value = '';
    loading.value = true;
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    try {
        // 添加一个临时的assistant消息用于显示流式输出
        const assistantMessageIndex = messages.value.length;
        messages.value.push({
            role: 'assistant',
            content: ''
        });
        // 模拟API响应
        setTimeout(() => {
            let fullContent = '';
            const responses = [
                '我是农业智能助手，专注于农作物种植和病虫害防治领域。',
                '针对您的问题，我需要分析具体情况。',
                '以下是一些建议：',
                '1. 定期检查作物生长状况',
                '2. 合理施肥和灌溉',
                '3. 及时防治病虫害',
                '4. 选择适合当地气候的作物品种'
            ];
            let index = 0;
            const interval = setInterval(() => {
                if (index < responses.length) {
                    fullContent += responses[index] + '\n';
                    messages.value[assistantMessageIndex].content = fullContent;
                    nextTick(() => {
                        scrollToBottom();
                    });
                    index++;
                }
                else {
                    clearInterval(interval);
                    loading.value = false;
                    nextTick(() => {
                        scrollToBottom();
                    });
                }
            }, 300);
        }, 1000);
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '发送消息失败，请稍后重试',
        });
        console.error('Error:', error);
        // 移除最后一个空的assistant消息
        if (messages.value[messages.value.length - 1].content === '') {
            messages.value.pop();
        }
        loading.value = false;
    }
};
// 滚动到底部
const scrollToBottom = () => {
    if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
};
// 页面加载时
onMounted(() => {
    // 初始化滚动位置
    scrollToBottom();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['user-message']} */ ;
/** @type {__VLS_StyleScopedClasses['text']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant-message']} */ ;
/** @type {__VLS_StyleScopedClasses['text']} */ ;
/** @type {__VLS_StyleScopedClasses['suggested-item']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-textarea__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['smart-chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['suggested-questions']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "smart-chat-container" },
});
/** @type {__VLS_StyleScopedClasses['smart-chat-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-content" },
});
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "page-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-section" },
});
/** @type {__VLS_StyleScopedClasses['chat-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-messages" },
    ref: "messageContainer",
});
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
for (const [message, index] of __VLS_vFor((__VLS_ctx.messages))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: (['message', message.role === 'user' ? 'user-message' : 'assistant-message']) },
    });
    /** @type {__VLS_StyleScopedClasses['message']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-content" },
    });
    /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
    (message.role === 'user' ? '👤' : '🤖');
    if (message.role === 'user') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text" },
        });
        /** @type {__VLS_StyleScopedClasses['text']} */ ;
        (message.content);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(message.content)) }, null, null);
        /** @type {__VLS_StyleScopedClasses['text']} */ ;
    }
    // @ts-ignore
    [messages, renderMarkdown,];
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message assistant-message" },
    });
    /** @type {__VLS_StyleScopedClasses['message']} */ ;
    /** @type {__VLS_StyleScopedClasses['assistant-message']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-content" },
    });
    /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text" },
    });
    /** @type {__VLS_StyleScopedClasses['text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "loading-dots" },
    });
    /** @type {__VLS_StyleScopedClasses['loading-dots']} */ ;
}
if (__VLS_ctx.messages.length === 1) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "suggested-questions" },
    });
    /** @type {__VLS_StyleScopedClasses['suggested-questions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "suggested-title" },
    });
    /** @type {__VLS_StyleScopedClasses['suggested-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "suggested-list" },
    });
    /** @type {__VLS_StyleScopedClasses['suggested-list']} */ ;
    for (const [question, index] of __VLS_vFor((__VLS_ctx.suggestedQuestions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.messages.length === 1))
                        return;
                    __VLS_ctx.selectQuestion(question);
                    // @ts-ignore
                    [messages, loading, suggestedQuestions, selectQuestion,];
                } },
            key: (index),
            ...{ class: "suggested-item" },
        });
        /** @type {__VLS_StyleScopedClasses['suggested-item']} */ ;
        (question);
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-input" },
});
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.userInput),
    type: "textarea",
    rows: (3),
    placeholder: "请输入您的问题...",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.userInput),
    type: "textarea",
    rows: (3),
    placeholder: "请输入您的问题...",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.sendMessage) });
var __VLS_3;
var __VLS_4;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.loading),
    disabled: (!__VLS_ctx.userInput.trim()),
}));
const __VLS_9 = __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.loading),
    disabled: (!__VLS_ctx.userInput.trim()),
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = ({ click: {} },
    { onClick: (__VLS_ctx.sendMessage) });
const { default: __VLS_14 } = __VLS_10.slots;
// @ts-ignore
[loading, userInput, userInput, sendMessage, sendMessage,];
var __VLS_10;
var __VLS_11;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
