import { useState } from 'react';
import { Switch, Typography, Tag, Card, Row, Col, Popconfirm, message } from 'antd';
import { MOCK_FLAGS, type FeatureFlag } from '../api/client';

const { Text, Title } = Typography;

const CATEGORY_META: Record<string, { label: string; color: string; description: string }> = {
  CORE:      { label: 'Core',      color: '#6B1A2C', description: 'Fundamental app features' },
  SOCIAL:    { label: 'Social',    color: '#1F5E4A', description: 'User-generated content and community' },
  DISCOVERY: { label: 'Discovery', color: '#1F5E4A', description: 'Finding and connecting with users' },
  COMMERCE:  { label: 'Commerce',  color: '#B87A00', description: 'Affiliate partnerships and booking' },
};

function FlagCard({ flag, onToggle }: { flag: FeatureFlag; onToggle: (key: string, enabled: boolean) => void }) {
  const catMeta = CATEGORY_META[flag.category];
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);

  const handleChange = (value: boolean) => {
    setPendingValue(value);
  };

  const handleConfirm = () => {
    if (pendingValue !== null) {
      onToggle(flag.key, pendingValue);
      setPendingValue(null);
    }
  };

  const handleCancel = () => {
    setPendingValue(null);
  };

  const displayEnabled = pendingValue !== null ? pendingValue : flag.enabled;

  return (
    <Card
      style={{
        borderRadius: 12, border: 'none',
        boxShadow: '0 2px 12px rgba(74,18,32,0.07)',
        borderLeft: `4px solid ${flag.enabled ? '#1F8A5B' : '#E0D5CC'}`,
        transition: 'border-color 0.3s',
      }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text strong style={{ fontSize: 15, color: '#3A0E1A' }}>{flag.label}</Text>
            <Tag
              style={{ fontSize: 10, padding: '0 6px', borderRadius: 6, fontWeight: 600,
                color: catMeta?.color, borderColor: `${catMeta?.color}30`, background: `${catMeta?.color}10` }}
            >
              {catMeta?.label ?? flag.category}
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>{flag.description}</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Last changed: {flag.updatedAt}{flag.updatedBy ? ` by ${flag.updatedBy}` : ''}
            </Text>
          </div>
        </div>

        <Popconfirm
          title={`${pendingValue ?? !flag.enabled ? 'Enable' : 'Disable'} "${flag.label}"?`}
          description={
            pendingValue ?? !flag.enabled
              ? 'This will activate the feature for all users immediately.'
              : 'This will disable the feature for all users immediately.'
          }
          open={pendingValue !== null}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          okText="Confirm"
          cancelText="Cancel"
          okButtonProps={{ danger: !(pendingValue ?? !flag.enabled) }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Switch
              checked={displayEnabled}
              onChange={handleChange}
              style={{ background: displayEnabled ? '#1F8A5B' : undefined }}
            />
            <Text
              style={{ fontSize: 11, fontWeight: 600, color: displayEnabled ? '#1F8A5B' : '#9A5A2A' }}
            >
              {displayEnabled ? 'ON' : 'OFF'}
            </Text>
          </div>
        </Popconfirm>
      </div>
    </Card>
  );
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FLAGS);

  const onToggle = (key: string, enabled: boolean) => {
    setFlags(prev => prev.map(f =>
      f.key === key
        ? { ...f, enabled, updatedAt: new Date().toISOString().split('T')[0], updatedBy: 'admin' }
        : f
    ));
    const flag = flags.find(f => f.key === key);
    message.success(`${flag?.label} ${enabled ? 'enabled' : 'disabled'}`);
  };

  const grouped = Object.entries(CATEGORY_META).map(([cat, meta]) => ({
    cat, meta,
    flags: flags.filter(f => f.category === cat),
  }));

  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#3A0E1A' }}>Feature Flags</Title>
        <Text type="secondary">{enabledCount} of {flags.length} features enabled · Changes apply instantly for all users</Text>
      </div>

      {grouped.map(({ cat, meta, flags: catFlags }) => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Tag
              style={{ fontSize: 12, padding: '3px 10px', borderRadius: 8, fontWeight: 600,
                flexShrink: 0,
                color: meta.color, borderColor: `${meta.color}30`, background: `${meta.color}10` }}
            >
              {meta.label}
            </Tag>
            <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>{meta.description}</Text>
            <div style={{ flex: 1, height: 1, background: '#E0D5CC', marginLeft: 4 }} />
          </div>

          <Row gutter={[14, 14]}>
            {catFlags.map(flag => (
              <Col xs={24} md={12} key={flag.key}>
                <FlagCard flag={flag} onToggle={onToggle} />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
}
