import { useState, useEffect } from 'react';

interface SystemHealthMetrics {
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkUsage: number;
  uptime: string;
  responseTime: number;
  databaseConnections: number;
  errorRate: number;
}

export const useSystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics>({
    cpuUsage: 23,
    memoryUsage: 67,
    storageUsage: 45,
    networkUsage: 12,
    uptime: '99.9%',
    responseTime: 120,
    databaseConnections: 34,
    errorRate: 0.01
  });

  const [loading, setLoading] = useState(false);

  // Simulate real system metrics with some variation
  const updateMetrics = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        storageUsage: Math.max(20, Math.min(80, prev.storageUsage + (Math.random() - 0.5) * 2)),
        networkUsage: Math.max(1, Math.min(50, prev.networkUsage + (Math.random() - 0.5) * 15)),
        responseTime: Math.max(50, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50)),
        databaseConnections: Math.max(10, Math.min(100, prev.databaseConnections + Math.floor((Math.random() - 0.5) * 10)))
      }));
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    const avgUsage = (metrics.cpuUsage + metrics.memoryUsage + metrics.storageUsage + metrics.networkUsage) / 4;
    
    if (avgUsage < 30) return { status: 'excellent', color: 'text-green-600', percentage: 95 + Math.random() * 5 };
    if (avgUsage < 50) return { status: 'good', color: 'text-green-500', percentage: 85 + Math.random() * 10 };
    if (avgUsage < 70) return { status: 'fair', color: 'text-yellow-500', percentage: 70 + Math.random() * 15 };
    return { status: 'poor', color: 'text-red-500', percentage: 50 + Math.random() * 20 };
  };

  return {
    metrics,
    loading,
    updateMetrics,
    healthStatus: getHealthStatus()
  };
};