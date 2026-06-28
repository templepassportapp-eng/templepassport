import { Row, Col, Card, Statistic, Typography, Tag, List, Avatar } from 'antd';
import {
  UserOutlined, BankOutlined, CheckCircleOutlined,
  TeamOutlined, ArrowUpOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { MOCK_STATS, MOCK_FLAGS } from '../api/client';

const { Title, Text } = Typography;

const STAT_CARDS = [
  { label: 'Total Users',       value: MOCK_STATS.totalUsers,    icon: <UserOutlined />,         color: '#6B1A2C', suffix: '' },
  { label: 'New This Month',    value: MOCK_STATS.newUsersThisMonth, icon: <ArrowUpOutlined />,  color: '#1F8A5B', suffix: '' },
  { label: 'Temples',           value: MOCK_STATS.totalTemples,  icon: <BankOutlined />,         color: '#C49A3A', suffix: '' },
  { label: 'Check-ins',         value: MOCK_STATS.totalCheckIns, icon: <CheckCircleOutlined />,  color: '#E89B2C', suffix: '' },
  { label: 'Posts',             value: MOCK_STATS.totalPosts,    icon: <FileTextOutlined />,     color: '#6B1A2C', suffix: '' },
  { label: 'Active Groups',     value: MOCK_STATS.activeGroups,  icon: <TeamOutlined />,         color: '#1F8A5B', suffix: '' },
];

const CATEGORY_COLOR: Record<string, string> = {
  CORE: '#6B1A2C',
  SOCIAL: '#1F5E4A',
  DISCOVERY: '#1F5E4A',
  COMMERCE: '#B87A00',
};

export default function DashboardPage() {
  const enabledCount = MOCK_FLAGS.filter(f => f.enabled).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#3A0E1A' }}>Overview</Title>
        <Text type="secondary">Last updated just now</Text>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {STAT_CARDS.map(({ label, value, icon, color }) => (
          <Col xs={12} sm={8} lg={4} key={label}>
            <Card bodyStyle={{ padding: '18px 20px' }} style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(74,18,32,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
                  <Statistic
                    value={value}
                    valueStyle={{ fontSize: 28, fontWeight: 700, color: '#3A0E1A', lineHeight: 1.2 }}
                    style={{ marginTop: 4 }}
                  />
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: `${color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color,
                }}>
                  {icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Feature flags summary */}
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ fontWeight: 600, color: '#3A0E1A' }}>Feature Flags</span>}
            extra={<Text type="secondary">{enabledCount}/{MOCK_FLAGS.length} enabled</Text>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(74,18,32,0.07)' }}
          >
            <List
              dataSource={MOCK_FLAGS}
              renderItem={(flag) => (
                <List.Item style={{ padding: '10px 0', borderColor: '#F5F0EB' }}>
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontWeight: 500, fontSize: 14 }}>{flag.label}</Text>
                        <Tag
                          style={{ fontSize: 10, padding: '0 6px', borderRadius: 4,
                            color: CATEGORY_COLOR[flag.category], borderColor: `${CATEGORY_COLOR[flag.category]}30`,
                            background: `${CATEGORY_COLOR[flag.category]}10` }}
                        >
                          {flag.category}
                        </Tag>
                      </div>
                    }
                    description={<Text type="secondary" style={{ fontSize: 12 }}>{flag.description}</Text>}
                  />
                  <Tag
                    color={flag.enabled ? 'success' : 'default'}
                    style={{ borderRadius: 12, fontWeight: 600, fontSize: 11 }}
                  >
                    {flag.enabled ? 'ON' : 'OFF'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* New users this week */}
        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ fontWeight: 600, color: '#3A0E1A' }}>New This Week</span>}
            extra={<Text type="secondary">{MOCK_STATS.newUsersThisWeek} users</Text>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(74,18,32,0.07)' }}
          >
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Statistic
                value={MOCK_STATS.newUsersThisWeek}
                suffix="new pilgrims"
                valueStyle={{ fontSize: 40, fontWeight: 700, color: '#1F8A5B' }}
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                +{Math.round((MOCK_STATS.newUsersThisWeek / MOCK_STATS.newUsersThisMonth) * 100)}% of month's signups
              </Text>
            </div>

            <div style={{ background: '#F5F0EB', borderRadius: 10, padding: 16, marginTop: 8 }}>
              <Row justify="space-between">
                <Col>
                  <Text type="secondary" style={{ fontSize: 12 }}>This week</Text>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#3A0E1A' }}>{MOCK_STATS.newUsersThisWeek}</div>
                </Col>
                <Col>
                  <Text type="secondary" style={{ fontSize: 12 }}>This month</Text>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#3A0E1A' }}>{MOCK_STATS.newUsersThisMonth}</div>
                </Col>
                <Col>
                  <Text type="secondary" style={{ fontSize: 12 }}>Total</Text>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#3A0E1A' }}>{MOCK_STATS.totalUsers}</div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
