"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");

  // Mock 데이터
  const userGrowthData = [
    { month: "1월", clients: 45, designers: 32, total: 77 },
    { month: "2월", clients: 52, designers: 38, total: 90 },
    { month: "3월", clients: 61, designers: 45, total: 106 },
    { month: "4월", clients: 58, designers: 52, total: 110 },
    { month: "5월", clients: 69, designers: 58, total: 127 },
    { month: "6월", clients: 74, designers: 63, total: 137 },
    { month: "7월", clients: 81, designers: 69, total: 150 },
    { month: "8월", clients: 89, designers: 76, total: 165 }
  ];

  const revenueData = [
    { month: "1월", revenue: 8500000, projects: 45 },
    { month: "2월", revenue: 9200000, projects: 52 },
    { month: "3월", revenue: 10800000, projects: 61 },
    { month: "4월", revenue: 9800000, projects: 58 },
    { month: "5월", revenue: 11500000, projects: 69 },
    { month: "6월", revenue: 12200000, projects: 74 },
    { month: "7월", revenue: 13800000, projects: 81 },
    { month: "8월", revenue: 12450000, projects: 76 }
  ];

  const projectStatusData = [
    { name: "완료", value: 324, color: "#10B981" },
    { name: "진행중", value: 89, color: "#F59E0B" },
    { name: "대기중", value: 23, color: "#6B7280" },
    { name: "취소", value: 12, color: "#EF4444" }
  ];

  const topDesignersData = [
    { name: "김디자이너", projects: 45, revenue: 18500000, rating: 4.9 },
    { name: "이크리에이터", projects: 38, revenue: 15200000, rating: 4.8 },
    { name: "박아티스트", projects: 32, revenue: 12800000, rating: 4.7 },
    { name: "최디자인", projects: 29, revenue: 11600000, rating: 4.6 },
    { name: "정크리에이티브", projects: 26, revenue: 10400000, rating: 4.5 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      notation: 'compact'
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {typeof entry.value === 'number' && entry.dataKey === 'revenue' 
                ? formatCurrency(entry.value) 
                : entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">통계 분석</h1>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="week">최근 1주</option>
            <option value="month">최근 1개월</option>
            <option value="quarter">최근 3개월</option>
            <option value="year">최근 1년</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            리포트 내보내기
          </button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 매출</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(94450000)}</p>
          <div className="mt-2">
            <span className="text-sm text-green-600">+15.3%</span>
            <span className="text-sm text-gray-500 ml-1">전월 대비</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">활성 사용자</h3>
          <p className="text-2xl font-bold text-gray-900">1,247</p>
          <div className="mt-2">
            <span className="text-sm text-green-600">+8.2%</span>
            <span className="text-sm text-gray-500 ml-1">전월 대비</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">프로젝트 성공률</h3>
          <p className="text-2xl font-bold text-gray-900">87.2%</p>
          <div className="mt-2">
            <span className="text-sm text-green-600">+2.1%</span>
            <span className="text-sm text-gray-500 ml-1">전월 대비</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">평균 프로젝트 금액</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(163750)}</p>
          <div className="mt-2">
            <span className="text-sm text-red-600">-3.8%</span>
            <span className="text-sm text-gray-500 ml-1">전월 대비</span>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 사용자 증가 추이 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 증가 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="clients" stroke="#3B82F6" name="클라이언트" strokeWidth={2} />
              <Line type="monotone" dataKey="designers" stroke="#10B981" name="디자이너" strokeWidth={2} />
              <Line type="monotone" dataKey="total" stroke="#8B5CF6" name="전체" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 매출 추이 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 매출</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#F59E0B" name="매출" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 프로젝트 상태 분포 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 상태 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {projectStatusData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 상위 디자이너 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 디자이너</h3>
          <div className="space-y-4">
            {topDesignersData.map((designer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{designer.name}</p>
                    <p className="text-sm text-gray-500">
                      {designer.projects}개 프로젝트 • ⭐ {designer.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(designer.revenue)}
                  </p>
                  <p className="text-sm text-gray-500">총 매출</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 세부 통계 테이블 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">상세 통계</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지표
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이번 달
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지난 달
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  변화율
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  신규 가입자
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  165명
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  150명
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  +10.0%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  완료된 프로젝트
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  76개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  81개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  -6.2%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  평균 응답 시간
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2.3시간
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2.8시간
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  -17.9%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  고객 만족도
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.7/5.0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.6/5.0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  +2.2%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}