"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts";

// Mock 데이터
const projectProgressData = [
  { date: "2024-01-01", active: 2, completed: 1, total: 3 },
  { date: "2024-01-05", active: 3, completed: 1, total: 4 },
  { date: "2024-01-10", active: 4, completed: 2, total: 6 },
  { date: "2024-01-15", active: 3, completed: 4, total: 7 },
  { date: "2024-01-20", active: 5, completed: 4, total: 9 },
  { date: "2024-01-25", active: 4, completed: 6, total: 10 }
];

const budgetData = [
  { name: "로고 디자인", used: 80, remaining: 20, total: 100 },
  { name: "웹사이트 UI", used: 45, remaining: 55, total: 100 },
  { name: "브랜딩 패키지", used: 100, remaining: 0, total: 100 },
  { name: "캠페인 KV", used: 15, remaining: 85, total: 100 }
];

const statusDistribution = [
  { name: "진행 중", value: 35, color: "#3b82f6" },
  { name: "피드백 대기", value: 25, color: "#f59e0b" },
  { name: "완료", value: 30, color: "#10b981" },
  { name: "대기", value: 10, color: "#6b7280" }
];

const performanceMetrics = [
  { metric: "완료율", value: 85, target: 90, color: "#10b981" },
  { metric: "만족도", value: 92, target: 95, color: "#3b82f6" },
  { metric: "정시 완료", value: 78, target: 85, color: "#f59e0b" },
  { metric: "재작업률", value: 15, target: 10, color: "#ef4444", inverse: true }
];

const monthlyRevenue = [
  { month: "10월", revenue: 4200000, projects: 3 },
  { month: "11월", revenue: 6800000, projects: 4 },
  { month: "12월", revenue: 3200000, projects: 2 },
  { month: "1월", revenue: 7500000, projects: 5 },
  { month: "2월", revenue: 5100000, projects: 3 },
  { month: "3월", revenue: 8200000, projects: 6 }
];

const newProjectsData = [
  { month: "10월", newProjects: 3, clients: 2 },
  { month: "11월", newProjects: 5, clients: 3 },
  { month: "12월", newProjects: 2, clients: 2 },
  { month: "1월", newProjects: 6, clients: 4 },
  { month: "2월", newProjects: 4, clients: 3 },
  { month: "3월", newProjects: 7, clients: 5 }
];

interface DashboardChartsProps {
  userRole?: "client" | "designer";
}

export default function DashboardCharts({ userRole = "client" }: DashboardChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter">("month");

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">대시보드 분석</h2>
        <div className="tabs tabs-boxed tabs-sm">
          <button
            className={`tab ${selectedPeriod === "week" ? "tab-active" : ""}`}
            onClick={() => setSelectedPeriod("week")}
          >
            주간
          </button>
          <button
            className={`tab ${selectedPeriod === "month" ? "tab-active" : ""}`}
            onClick={() => setSelectedPeriod("month")}
          >
            월간
          </button>
          <button
            className={`tab ${selectedPeriod === "quarter" ? "tab-active" : ""}`}
            onClick={() => setSelectedPeriod("quarter")}
          >
            분기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 프로젝트 진행률 추이 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">프로젝트 진행률 추이</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectProgressData}>
                  <defs>
                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
                  <XAxis 
                    dataKey="date" 
                    className="text-base-content"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis className="text-base-content" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stackId="1"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#activeGradient)"
                    name="진행 중"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#completedGradient)"
                    name="완료"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 프로젝트 상태 분포 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">프로젝트 상태 분포</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* 범례 */}
            <div className="flex flex-wrap gap-4 mt-4">
              {statusDistribution.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 월별 신규 프로젝트 현황 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">월별 신규 프로젝트 현황</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newProjectsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
                  <XAxis dataKey="month" className="text-base-content" />
                  <YAxis className="text-base-content" />
                  <Tooltip 
                    formatter={(value, name) => [
                      value, 
                      name === 'newProjects' ? '신규 프로젝트' : '신규 클라이언트'
                    ]}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--b1))',
                      border: '1px solid hsl(var(--b3))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--bc))'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="newProjects" fill="#3b82f6" name="신규 프로젝트" />
                  <Bar dataKey="clients" fill="#10b981" name="신규 클라이언트" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* 신규 프로젝트 요약 */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-primary/10 rounded">
                <p className="text-2xl font-bold text-primary">
                  {newProjectsData[newProjectsData.length - 1].newProjects}
                </p>
                <p className="text-xs text-base-content/60">이번 달 신규</p>
              </div>
              <div className="text-center p-3 bg-success/10 rounded">
                <p className="text-2xl font-bold text-success">
                  {Math.round(newProjectsData.reduce((sum, item) => sum + item.newProjects, 0) / newProjectsData.length)}
                </p>
                <p className="text-xs text-base-content/60">월평균 신규</p>
              </div>
              <div className="text-center p-3 bg-info/10 rounded">
                <p className="text-2xl font-bold text-info">
                  {newProjectsData.reduce((sum, item) => sum + item.clients, 0)}
                </p>
                <p className="text-xs text-base-content/60">총 신규 클라이언트</p>
              </div>
            </div>
          </div>
        </div>

        {/* 성과 지표 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-6">성과 지표</h3>
            
            {/* Progress Bars로 성과지표 표시 */}
            <div className="space-y-6">
              {performanceMetrics.map((metric, index) => {
                const percentage = metric.inverse 
                  ? Math.max(0, metric.target - metric.value) / metric.target * 100
                  : (metric.value / metric.target) * 100;
                const isGood = metric.inverse 
                  ? metric.value <= metric.target
                  : metric.value >= metric.target;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: metric.color }}
                        />
                        <span className="font-medium">{metric.metric}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isGood ? 'text-success' : 'text-warning'}`}>
                          {metric.value}%
                        </span>
                        <span className="text-xs text-base-content/60">
                          / {metric.target}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-base-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isGood ? 'bg-success' : 'bg-warning'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (metric.value / 100) * 100)}%`,
                            backgroundColor: metric.color
                          }}
                        />
                      </div>
                      
                      {/* Target Line */}
                      <div 
                        className="absolute top-0 w-0.5 h-3 bg-base-content/40"
                        style={{ left: `${(metric.target / 100) * 100}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-base-content/60">
                      {metric.inverse ? '낮을수록 좋음' : '높을수록 좋음'} • 목표: {metric.target}%
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 성과 요약 */}
            <div className="mt-6 p-4 bg-base-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-success">
                    {performanceMetrics.filter(m => 
                      m.inverse ? m.value <= m.target : m.value >= m.target
                    ).length}
                  </p>
                  <p className="text-xs text-base-content/60">목표 달성</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">
                    {Math.round(
                      performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length
                    )}%
                  </p>
                  <p className="text-xs text-base-content/60">평균 성과</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 빠른 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">이번 주 완료</p>
                <p className="text-2xl font-bold">3개</p>
              </div>
              <div className="text-3xl opacity-80">📈</div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">평균 만족도</p>
                <p className="text-2xl font-bold">4.8★</p>
              </div>
              <div className="text-3xl opacity-80">⭐</div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">응답 시간</p>
                <p className="text-2xl font-bold">2.3h</p>
              </div>
              <div className="text-3xl opacity-80">⚡</div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">활성 협업</p>
                <p className="text-2xl font-bold">5개</p>
              </div>
              <div className="text-3xl opacity-80">🤝</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}