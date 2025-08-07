"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, Alert } from "antd";

const { Title } = Typography;

export default function ManagerLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/manager-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      console.log('API response:', data);
      if (data.success) {
        router.push("/manager");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (e) {
      console.error('Login error:', e);
      setError("An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  console.log('Rendering ManagerLoginPage');
  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <button onClick={() => console.log('Debug button clicked!')} style={{position:'absolute',top:10,right:10}}>Debug Log</button>
      <Card style={{ maxWidth: 400, width: "100%" }}>
        <Title level={3} style={{ textAlign: "center" }}>Manager Login</Title>
        <Form layout="vertical" onFinish={(values) => {console.log('Form onFinish fired:', values); handleLogin(values);}}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email" }]}> 
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password" }]}> 
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Login</Button>
        </Form>
        {error && <Alert type="error" message={error} style={{ marginTop: 16 }} />}
      </Card>
    </div>
  );
}
