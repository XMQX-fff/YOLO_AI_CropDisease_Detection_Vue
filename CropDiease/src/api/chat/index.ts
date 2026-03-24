import request from '/@/utils/request';

export interface ChatRequest {
    message: string;
    sessionId?: string;
    userId?: number;
    temperature?: number;
    maxTokens?: number;
}

export interface ChatResponse {
    content: string;
    sessionId: string;
    tokensUsed?: number;
    model?: string;
    responseTime?: number;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export function useChatApi() {
    return {
        simpleChat: (data: ChatRequest) => {
            return request({
                url: '/ai-api/chat/simple',
                method: 'post',
                data
            });
        },
        simpleChatStream: async (data: ChatRequest, onMessage: (text: string) => void) => {
            const response = await fetch('/ai-api/chat/simple/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            
            if (!reader) {
                throw new Error('无法获取响应流');
            }
            
            let buffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // 按行分割并解析SSE格式
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留未完成的行
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data:')) {
                        const content = trimmedLine.slice(5).trim();
                        if (content && content !== '[DONE]') {
                            onMessage(content);
                        }
                    }
                }
            }
            
            // 处理剩余缓冲区
            if (buffer.trim().startsWith('data:')) {
                const content = buffer.trim().slice(5).trim();
                if (content && content !== '[DONE]') {
                    onMessage(content);
                }
            }
        },
        chatWithMemory: (data: ChatRequest) => {
            return request({
                url: '/ai-api/chat/memory',
                method: 'post',
                data
            });
        },
        chatWithMemoryStream: async (data: ChatRequest, onMessage: (text: string) => void) => {
            const response = await fetch('/ai-api/chat/memory/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            
            if (!reader) {
                throw new Error('无法获取响应流');
            }
            
            let buffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // 按行分割并解析SSE格式
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留未完成的行
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data:')) {
                        const content = trimmedLine.slice(5).trim();
                        if (content && content !== '[DONE]') {
                            onMessage(content);
                        }
                    }
                }
            }
            
            // 处理剩余缓冲区
            if (buffer.trim().startsWith('data:')) {
                const content = buffer.trim().slice(5).trim();
                if (content && content !== '[DONE]') {
                    onMessage(content);
                }
            }
        },
        chatWithMemorySse: async (data: ChatRequest, onMessage: (text: string) => void) => {
            const response = await fetch('/ai-api/chat/memory/sse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            
            if (!reader) {
                throw new Error('无法获取响应流');
            }
            
            let buffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // 按行分割并解析SSE格式
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留未完成的行
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data:')) {
                        const content = trimmedLine.slice(5).trim();
                        if (content && content !== '[DONE]') {
                            onMessage(content);
                        }
                    }
                }
            }
            
            // 处理剩余缓冲区
            if (buffer.trim().startsWith('data:')) {
                const content = buffer.trim().slice(5).trim();
                if (content && content !== '[DONE]') {
                    onMessage(content);
                }
            }
        },
        clearHistory: (sessionId: string) => {
            return request({
                url: `/ai-api/chat/history/${sessionId}`,
                method: 'delete'
            });
        }
    };
}
