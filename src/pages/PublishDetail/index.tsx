/*
 * @Author: zhouyou@werun
 * @Descriptions:
 * @TodoList: 无
 * @Date: 2020-03-16 20:20:04
 * @Last Modified by: zhouyou@werun
 * @Last Modified time: 2020-03-29 12:12:00
 */

import React, { memo } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, Tag, Avatar, Radio } from 'antd';
import Title from '@/components/Title';
import BreadcrumbNavbar from '@/components/BreadcrumbNavbar';
import { PublishDetail, PublishLog } from '@/service/types';
import { getPublishDetailRequest, getPublishLogRequest } from '@/service/apis';
import { publishTypes, GOGS_HOST } from '@/constants';
import { formatTimeToInterval } from '@/utils';
import useModal from '@/utils/hooks/useModal';
import useAsyncState from '@/utils/hooks/useAsyncState';
import SelectReviewerModal from './components/SelectReviewerModal';
import styles from './index.module.scss';

const initialState = {
  publishId: 0,
  publisherId: '',
  publisher: '暂无',
  publisherAvatar: '暂无',
  createTime: '0',
  commit: '暂无',
  // publishType: '1002',
  publishEnv: 'online',
  publishStatus: '4003',
  reviewId: 0,
  reviewStatus: '7003',
  failReason: '暂无'
};

const viewFailReason = (reason: string): void => {
  Modal.info({
    title: '未通过原因',
    content: reason
  });
};

const getPublishStatus = (value: string): JSX.Element => {
  switch (value) {
    case '4001':
      return <Tag color="green">发布成功</Tag>;
    case '4002':
      return <Tag color="red">发布失败</Tag>;
    default:
      return <Tag color="orange">未发布</Tag>;
  }
};

const getPublishEnv = (value: string): JSX.Element => {
  switch (value) {
    case 'daily':
      return <Tag color="#2db7f5">日常</Tag>;
    default:
      return <Tag color="#f50">线上</Tag>;
  }
};

const getReviewStatus = (
  publisherId: string,
  value: string,
  showModal: any,
  failReason?: string
): JSX.Element => {
  const userId = sessionStorage.getItem('userId') || '';

  switch (value) {
    case '7001':
      return <Tag color="green">通过</Tag>;
    case '7002':
      return (
        <span>
          <Tag color="red">未通过</Tag>
          <Button
            type="link"
            onClick={() =>
              viewFailReason(failReason || '审核者未填写未通过原因')
            }
          >
            查看原因
          </Button>
        </span>
      );
    case '7003':
      return <Tag color="orange">审阅中</Tag>;
    default:
      return publisherId === userId ? (
        <Button className={styles.link} type="link" onClick={() => showModal()}>
          发起审阅
        </Button>
      ) : (
        <Tag color="orange">未创建</Tag>
      );
  }
};

const PublishInfo = (props: {
  appId: number;
  appName: string;
  iterationId: number;
  publishId: number;
}): JSX.Element => {
  const { appId, appName, iterationId, publishId } = props;
  const [visible, showModal, hideModal] = useModal();
  const [publishDetail] = useAsyncState<PublishDetail>(initialState, () =>
    getPublishDetailRequest({
      publishId
    })
  );

  const {
    publisherId,
    publisher,
    publisherAvatar,
    commit,
    createTime,
    // publishType,
    publishEnv,
    publishStatus,
    reviewId,
    reviewStatus,
    failReason
  } = publishDetail;
  // const publishTypeName = publishTypes.filter(
  //   item => item.value === publishType
  // )[0].name;

  const commitAddress = `${GOGS_HOST}/${appName}/commit/${commit}`;

  return (
    <div className={styles.publishInfo}>
      <Title title="发布详情" />
      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.label}>任务 ID：</span>
          <span className={styles.taskId}>{publishId}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>创建时间：</span>
          <span className={styles.createTime}>
            {formatTimeToInterval(parseInt(createTime || ''))}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>发布人：</span>
          <div className={styles.publisher}>
            <Avatar
              className={styles.publisherAvatar}
              size={30}
              src={publisherAvatar}
            />
            {publisher}
          </div>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>commit：</span>
          <a href={commitAddress} target="_blank">
            {commit}
          </a>
        </div>
        {/* <div className={styles.infoItem}>
          <span className={styles.label}>类型：</span>
          <span className={styles.type}>{publishTypeName}</span>
        </div> */}
        <div className={styles.infoItem}>
          <span className={styles.label}>环境：</span>
          {getPublishEnv(publishEnv)}
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>发布状态：</span>
          {getPublishStatus(publishStatus)}
        </div>
        <br />
        <br />
        {publishEnv === 'online' && (
          <div className={styles.infoItem}>
            <span className={styles.label}>审阅状态：</span>
            {getReviewStatus(publisherId, reviewStatus, showModal, failReason)}
            <SelectReviewerModal
              visible={visible}
              publishInfo={{
                appId,
                iterationId,
                publishId
              }}
              hideModal={hideModal}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const PublishResult = (props: { publishId: number }): JSX.Element => {
  const { publishId } = props;
  const [logData] = useAsyncState<PublishLog>(
    { log: 'initial ref transaction called with existing refs' },
    () =>
      getPublishLogRequest({
        publishId
      })
  );

  return (
    <div className={styles.publishResult}>
      <div className={styles.header}>
        <Title title="发布日志" />
      </div>
      <Radio.Group
        className={styles.displaySwitch}
        defaultValue="a"
        buttonStyle="solid"
      >
        <Radio.Button value="a">结果</Radio.Button>
        <Radio.Button value="b">日志</Radio.Button>
      </Radio.Group>
      {/* <Descriptions bordered size="small">
        <Descriptions.Item label="Product">Cloud Database</Descriptions.Item>
        <Descriptions.Item label="Billing">Prepaid</Descriptions.Item>
        <Descriptions.Item label="time">18:00:00</Descriptions.Item>
        <Descriptions.Item label="Amount">$80.00</Descriptions.Item>
        <Descriptions.Item label="Discount">$20.00</Descriptions.Item>
      </Descriptions> */}
      <div
        className={styles.publishLog}
        dangerouslySetInnerHTML={{
          __html: logData.log
            .replace(/\\r\\r\\n/g, '<br/>')
            .replace(/\\n/g, '<br/>')
        }}
      ></div>
    </div>
  );
};

export default memo(function PublishDetail() {
  const { publishInfo } = useParams();
  const { appId, iterationId, appName, iterationName, publishId } = JSON.parse(
    decodeURIComponent(publishInfo || '{}')
  );

  return (
    <div className={styles.publishDetail}>
      <BreadcrumbNavbar
        mode={3}
        appId={appId}
        appName={appName}
        iterationId={iterationId}
        iterationName={iterationName}
      />
      <div className={styles.content}>
        <PublishInfo
          appId={appId}
          appName={appName}
          iterationId={iterationId}
          publishId={publishId}
        />
        <PublishResult publishId={publishId} />
      </div>
    </div>
  );
});
