import request from '/@/utils/request';

export function useRagApi() {
    return {
        uploadDocument: (file, userId) => {
            const formData = new FormData();
            formData.append('file', file);
            if (userId) {
                formData.append('userId', userId.toString());
            }
            return request({
                url: '/ai-api/rag/upload',
                method: 'post',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        },
        query: (data) => {
            return request({
                url: '/ai-api/rag/query',
                method: 'post',
                data
            });
        },
        // 流式查询接口
        queryStream: (data, onMessage, onError, onComplete) => {
            const controller = new AbortController();
            const signal = controller.signal;
            
            fetch('/ai-api/rag/query/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(data),
                signal: signal
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                function read() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            onComplete && onComplete();
                            return;
                        }
                        
                        const chunk = decoder.decode(value, { stream: true });
                        // 累积缓冲区，处理跨块的 SSE 消息
                        if (!read.buffer) read.buffer = '';
                        read.buffer += chunk;
                        
                        // 按 SSE 消息分隔符 (\n\n) 分割
                        const messages = read.buffer.split('\n\n');
                        // 保留最后一个不完整的部分
                        read.buffer = messages.pop() || '';
                        
                        messages.forEach(message => {
                            const lines = message.split('\n');
                            let eventType = 'message';
                            let dataContent = '';
                            
                            lines.forEach(line => {
                                if (line.startsWith('event:')) {
                                    eventType = line.substring(6).trim();
                                } else if (line.startsWith('data:')) {
                                    // data: 后面可能有多行内容，需要累积
                                    if (dataContent) dataContent += '\n';
                                    dataContent += line.substring(5);
                                }
                            });
                            
                            if (dataContent) {
                                if (dataContent === '[DONE]') {
                                    onComplete && onComplete();
                                    return;
                                }
                                try {
                                    const jsonData = JSON.parse(dataContent);
                                    onMessage && onMessage(jsonData);
                                } catch (e) {
                                    console.error('解析流数据失败:', e, dataContent);
                                }
                            }
                        });
                        
                        read();
                    }).catch(error => {
                        onError && onError(error);
                    });
                }
                
                read();
            })
            .catch(error => {
                onError && onError(error);
            });
            
            return controller;
        },
        listDocuments: () => {
            return request({
                url: '/ai-api/rag/documents',
                method: 'get'
            });
        },
        deleteDocument: (documentId) => {
            return request({
                url: `/ai-api/rag/document/${documentId}`,
                method: 'delete'
            });
        }
    };
}
