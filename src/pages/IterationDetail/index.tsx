/*
 * @Author: zhouyou@werun
 * @Descriptions: 迭代详情页面
 * @TodoList: 无
 * @Date: 2020-03-16 16:58:45
 * @Last Modified by: zhouyou@werun
 * @Last Modified time: 2020-03-29 14:49:41
 */
import React, { memo } from 'react';
import { useParams } from 'react-router-dom';
import { Tag } from 'antd';
import {
  ClockCircleOutlined,
  BranchesOutlined,
  AppstoreOutlined,
  CodepenOutlined,
  UserOutlined
} from '@ant-design/icons';
import PublishTable from '@/components/PublishTable';
import Title from '@/components/Title';
import BreadcrumbNavbar from '@/components/BreadcrumbNavbar';
import {
  getPublishListRequest,
  getIterationDetailRequest
} from '@/service/apis';
import {
  PublishInfo,
  GetPublishListParams,
  IterationDetail
} from '@/service/types';
import { formatTimeToInterval } from '@/utils';
import useList from '@/utils/hooks/useList';
import styles from './index.module.scss';
import useAsyncState from '@/utils/hooks/useAsyncState';

interface InitialParams {
  userId: number;
  appId: number;
  iterationId: number;
  publishType: string[];
  publishEnv: string[];
  publishStatus: string[];
}

const excludeColumns: string[] = ['iterationName', 'version'];
const PAGE_SIZE = 7;

const initialState = {
  iterationName: '暂无',
  iterationStatus: '3001',
  description: '暂无',
  createTime: '0',
  branch: '暂无',
  version: '暂无',
  creator: '暂无',
  master: '暂无'
};

const getInitParams = (appId: number, iterationId: number) => {
  return (): InitialParams => {
    const params: any = {
      userId: parseInt(sessionStorage.getItem('userId') || ''),
      appId,
      iterationId,
      publishType: [],
      publishEnv: [],
      publishStatus: []
    };

    return params;
  };
};

const getIterationStatus = (value: string): JSX.Element => {
  switch (value) {
    case '3001':
      return <Tag color="green">已完成</Tag>;
    case '3002':
      return <Tag color="blue">进行中</Tag>;
    default:
      return <Tag color="red">已废弃</Tag>;
  }
};

const IterationInfo = (props: { iterationId: number }): JSX.Element => {
  const { iterationId } = props;
  const [iterationDetail] = useAsyncState<IterationDetail>(initialState, () =>
    getIterationDetailRequest({
      iterationId
    })
  );
  const {
    iterationName,
    iterationStatus,
    description,
    createTime,
    branch,
    version,
    creator,
    master
  } = iterationDetail;

  return (
    <div className={styles.iterationInfo}>
      <Title title="迭代详情" />
      <div className={styles.info}>
        <div className={styles.basicInfo}>
          <div>
            {getIterationStatus(iterationStatus)}
            <span className={styles.title}>{iterationName}</span>
          </div>
          <div className={styles.description}>
            {description || '迭代未填写任何描述'}
          </div>
        </div>
        <div className={styles.publishInfo}>
          <div className={styles.infoWrapper}>
            <ClockCircleOutlined />
            <span className={styles.infoValue}>
              {formatTimeToInterval(parseInt(createTime || ''))}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <BranchesOutlined />
            <span className={styles.infoValue}>{branch}</span>
          </div>
          <div className={styles.infoWrapper}>
            <AppstoreOutlined />
            <span className={styles.infoValue}>{version}</span>
          </div>
          <div className={styles.infoWrapper}>
            <UserOutlined />
            <span className={styles.infoValue}>{creator}</span>
          </div>
          <div className={styles.infoWrapper}>
            <CodepenOutlined />
            <span className={styles.infoValue}>{master}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(function IterationDetail() {
  const { iterationInfo } = useParams();
  const { appId, iterationId, appName, iterationName } = JSON.parse(
    decodeURIComponent(iterationInfo || '{}')
  );
  const { loading, list, total, page, onPageChange } = useList<
    PublishInfo,
    GetPublishListParams
  >(PAGE_SIZE, getInitParams(appId, iterationId), getPublishListRequest);

  return (
    <div className={styles.iterationDetail}>
      <BreadcrumbNavbar
        mode={2}
        appId={appId}
        appName={appName}
        iterationName={iterationName}
      />
      <div className={styles.content}>
        <IterationInfo iterationId={iterationId} />
        <div className={styles.publishList}>
          <Title title="发布记录" />
          <div className={styles.tableWrapper}>
            <PublishTable
              excludeColumns={excludeColumns}
              data={list}
              loading={loading}
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
