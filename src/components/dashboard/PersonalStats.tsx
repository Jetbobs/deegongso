"use client";

import { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockProjectData = [
  { month: "1월", completed: 12, inProgress: 8, total: 20 },
  { month: "2월", completed: 15, inProgress: 6, total: 21 },
  { month: "3월", completed: 18, inProgress: 9, total: 27 },
  { month: "4월", completed: 22, inProgress: 7, total: 29 },
  { month: "5월", completed: 25, inProgress: 12, total: 37 },
  { month: "6월", completed: 28, inProgress: 8, total: 36 }
];

const mockRevenueData = [
  { month: "1월", client: 1200000, designer: 800000 },
  { month: "2월", client: 1500000, designer: 1100000 },
  { month: "3월", client: 1800000, designer: 1300000 },
  { month: "4월", client: 2200000, designer: 1600000 },
  { month: "5월", client: 2500000, designer: 1900000 },
  { month: "6월", client: 2800000, designer: 2100000 }
];

const mockRatingData = [
  { name: "5점", value: 45, color: "#10B981" },
  { name: "4점", value: 32, color: "#3B82F6" },
  { name: "3점", value: 15, color: "#F59E0B" },
  { name: "2점", value: 6, color: "#F97316" },
  { name: "1점", value: 2, color: "#EF4444" }
];

const mockPerformanceData = [
  { metric: "응답 시간", value: "2.3시간", trend: "+12%", color: "text-green-600" },
  { metric: "프로젝트 완료율", value: "94%", trend: "+8%", color: "text-green-600" },
  { metric: "고객 만족도", value: "4.8/5", trend: "+5%", color: "text-green-600" },
  { metric: "재주문율", value: "78%", trend: "-3%", color: "text-red-600" }
];

interface PersonalStatsProps {
  userRole: "client" | "designer";
}

export default function PersonalStats({ userRole }: PersonalStatsProps) {
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "1Y">("6M");

  return (
    <div className="space-y-6">
      {/* 시간 범위 선택 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">통계 대시보드</h2>
        <div className="join">
          {(["1M", "3M", "6M", "1Y"] as const).map((range) => (
            <button
              key={range}
              className={`join-item btn btn-sm ${timeRange === range ? "btn-primary" : "btn-outline"}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 핵심 성과 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockPerformanceData.map((item) => (
          <div key={item.metric} className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.metric}</p>
                  <p className="text-2xl font-bold mt-1">{item.value}</p>
                </div>
                <div className={`text-sm font-medium ${item.color}`}>
                  {item.trend}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 프로젝트 진행 현황 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">프로젝트 진행 현황</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockProjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" name="완료" />
                <Bar dataKey="inProgress" fill="#3B82F6" name="진행 중" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 수익 트렌드 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">
              {userRole === "client" ? "지출 트렌드" : "수익 트렌드"}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={userRole === "client" ? "client" : "designer"} 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name={userRole === "client" ? "총 지출" : "총 수익"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 평점 분포 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">
              {userRole === "client" ? "남긴 평점 분포" : "받은 평점 분포"}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockRatingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockRatingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 월별 활동 요약 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">이번 달 활동 요약</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">새 프로젝트</p>
                  <p className="text-sm text-blue-600">이번 달 시작</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">12</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">완료 프로젝트</p>
                  <p className="text-sm text-green-600">성공적으로 완료</p>
                </div>
                <div className="text-2xl font-bold text-green-600">8</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">총 메시지</p>
                  <p className="text-sm text-purple-600">주고받은 메시지</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">156</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-900">평균 응답 시간</p>
                  <p className="text-sm text-orange-600">메시지 응답</p>
                </div>
                <div className="text-2xl font-bold text-orange-600">2.3h</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 목표 달성률 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">월간 목표 달성률</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="radial-progress text-primary" style={{"--value": 85} as any} role="progressbar">
                85%
              </div>
              <p className="mt-2 font-medium">프로젝트 완료</p>
              <p className="text-sm text-gray-500">목표: 10개 / 완료: 8.5개</p>
            </div>
            
            <div className="text-center">
              <div className="radial-progress text-secondary" style={{"--value": 92} as any} role="progressbar">
                92%
              </div>
              <p className="mt-2 font-medium">고객 만족도</p>
              <p className="text-sm text-gray-500">목표: 4.5점 / 현재: 4.6점</p>
            </div>
            
            <div className="text-center">
              <div className="radial-progress text-accent" style={{"--value": 78} as any} role="progressbar">
                78%
              </div>
              <p className="mt-2 font-medium">수익 목표</p>
              <p className="text-sm text-gray-500">목표: 300만원 / 달성: 234만원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}