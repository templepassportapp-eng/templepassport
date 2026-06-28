import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ username, password }: { username: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem('admin_token', token);
        navigate('/dashboard');
      } else {
        // Dev bypass — remove once backend admin auth is live
        if (username === 'admin' && password === 'admin123') {
          localStorage.setItem('admin_token', 'dev-token');
          navigate('/dashboard');
        } else {
          setError('Invalid credentials');
        }
      }
    } catch {
      // Dev bypass — remove once backend admin auth is live
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('admin_token', 'dev-token');
        navigate('/dashboard');
      } else {
        setError('Could not connect to server. Use admin / admin123 for dev mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#3A0E1A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(45deg, #C49A3A 0, #C49A3A 1px, transparent 0, transparent 50%)',
        backgroundSize: '20px 20px',
      }} />

      <Card
        style={{ width: 380, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛕</div>
          <Title level={3} style={{ margin: 0, color: '#3A0E1A' }}>Temple Passport</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Admin Portal</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input size="large" placeholder="admin" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password size="large" placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary" htmlType="submit" size="large"
              block loading={loading}
              style={{ height: 48, fontWeight: 600, fontSize: 15 }}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20, fontSize: 12 }}>
          Dev mode: admin / admin123
        </Text>
      </Card>
    </div>
  );
}
