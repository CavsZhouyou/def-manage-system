/*
 * @Author: zhouyou@werun
 * @Descriptions: 不通过审阅 Modal
 * @TodoList: 无
 * @Date: 2020-03-25 17:59:38
 * @Last Modified by: zhouyou@werun
 * @Last Modified time: 2020-03-25 19:50:42
 */

import React, { memo, useState, useCallback } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { ReviewPublishParams } from '@/service/types';
import { reviewPublishRequest } from '@/service/apis';

interface Props {
  appId: number;
  reviewId: number;
  visible: boolean;
  hideModal: () => void;
  updateList: () => void;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 }
  }
};

export default memo(function NotPassModal(props: Props) {
  const { appId, visible, hideModal, reviewId, updateList } = props;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const notPassReview = useCallback(
    async (props: ReviewPublishParams): Promise<void> => {
      setLoading(true);

      const result = await reviewPublishRequest(props);

      if (result.success) {
        message.success('审核成功！');

        // 清空表单，隐藏 modal
        form.resetFields();
        setLoading(false);
        hideModal();
        updateList();
      } else {
        message.error(result.message);
        setLoading(false);
      }
    },
    [form, hideModal, updateList]
  );

  const submit = useCallback(() => {
    form.validateFields().then(values => {
      const { failReason } = values;

      notPassReview({
        appId,
        userId: sessionStorage.getItem('userId') || '',
        reviewId,
        reviewResult: '7002',
        failReason
      });
    });
  }, [reviewId, appId, notPassReview, form]);

  const onCancel = useCallback(() => {
    form.resetFields();
    hideModal();
  }, []);

  return (
    <div>
      <Modal
        title="审阅结果"
        visible={visible}
        onOk={submit}
        onCancel={onCancel}
        confirmLoading={loading}
        okType="danger"
        okText="不通过"
      >
        <Form
          {...formItemLayout}
          form={form}
          onFinish={submit}
          labelAlign="left"
        >
          <Form.Item
            name="failReason"
            label="未通过原因"
            rules={[
              {
                required: true,
                message: '未通过原因不能为空！'
              }
            ]}
          >
            <Input.TextArea rows={3} placeholder="请输入未通过原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});
