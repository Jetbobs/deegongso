"use client";

import { useState } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PerformanceReport {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  type: "monthly" | "quarterly" | "yearly";
  summary: {
    totalProjects: number;
    completionRate: number;
    averageRating: number;
    totalRevenue: number;
    responseTime: string;
  };
}

const mockReports: PerformanceReport[] = [
  {
    id: "report-2025-01",
    title: "2025년 1월 성과 보고서",
    period: "2025-01",
    generatedAt: "2025-01-31T23:59:59Z",
    type: "monthly",
    summary: {
      totalProjects: 12,
      completionRate: 94,
      averageRating: 4.8,
      totalRevenue: 2400000,
      responseTime: "2.3시간"
    }
  },
  {
    id: "report-2024-q4",
    title: "2024년 4분기 성과 보고서",
    period: "2024-Q4",
    generatedAt: "2024-12-31T23:59:59Z",
    type: "quarterly",
    summary: {
      totalProjects: 45,
      completionRate: 91,
      averageRating: 4.6,
      totalRevenue: 8500000,
      responseTime: "2.8시간"
    }
  }
];

const mockDetailedData = [
  { week: "1주차", projects: 3, rating: 4.9, revenue: 600000, responseHours: 2.1 },
  { week: "2주차", projects: 4, rating: 4.7, revenue: 800000, responseHours: 2.3 },
  { week: "3주차", projects: 2, rating: 4.8, revenue: 400000, responseHours: 2.0 },
  { week: "4주차", projects: 3, rating: 4.9, revenue: 600000, responseHours: 2.5 }
];

const mockComparisonData = [
  { month: "10월", thisYear: 85, lastYear: 78 },
  { month: "11월", thisYear: 88, lastYear: 82 },
  { month: "12월", thisYear: 91, lastYear: 85 },
  { month: "1월", thisYear: 94, lastYear: 88 }
];

interface PerformanceReportsProps {
  userRole: "client" | "designer";
}

export default function PerformanceReports({ userRole }: PerformanceReportsProps) {
  const [selectedReport, setSelectedReport] = useState<PerformanceReport>(mockReports[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "detailed" | "comparison">("overview");

  const generatePDFReport = () => {
    alert("PDF 보고서가 생성되었습니다. (Mock)");
  };

  const exportData = () => {
    alert("데이터가 Excel 파일로 내보내졌습니다. (Mock)");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">성과 보고서</h2>
          <p className="text-gray-600 mt-1">상세한 성과 분석과 인사이트를 확인하세요</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="select select-bordered"
            value={selectedReport.id}
            onChange={(e) => {
              const report = mockReports.find(r => r.id === e.target.value);
              if (report) setSelectedReport(report);
            }}
          >
            {mockReports.map(report => (
              <option key={report.id} value={report.id}>
                {report.title}
              </option>
            ))}
          </select>
          
          <button className="btn btn-primary" onClick={generatePDFReport}>
            📄 PDF 생성
          </button>
          
          <button className="btn btn-outline" onClick={exportData}>
            📊 데이터 내보내기
          </button>
        </div>
      </div>

      {/* 보고서 요약 카드 */}
      <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{selectedReport.title}</h3>
              <p className="opacity-80 mt-1">
                기간: {selectedReport.period} | 생성일: {new Date(selectedReport.generatedAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div className="badge badge-outline border-white text-white">
              {selectedReport.type === "monthly" ? "월간" : 
               selectedReport.type === "quarterly" ? "분기" : "연간"}
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{selectedReport.summary.totalProjects}</div>
              <div className="text-sm opacity-80">총 프로젝트</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{selectedReport.summary.completionRate}%</div>
              <div className="text-sm opacity-80">완료율</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{selectedReport.summary.averageRating}</div>
              <div className="text-sm opacity-80">평균 평점</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {(selectedReport.summary.totalRevenue / 10000).toFixed(0)}만원
              </div>
              <div className="text-sm opacity-80">
                {userRole === "client" ? "총 지출" : "총 수익"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{selectedReport.summary.responseTime}</div>
              <div className="text-sm opacity-80">평균 응답시간</div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tabs tabs-bordered">
        <button 
          className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          개요
        </button>
        <button 
          className={`tab ${activeTab === "detailed" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("detailed")}
        >
          상세 분석
        </button>
        <button 
          className={`tab ${activeTab === "comparison" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("comparison")}
        >
          전년 대비
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">주간 프로젝트 진행률</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockDetailedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="projects" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">주간 평점 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockDetailedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[4.5, 5.0]} />
                  <Tooltip formatter={(value) => [value, "평점"]} />
                  <Line type="monotone" dataKey="rating" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "detailed" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="text-lg font-semibold mb-4">주간 수익 분석</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockDetailedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}원`, "수익"]} />
                    <Bar dataKey="revenue" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="text-lg font-semibold mb-4">응답 시간 트렌드</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockDetailedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}시간`, "응답 시간"]} />
                    <Line type="monotone" dataKey="responseHours" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 상세 성과 지표 */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">상세 성과 지표</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>지표</th>
                      <th>현재 값</th>
                      <th>목표</th>
                      <th>달성률</th>
                      <th>전월 대비</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>프로젝트 완료율</td>
                      <td>94%</td>
                      <td>90%</td>
                      <td><span className="badge badge-success">104%</span></td>
                      <td><span className="text-green-600">+3%</span></td>
                    </tr>
                    <tr>
                      <td>고객 만족도</td>
                      <td>4.8/5</td>
                      <td>4.5/5</td>
                      <td><span className="badge badge-success">107%</span></td>
                      <td><span className="text-green-600">+0.2</span></td>
                    </tr>
                    <tr>
                      <td>평균 응답 시간</td>
                      <td>2.3시간</td>
                      <td>3시간</td>
                      <td><span className="badge badge-success">130%</span></td>
                      <td><span className="text-green-600">-0.5시간</span></td>
                    </tr>
                    <tr>
                      <td>재주문율</td>
                      <td>78%</td>
                      <td>70%</td>
                      <td><span className="badge badge-success">111%</span></td>
                      <td><span className="text-red-600">-3%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "comparison" && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">전년 동기 대비 완료율</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="thisYear" fill="#3B82F6" name="2025년" />
                  <Bar dataKey="lastYear" fill="#94A3B8" name="2024년" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="text-lg font-semibold mb-4">성장률 분석</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>프로젝트 수</span>
                    <span className="text-green-600 font-bold">+25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>완료율</span>
                    <span className="text-green-600 font-bold">+6%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>수익</span>
                    <span className="text-green-600 font-bold">+32%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>고객 만족도</span>
                    <span className="text-green-600 font-bold">+8%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="text-lg font-semibold mb-4">개선 권장사항</h3>
                <div className="space-y-3">
                  <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <h4 className="font-bold">응답 시간 개선</h4>
                      <div className="text-xs">평균 응답 시간을 2시간 이내로 단축</div>
                    </div>
                  </div>
                  
                  <div className="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <div>
                      <h4 className="font-bold">재주문율 관리</h4>
                      <div className="text-xs">재주문율 하락 원인 분석 필요</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}