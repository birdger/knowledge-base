import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  type?: 'documents' | 'search' | 'generic';
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  message,
  actionText,
  onAction,
}) => {
  const getEmptyConfig = () => {
    switch (type) {
      case 'documents':
        return {
          icon: <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          description: message || '暂无文档',
        };
      case 'search':
        return {
          image: Empty.PRESENTED_IMAGE_SIMPLE,
          description: message || '未找到相关内容',
        };
      default:
        return {
          image: Empty.PRESENTED_IMAGE_SIMPLE,
          description: message || '暂无数据',
        };
    }
  };

  const config = getEmptyConfig();

  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <Empty
        {...config}
        description={
          <span style={{ fontSize: 16, color: '#8c8c8c' }}>
            {config.description}
          </span>
        }
      >
        {actionText && onAction && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
