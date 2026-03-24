import request from '/@/utils/request';

export interface RagQueryRequest {
    question: string;
    topK?: number;
    similarityThreshold?: number;
    includeSources?: boolean;
}

export interface SourceDocument {
    content: string;
    documentName: string;
    score: number;
    metadata: any;
}

export interface RagQueryResponse {
    answer: string;
    sources: SourceDocument[];
    responseTime: number;
}

export interface DocumentUploadResponse {
    documentId: number;
    documentName: string;
    documentType: string;
    fileSize: number;
    chunkCount: number;
    vectorStatus: string;
    uploadTime: string;
}

export function useRagApi() {
    return {
        uploadDocument: (file: File, userId?: number) => {
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
        query: (data: RagQueryRequest) => {
            return request({
                url: '/ai-api/rag/query',
                method: 'post',
                data
            });
        },
        listDocuments: () => {
            return request({
                url: '/ai-api/rag/documents',
                method: 'get'
            });
        },
        deleteDocument: (documentId: number) => {
            return request({
                url: `/ai-api/rag/document/${documentId}`,
                method: 'delete'
            });
        }
    };
}
