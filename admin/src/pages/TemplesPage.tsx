import { useState } from 'react';
import {
  Table, Button, Input, Modal, Form, Select, InputNumber,
  Tag, Space, Typography, Switch, message, Card, Tooltip, ColorPicker,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, TagsOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_TEMPLES, MOCK_CATEGORIES, type Temple, type TempleCategory } from '../api/client';

const { Text } = Typography;
const { TextArea } = Input;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Jammu & Kashmir','Ladakh','Delhi','Puducherry',
];

function CategoryTag({ catKey, catMap }: { catKey: string; catMap: Record<string, TempleCategory> }) {
  const c = catMap[catKey];
  if (!c) return <Tag style={{ borderRadius: 10, fontSize: 11 }}>{catKey}</Tag>;
  return (
    <Tag style={{ borderRadius: 10, fontSize: 11, fontWeight: 600, color: c.color, borderColor: `${c.color}30`, background: `${c.color}10` }}>
      {c.label}
    </Tag>
  );
}

export default function TemplesPage() {
  const [temples, setTemples] = useState<Temple[]>(MOCK_TEMPLES);
  const [categories, setCategories] = useState<TempleCategory[]>(MOCK_CATEGORIES);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemple, setEditingTemple] = useState<Temple | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm] = Form.useForm();
  const [form] = Form.useForm();

  const catMap = Object.fromEntries(categories.map(c => [c.key, c]));

  const openAdd = () => { setEditingTemple(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (t: Temple) => {
    setEditingTemple(t);
    form.setFieldsValue({ ...t, categories: t.categories });
    setModalOpen(true);
  };

  const onSave = () => {
    form.validateFields().then(values => {
      if (editingTemple) {
        setTemples(prev => prev.map(t => t.id === editingTemple.id ? { ...t, ...values } : t));
        message.success('Temple updated');
      } else {
        const newTemple: Temple = {
          ...values,
          id: `t${Date.now()}`,
          enabled: true,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setTemples(prev => [newTemple, ...prev]);
        message.success('Temple onboarded successfully');
      }
      setModalOpen(false);
    });
  };

  const onCreateCategory = () => {
    catForm.validateFields().then(values => {
      const color = typeof values.color === 'string' ? values.color : (values.color?.toHexString?.() ?? '#6B1A2C');
      const key = values.label.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
      if (catMap[key]) { message.error('A category with this name already exists'); return; }
      const newCat: TempleCategory = { key, label: values.label.trim(), color, isCustom: true };
      setCategories(prev => [...prev, newCat]);
      message.success(`Category "${newCat.label}" created`);
      catForm.resetFields();
      setCatModalOpen(false);
    });
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    setTemples(prev => prev.map(t => t.id === id ? { ...t, enabled } : t));
    message.success(enabled ? 'Temple enabled' : 'Temple disabled');
  };

  const filtered = temples.filter(t =>
    !search ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase()) ||
    t.state.toLowerCase().includes(search.toLowerCase())
  );

  const categoryOptions = categories.map(c => ({
    value: c.key,
    label: (
      <span>
        <Tag style={{ borderRadius: 8, fontSize: 11, marginRight: 6, color: c.color, borderColor: `${c.color}30`, background: `${c.color}10` }}>
          {c.label}
        </Tag>
        {c.isCustom && <Text type="secondary" style={{ fontSize: 11 }}>custom</Text>}
      </span>
    ),
  }));

  const columns: ColumnsType<Temple> = [
    {
      title: 'Temple',
      key: 'temple',
      render: (_, t) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{t.name}</Text>
          {t.deity && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{t.deity}</Text>}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, t) => (
        <div>
          <Text style={{ fontSize: 13 }}>{t.city}</Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{t.state}{t.pincode ? ` · ${t.pincode}` : ''}</Text>
        </div>
      ),
    },
    {
      title: 'Categories',
      key: 'categories',
      render: (_, t) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(t.categories ?? []).map(key => (
            <CategoryTag key={key} catKey={key} catMap={catMap} />
          ))}
        </div>
      ),
      filters: categories.map(c => ({ text: c.label, value: c.key })),
      onFilter: (value, record) => (record.categories ?? []).includes(value as string),
    },
    {
      title: 'Coordinates',
      key: 'coords',
      render: (_, t) => (
        <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
        </Text>
      ),
    },
    {
      title: 'Enabled',
      key: 'enabled',
      align: 'center',
      render: (_, t) => (
        <Switch checked={t.enabled} onChange={(v) => toggleEnabled(t.id, v)} size="small" />
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: (_, t) => (
        <Tooltip title="Edit temple">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(t)} style={{ borderRadius: 8 }} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: '#3A0E1A' }}>Temples</Typography.Title>
          <Text type="secondary">{temples.length} temples · {temples.filter(t => t.enabled).length} enabled</Text>
        </div>
        <Space>
          <Input
            placeholder="Search temples…"
            prefix={<SearchOutlined style={{ color: '#9A5A2A' }} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 240, borderRadius: 8 }}
          />
          <Button icon={<TagsOutlined />} onClick={() => setCatModalOpen(true)} style={{ borderRadius: 8 }}>
            Categories
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ borderRadius: 8, fontWeight: 600 }}>
            Onboard Temple
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(74,18,32,0.07)' }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>

      {/* Add / Edit temple modal */}
      <Modal
        title={editingTemple ? 'Edit Temple' : 'Onboard New Temple'}
        open={modalOpen}
        onOk={onSave}
        onCancel={() => setModalOpen(false)}
        okText={editingTemple ? 'Save changes' : 'Onboard'}
        width={620}
        okButtonProps={{ style: { borderRadius: 8, fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} requiredMark={false}>
          <Form.Item name="name" label="Temple Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Somnath Temple" />
          </Form.Item>

          <Form.Item name="deity" label="Deity / Presiding Deity">
            <Input placeholder="e.g. Shiva" />
          </Form.Item>

          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="city" label="City" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 16 }}>
              <Input placeholder="e.g. Somnath" />
            </Form.Item>
            <Form.Item name="state" label="State" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 16 }}>
              <Select placeholder="Select state" showSearch options={INDIAN_STATES.map(s => ({ value: s, label: s }))} />
            </Form.Item>
            <Form.Item name="pincode" label="Pincode" rules={[{ len: 6, message: '6 digits' }]} style={{ width: 110, marginBottom: 16 }}>
              <Input placeholder="362268" maxLength={6} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="latitude" label="Latitude" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 16 }}>
              <InputNumber style={{ width: '100%' }} placeholder="20.8880" step={0.0001} precision={6} />
            </Form.Item>
            <Form.Item name="longitude" label="Longitude" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 16 }}>
              <InputNumber style={{ width: '100%' }} placeholder="70.4012" step={0.0001} precision={6} />
            </Form.Item>
            <Form.Item name="verificationRadius" label="Radius (m)" style={{ width: 110, marginBottom: 16 }}>
              <InputNumber style={{ width: '100%' }} placeholder="200" min={50} max={2000} />
            </Form.Item>
          </Space>

          <Form.Item
            name="categories"
            label="Categories"
            rules={[{ required: true, type: 'array', min: 1, message: 'Select at least one category' }]}
            extra="Select multiple. Create new categories via the Categories button."
          >
            <Select
              mode="multiple"
              placeholder="Select one or more categories…"
              options={categoryOptions}
              optionFilterProp="label"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Brief description of the temple…" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Category management modal */}
      <Modal
        title="Manage Categories"
        open={catModalOpen}
        onCancel={() => { setCatModalOpen(false); catForm.resetFields(); }}
        footer={null}
        width={520}
      >
        {/* Existing categories list */}
        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>
            All categories ({categories.length})
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map(c => (
              <Tag
                key={c.key}
                style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  color: c.color, borderColor: `${c.color}40`, background: `${c.color}10` }}
              >
                {c.label}
                {c.isCustom && <Text type="secondary" style={{ fontSize: 10, marginLeft: 4 }}>custom</Text>}
              </Tag>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#E8DDD6', margin: '0 0 20px' }} />

        {/* Create new category */}
        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Create New Category</Text>
        <Form form={catForm} layout="vertical" requiredMark={false} onFinish={onCreateCategory}>
          <Space style={{ width: '100%' }} size={12} align="start">
            <Form.Item name="label" label="Name" rules={[{ required: true, message: 'Required' }]} style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="e.g. Navgraha" />
            </Form.Item>
            <Form.Item name="color" label="Color" style={{ marginBottom: 0 }}>
              <ColorPicker defaultValue="#6B1A2C" showText format="hex" />
            </Form.Item>
          </Space>
          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>
              Create Category
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
