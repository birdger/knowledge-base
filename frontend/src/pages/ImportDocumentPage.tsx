import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudUploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileMarkdownOutlined,
  EyeOutlined,
  ClearOutlined,
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { App } from 'antd';
import { useAppStore } from '@/stores';
import { documentService } from '@/services';
import { formatFileSize } from '@/utils';

import './ImportDocumentPage.css';

interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  documentId?: string;
}

export const ImportDocumentPage: React.FC = () => {
  const { message } = App.useApp();
  const maxFileSize = useAppStore((s) => s.maxFileSize);
  const allowedFileTypes = useAppStore((s) => s.allowedFileTypes);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hasImported, setHasImported] = useState(false);


  const supportedFormats = [
    {
      name: 'PDF文档',
      ext: '.pdf',
      icon: <FilePdfOutlined />,
      color: '#FF5722',
    },
    {
      name: 'Word文档',
      ext: '.doc, .docx',
      icon: <FileWordOutlined />,
      color: '#2B579A',
    },
    {
      name: 'Excel表格',
      ext: '.xls, .xlsx',
      icon: <FileExcelOutlined />,
      color: '#217346',
    },
    {
      name: 'PPT演示',
      ext: '.ppt, .pptx',
      icon: <FilePptOutlined />,
      color: '#D24726',
    },
    {
      name: '纯文本',
      ext: '.txt',
      icon: <FileTextOutlined />,
      color: '#616161',
    },
    {
      name: 'Markdown',
      ext: '.md',
      icon: <FileMarkdownOutlined />,
      color: '#083FA1',
    },
  ];

  const features = [
    {
      icon: <RocketOutlined />,
      title: '快速导入',
      description: '批量上传，高效处理',
    },
    {
      icon: <SafetyOutlined />,
      title: '安全可靠',
      description: '本地存储，数据安全',
    },
    {
      icon: <ThunderboltOutlined />,
      title: '智能解析',
      description: '自动识别，精准提取',
    },
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const allowedExts = allowedFileTypes.split(',').map(t => {
      const trimmed = t.trim().toLowerCase();
      return trimmed.startsWith('.') ? trimmed : '.' + trimmed;
    });

    const newFiles: FileItem[] = [];

    for (const file of Array.from(files)) {
      // 客户端文件类型校验
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExts.includes(ext)) {
        message.error(`不支持的文件类型：${ext}，允许的类型：${allowedFileTypes}`);
        continue;
      }
      // 客户端文件大小校验
      if (file.size > maxFileSize) {
        const maxMB = Math.round(maxFileSize / 1048576 * 10) / 10;
        message.error(`文件 ${file.name} 大小超过 ${maxMB}MB 限制`);
        continue;
      }

      newFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: 'pending',
        progress: 0,
      });
    }

    if (newFiles.length > 0) {
      setFileList((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveFile = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setFileList([]);
  };


  const getFileIcon = (fileName: string): { icon: React.ReactNode; color: string } => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
      pdf: { icon: <FilePdfOutlined />, color: '#FF5722' },
      doc: { icon: <FileWordOutlined />, color: '#2B579A' },
      docx: { icon: <FileWordOutlined />, color: '#2B579A' },
      xls: { icon: <FileExcelOutlined />, color: '#217346' },
      xlsx: { icon: <FileExcelOutlined />, color: '#217346' },
      ppt: { icon: <FilePptOutlined />, color: '#D24726' },
      pptx: { icon: <FilePptOutlined />, color: '#D24726' },
      txt: { icon: <FileTextOutlined />, color: '#616161' },
      md: { icon: <FileMarkdownOutlined />, color: '#083FA1' },
    };
    return iconMap[ext || ''] || { icon: <FileTextOutlined />, color: '#1890FF' };
  };

  const handleUpload = async () => {
    const pendingFiles = fileList.filter((item) => item.status === 'pending');
    if (pendingFiles.length === 0) {
      message.warning('请先选择要上传的文件');
      return;
    }

    setIsUploading(true);

    for (const fileItem of pendingFiles) {
      try {
        setFileList((prev) =>
          prev.map((item) =>
            item.id === fileItem.id ? { ...item, status: 'uploading', progress: 0 } : item
          )
        );

        // 模拟进度的定时器
        const progressInterval = setInterval(() => {
          setFileList((prev) =>
            prev.map((item) => {
              if (item.id === fileItem.id && item.progress < 90) {
                return { ...item, progress: item.progress + 10 };
              }
              return item;
            })
          );
        }, 200);

        // 使用 uploadAndParseDocument 统一处理所有文件类型（PDF/DOCX/XLSX/PPTX/TXT/MD）
        const result = await documentService.uploadAndParseDocument(fileItem.file);

        clearInterval(progressInterval);

        setFileList((prev) =>
          prev.map((item) =>
            item.id === fileItem.id
              ? { ...item, status: 'success', progress: 100, documentId: result.documentId }
              : item
          )
        );

        setHasImported(true);
        message.success(`${fileItem.file.name} 导入成功 — ${result.contentLength?.toLocaleString() || 0} 字符已解析`);
      } catch (error) {
        console.error('上传失败:', error);
        setFileList((prev) =>
          prev.map((item) =>
            item.id === fileItem.id
              ? { ...item, status: 'error', error: '上传失败，请重试' }
              : item
          )
        );
        message.error(`${fileItem.file.name} 导入失败`);
      }
    }

    setIsUploading(false);
  };

  const handleViewDocument = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const handleViewDrafts = () => {
    navigate('/drafts');
  };

  const retryFile = async (fileItem: FileItem) => {
    try {
      setFileList((prev) =>
        prev.map((item) =>
          item.id === fileItem.id ? { ...item, status: 'uploading', progress: 0, error: undefined } : item
        )
      );

      const progressInterval = setInterval(() => {
        setFileList((prev) =>
          prev.map((item) => {
            if (item.id === fileItem.id && item.progress < 90) {
              return { ...item, progress: item.progress + 10 };
            }
            return item;
          })
        );
      }, 200);

      // 使用 uploadAndParseDocument 重试
      const result = await documentService.uploadAndParseDocument(fileItem.file);

      clearInterval(progressInterval);

      setFileList((prev) =>
        prev.map((item) =>
          item.id === fileItem.id
            ? { ...item, status: 'success', progress: 100, documentId: result.documentId }
            : item
        )
      );

      setHasImported(true);
      message.success(`${fileItem.file.name} 重试导入成功`);
    } catch (error) {
      console.error('重试上传失败:', error);
      setFileList((prev) =>
        prev.map((item) =>
          item.id === fileItem.id
            ? { ...item, status: 'error', error: '上传失败，请重试' }
            : item
        )
      );
      message.error(`${fileItem.file.name} 重试导入失败`);
    }
  };

  return (
    <div className="import-document-page">
      <div className="import-header">
        <div className="header-content">
          <div className="header-icon">
            <CloudUploadOutlined />
          </div>
          <div className="header-text">
            <h1>导入文档</h1>
            <p>支持多种文件格式的批量导入，自动创建文档记录</p>
          </div>
        </div>
      </div>

      <div className="import-content">
        <div className="upload-section">
          <div
            className={`upload-area ${fileList.length > 0 ? 'has-files' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="upload-content">
              <div className="upload-icon-wrapper">
                <CloudUploadOutlined className="upload-main-icon" />
                <div className="upload-bg-effect">
                  <CloudUploadOutlined />
                </div>
              </div>
              <div className="upload-text">
                <h3>点击或拖拽文件到此处上传</h3>
                <p>支持单个或批量上传，单文件最大 {Math.round(maxFileSize / 1048576 * 10) / 10}MB</p>
              </div>
              <button
                className="upload-button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <CloudUploadOutlined />
                选择文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={allowedFileTypes.split(',').map(t => {
                  const ext = t.trim().toLowerCase();
                  if (ext === 'pdf') return 'application/pdf,.pdf';
                  return '.' + ext;
                }).join(',')}
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </div>

          {fileList.length > 0 && (
            <>
              <div className="file-list">
                <div className="file-list-header">
                  <h3>文件列表 ({fileList.length})</h3>
                  <button
                    className="clear-button"
                    onClick={handleClearAll}
                    disabled={isUploading}
                  >
                    <ClearOutlined />
                    清空列表
                  </button>
                </div>
                {fileList.map((item) => {
                  const { icon, color } = getFileIcon(item.file.name);
                  return (
                    <div key={item.id} className={`file-item ${item.status}`}>
                      <div className="file-icon" style={{ color }}>
                        {icon}
                      </div>
                      <div className="file-info">
                        <div className="file-name">{item.file.name}</div>
                        <div className="file-meta">
                          <span className="file-size">{formatFileSize(item.file.size)}</span>
                          {item.status === 'uploading' && (
                            <span className="file-status-text">上传中 {item.progress}%</span>
                          )}
                          {item.status === 'success' && (
                            <span className="file-status-text success">上传成功</span>
                          )}
                          {item.status === 'error' && (
                            <span className="file-status-text error">上传失败</span>
                          )}
                        </div>
                        {item.status === 'uploading' && (
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}
                        {item.status === 'error' && item.error && (
                          <div className="error-message">{item.error}</div>
                        )}
                      </div>
                      <div className="file-actions">
                        {item.status === 'error' && (
                          <button
                            className="action-button retry"
                            onClick={() => retryFile(item)}
                            title="重试"
                          >
                            <ReloadOutlined />
                          </button>
                        )}
                        {item.status === 'success' && item.documentId && (
                          <button
                            className="action-button view"
                            onClick={() => handleViewDocument(item.documentId!)}
                            title="查看文档"
                          >
                            <EyeOutlined />
                          </button>
                        )}
                        <button
                          className="action-button delete"
                          onClick={() => handleRemoveFile(item.id)}
                          title="删除"
                          disabled={item.status === 'uploading'}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="action-buttons">
                <button
                  className="btn-secondary"
                  onClick={handleClearAll}
                  disabled={isUploading}
                >
                  <ClearOutlined />
                  清空列表
                </button>
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={isUploading || fileList.every((item) => item.status !== 'pending')}
                >
                  {isUploading ? (
                    <>
                      <LoadingOutlined />
                      上传中...
                    </>
                  ) : (
                    <>
                      <CloudUploadOutlined />
                      开始上传
                    </>
                  )}
                </button>
                {hasImported && (
                  <button
                    className="btn-drafts"
                    onClick={handleViewDrafts}
                  >
                    <FolderOpenOutlined />
                    查看草稿箱
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="sidebar">
          <div className="sidebar-card">
            <h3>
              <FileTextOutlined />
              支持的格式
            </h3>
            <div className="format-list">
              {supportedFormats.map((format) => (
                <div key={format.name} className="format-item">
                  <div className="format-info">
                    <div className="format-icon" style={{ color: format.color }}>
                      {format.icon}
                    </div>
                    <div className="format-details">
                      <div className="format-name">{format.name}</div>
                      <div className="format-ext">{format.ext}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>
              <ThunderboltOutlined />
              功能特性
            </h3>
            <div className="feature-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content">
                    <div className="feature-title">{feature.title}</div>
                    <div className="feature-description">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card info-card">
            <div className="info-header">
              <InfoCircleOutlined />
              <h3>导入说明</h3>
            </div>
            <div className="info-content">
              <ul>
                <li>单文件最大支持 {Math.round(maxFileSize / 1048576 * 10) / 10}MB</li>
                <li>上传后自动创建草稿文档</li>
                <li>支持在文档列表中继续编辑</li>
                <li>文件按日期分类存储</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportDocumentPage;
