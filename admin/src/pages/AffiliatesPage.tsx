import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, InputNumber,
  Tag, Space, Typography, Switch, message, Card, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_AFFILIATES, type Affiliate } from '../api/client';

const { Text } = Typography;
const { TextArea } = Input;

const TYPE_META: Record<string, { label: string; color: string; description: string }> = {
  STAY:            { label: 'Stay',            color: '#6B1A2C', description: 'Hotels, dharamshalas, and homestays near temples' },
  JOURNEY:         { label: 'Journey',         color: '#1F5E4A', description: 'Trains, buses, cabs, and pilgrimage packages' },
  YATRA_ESSENTIALS:{ label: 'Yatra Essentials', color: '#B87A00', description: 'Puja kits, prasad, clothing, and pilgrimage gear' },
};

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(MOCK_AFFILIATES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (a: Affiliate) => { setEditing(a); form.setFieldsValue(a); setModalOpen(true); };

  const onSave = () => {
    form.validateFields().then(values => {
      if (editing) {
        setAffiliates(prev => prev.map(a => a.id === editing.id ? { ...a, ...values } : a));
        message.success('Affiliate updated');
      } else {
        const newAffiliate: Affiliate = {
          ...values,
          id: `a${Date.now()}`,
          enabled: true,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setAffiliates(prev => [...prev, newAffiliate]);
        message.success('Affiliate added successfully');
      }
      setModalOpen(false);
    });
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    setAffiliates(prev => prev.map(a => a.id === id ? { ...a, enabled } : a));
    message.success(enabled ? 'Affiliate activated' : 'Affiliate deactivated');
  };

  const columns: ColumnsType<Affiliate> = [
    {
      title: 'Affiliate',
      key: 'name',
      render: (_, a) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{a.name}</Text>
          {a.websiteUrl && (
            <a href={a.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: '#9A5A2A' }}>
              <LinkOutlined style={{ marginRight: 4 }} />{a.websiteUrl.replace('https://', '')}
            </a>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      filters: Object.entries(TYPE_META).map(([value, { label }]) => ({ text: label, value })),
      onFilter: (value, record) => record.type === value,
      render: (type) => {
        const meta = TYPE_META[type];
        return meta ? (
          <Tag style={{ borderRadius: 10, fontSize: 11, fontWeight: 600, color: meta.color, borderColor: `${meta.color}30`, background: `${meta.color}10` }}>
            {meta.label}
          </Tag>
        ) : <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (v) => <Text type="secondary" style={{ fontSize: 13 }}>{v ?? '—'}</Text>,
    },
    {
      title: 'Commission',
      dataIndex: 'commissionPct',
      align: 'center',
      render: (v) => v ? <Text strong style={{ color: '#1F8A5B' }}>{v}%</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, a) => (
        <Text type="secondary" style={{ fontSize: 12 }}>{a.contactEmail ?? a.contactPhone ?? '—'}</Text>
      ),
    },
    {
      title: 'Active',
      key: 'enabled',
      align: 'center',
      render: (_, a) => (
        <Switch checked={a.enabled} onChange={(v) => toggleEnabled(a.id, v)} size="small" />
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: (_, a) => (
        <Tooltip title="Edit affiliate">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(a)} style={{ borderRadius: 8 }} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {/* Type summary cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {Object.entries(TYPE_META).map(([key, { label, color, description }]) => {
          const count = affiliates.filter(a => a.type === key && a.enabled).length;
          return (
            <Card key={key} style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(74,18,32,0.07)' }} bodyStyle={{ padding: '16px 20px' }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
              <div style={{ fontWeight: 700, fontSize: 24, color, marginTop: 4 }}>{count} <Text style={{ fontSize: 12, color: '#9A5A2A', fontWeight: 400 }}>active</Text></div>
              <Text type="secondary" style={{ fontSize: 11 }}>{description}</Text>
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: '#3A0E1A' }}>Affiliates</Typography.Title>
          <Text type="secondary">{affiliates.length} total · {affiliates.filter(a => a.enabled).length} active</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ borderRadius: 8, fontWeight: 600 }}>
          Add Affiliate
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(74,18,32,0.07)' }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={affiliates}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>

      {/* Add / Edit modal */}
      <Modal
        title={editing ? 'Edit Affiliate' : 'Add Affiliate'}
        open={modalOpen}
        onOk={onSave}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Save changes' : 'Add affiliate'}
        width={560}
        okButtonProps={{ style: { borderRadius: 8, fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} requiredMark={false}>
          <Form.Item name="name" label="Affiliate Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Dharamshala Network" />
          </Form.Item>

          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select
              placeholder="Select type"
              options={Object.entries(TYPE_META).map(([value, { label, description }]) => ({
                value,
                label: (
                  <div>
                    <Text strong>{label}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{description}</Text>
                  </div>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Brief description of what this affiliate offers…" />
          </Form.Item>

          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="websiteUrl" label="Website URL" style={{ flex: 1, marginBottom: 16 }}>
              <Input placeholder="https://example.com" />
            </Form.Item>
            <Form.Item name="commissionPct" label="Commission %" style={{ width: 130, marginBottom: 16 }}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="10" addonAfter="%" />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="contactEmail" label="Contact Email" style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="partner@example.com" />
            </Form.Item>
            <Form.Item name="contactPhone" label="Contact Phone" style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="+91 98765 43210" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
