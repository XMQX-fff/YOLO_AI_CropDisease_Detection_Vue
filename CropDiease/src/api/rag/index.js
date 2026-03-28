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
