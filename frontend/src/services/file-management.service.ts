import { http } from './request';
import { EntityId } from '@/types';

/**
 * 文件元数据接口
 */
export interface FileMetadata {
  id: EntityId;
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  fileSize: number;
  fileSizeReadable: string;
  contentType: string;
  accessUrl: string;
  fileCategory: string;
  uploaderId: EntityId;
  uploaderName: string;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  lastAccessTime: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  /** 时长（秒），音视频文件 */
  duration?: number;
  /** 分辨率，如 "1920x1080" */
  resolution?: string;
  /** 码率（kbps） */
  bitrate?: number;
  /** 转码状态：PENDING/PROCESSING/DONE/FAILED */
  transcodeStatus?: string;
  /** HLS播放URL */
  playUrl?: string;
}

/**
 * 文件统计接口
 */
export interface FileStatistics {
  totalCount: number;
  totalSize: number;
  totalSizeReadable: string;
  categoryCount: Record<string, number>;
  todayCount: number;
}

/**
 * 文件管理服务
 */
export const fileManagementService = {
  /**
   * 上传文件
   */
  uploadFile: async (file: File, isPublic: boolean = false): Promise<FileMetadata> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPublic', String(isPublic));

    const response = await (http as any).postForm('/document/file-management/upload', formData);

    return response;
  },

  /**
   * 获取文件列表
   */
  getFileList: async (): Promise<FileMetadata[]> => {
    const response = await http.get('/document/file-management/list');
    return response;
  },

  /**
   * 按分类获取文件列表
   */
  getFileListByCategory: async (category: string): Promise<FileMetadata[]> => {
    const response = await http.get(`/document/file-management/list/${category}`);
    return response;
  },

  /**
   * 获取文件详情
   */
  getFileDetail: async (fileId: number): Promise<FileMetadata> => {
    const response = await http.get(`/document/file-management/detail/${fileId}`);
    return response;
  },

  /**
   * 重命名文件
   */
  renameFile: async (fileId: number, newFileName: string): Promise<boolean> => {
    const response = await http.put(`/document/file-management/rename/${fileId}`, null, {
      params: { newFileName },
    });
    return response;
  },

  /**
   * 删除文件
   */
  deleteFile: async (fileId: number): Promise<boolean> => {
    const response = await http.delete(`/document/file-management/delete/${fileId}`);
    return response;
  },

  /**
   * 批量删除文件
   */
  batchDeleteFiles: async (fileIds: number[]): Promise<number> => {
    const response = await http.delete('/document/file-management/batch-delete', {
      data: fileIds,
    });
    return response;
  },

  /**
   * 更新文件权限
   */
  updateFilePermission: async (fileId: number, isPublic: boolean): Promise<boolean> => {
    const response = await http.put(`/document/file-management/permission/${fileId}`, null, {
      params: { isPublic },
    });
    return response;
  },

  /**
   * 下载文件
   */
  downloadFile: async (fileId: number): Promise<boolean> => {
    const response = await http.post(`/document/file-management/download/${fileId}`);
    return response;
  },

  /**
   * 获取文件统计信息
   */
  getFileStatistics: async (): Promise<FileStatistics> => {
    const response = await http.get('/document/file-management/statistics');
    return response;
  },

  /**
   * 复制文件
   */
  copyFile: async (fileId: number): Promise<FileMetadata> => {
    const response = await http.post(`/document/file-management/copy/${fileId}`);
    return response;
  },

  /**
   * 搜索文件
   */
  searchFiles: async (keyword: string): Promise<FileMetadata[]> => {
    const response = await http.get('/document/file-management/search', {
      params: { keyword },
    });
    return response;
  },

  /**
   * 获取HLS播放URL（kb-file服务）
   * 注意：此URL由ReactPlayer直接请求，不走axios，因此需要完整路径含/api前缀
   */
  getStreamUrl: (fileId: number): string => {
    return `/api/files/stream/${fileId}/master.m3u8`;
  },

  /**
   * 获取媒体流URL（kb-document代理，用于音视频直接播放）
   * 注意：此URL由ReactPlayer直接请求，不走axios，因此需要完整路径含/api前缀
   */
  getMediaStreamUrl: (fileId: number): string => {
    return `/api/document/file-management/stream/${fileId}`;
  },

  /**
   * 获取缩略图URL
   */
  getThumbnailUrl: (fileId: number): string => {
    return `/api/files/thumbnail/${fileId}`;
  },

  /**
   * 获取 PPTX 幻灯片图片（Base64 PNG）
   */
  getPptxSlideImages: async (fileId: number): Promise<string[]> => {
    const response = await http.get(`/document/file-management/preview/${fileId}/slides`);
    return response;
  },
};

export default fileManagementService;
