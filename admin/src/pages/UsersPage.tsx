import { useState } from 'react';
import {
  Table, Tag, Button, Input, Space, Typography, Popconfirm,
  Avatar, Tooltip, message, Card, Modal, Form, Select,
} from 'antd';
import {
  SearchOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_USERS, type AdminUser } from '../api/client';

const { Text } = Typography;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Jammu & Kashmir','Ladakh','Delhi','Puducherry',
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const toggleBlock = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u));
    const user = users.find(u => u.id === userId);
    message.success(`${user?.name} has been ${user?.blocked ? 'unblocked' : 'blocked'}`);
  };

  const onCreateUser = () => {
    form.validateFields().then(values => {
      const newUser: AdminUser = {
        id: `u${Date.now()}`,
        name: values.name,
        phone: values.phone,
        email: values.email,
        city: values.city,
        state: values.state,
        joinedAt: new Date().toISOString().split('T')[0],
        templesVisited: 0,
        blocked: false,
        lastActive: 'just now',
      };
      setUsers(prev => [newUser, ...prev]);
      message.success(`Test user "${newUser.name}" created`);
      form.resetFields();
      setCreateOpen(false);
    });
  };

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) || u.state?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'User',
      key: 'user',
      render: (_, u) => (
        <Space>
          <Avatar
            size={36}
            style={{ background: u.blocked ? '#999' : '#6B1A2C', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
          >
            {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', lineHeight: '1.3' }}>{u.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{u.phone}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, u) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {u.city ? `${u.city}, ` : ''}{u.state ?? '—'}
        </Text>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      sorter: (a, b) => a.joinedAt.localeCompare(b.joinedAt),
      render: (v) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Temples',
      dataIndex: 'templesVisited',
      align: 'center',
      sorter: (a, b) => a.templesVisited - b.templesVisited,
      render: (v) => <Text strong style={{ color: '#6B1A2C' }}>{v}</Text>,
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      render: (v) => <Text type="secondary" style={{ fontSize: 13 }}>{v ?? '—'}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      filters: [
        { text: 'Active', value: false },
        { text: 'Blocked', value: true },
      ],
      onFilter: (value, record) => record.blocked === value,
      render: (_, u) => (
        <Tag
          color={u.blocked ? 'error' : 'success'}
          style={{ borderRadius: 12, fontWeight: 600, fontSize: 11 }}
        >
          {u.blocked ? 'Blocked' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, u) => (
        <Popconfirm
          title={u.blocked ? 'Unblock this user?' : 'Block this user?'}
          description={u.blocked
            ? 'They will regain access to all features.'
            : 'They will lose access to all app functionality.'}
          onConfirm={() => toggleBlock(u.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: !u.blocked }}
        >
          <Tooltip title={u.blocked ? 'Unblock' : 'Block user'}>
            <Button
              size="small"
              danger={!u.blocked}
              icon={u.blocked ? <CheckCircleOutlined /> : <StopOutlined />}
              style={{ borderRadius: 8 }}
            >
              {u.blocked ? 'Unblock' : 'Block'}
            </Button>
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: '#3A0E1A' }}>Users</Typography.Title>
          <Text type="secondary">{users.length} total · {users.filter(u => u.blocked).length} blocked</Text>
        </div>
        <Space>
          <Input
            placeholder="Search by name, phone or state…"
            prefix={<SearchOutlined style={{ color: '#9A5A2A' }} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 260, borderRadius: 8 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            Create Test User
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(74,18,32,0.07)' }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `${total} users` }}
          rowClassName={(u) => u.blocked ? 'blocked-row' : ''}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>

      {/* Create test user modal */}
      <Modal
        title="Create Test User"
        open={createOpen}
        onOk={onCreateUser}
        onCancel={() => { setCreateOpen(false); form.resetFields(); }}
        okText="Create User"
        width={480}
        okButtonProps={{ style: { borderRadius: 8, fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
          Test users are created directly — no OTP required. Use them to test all app features from a fresh account.
        </Text>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Test User 1" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Required' }, { pattern: /^\+?[0-9]{10,13}$/, message: '10–13 digit phone number' }]}
          >
            <Input placeholder="+919000000001" />
          </Form.Item>

          <Form.Item name="email" label="Email (optional)">
            <Input placeholder="test@example.com" />
          </Form.Item>

          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="city" label="City (optional)" style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="Mumbai" />
            </Form.Item>
            <Form.Item name="state" label="State (optional)" style={{ flex: 1, marginBottom: 0 }}>
              <Select
                placeholder="Select state"
                showSearch
                allowClear
                options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      <style>{`.blocked-row td { opacity: 0.55; }`}</style>
    </div>
  );
}
