import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  DollarSign, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Calendar
} from "lucide-react";

interface NonprofitAnalytics {
  totalVolume: number;
  donationVolume: number;
  programFeeVolume: number;
  donationPercentage: number;
  qualifiesForNonprofitRates: boolean;
  stripe_compliance: string;
  recommendation: string;
}

interface ComplianceReport {
  champions_for_change: {
    ein: string;
    mission: string;
    period: string;
    totalTransactions: number;
    donationTransactions: number;
    complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
    recommendations: string[];
  };
}

export default function NonprofitAnalytics() {
  const [dateRange, setDateRange] = useState('30');
  const [selectedQuarter, setSelectedQuarter] = useState('1');
  const [selectedYear, setSelectedYear] = useState('2025');

  const getDateRange = (days: string) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['nonprofit-analytics', dateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange(dateRange);
      const response = await apiRequest('GET', `/api/nonprofit/analytics?startDate=${startDate}&endDate=${endDate}`);
      return response as NonprofitAnalytics;
    },
  });

  const { data: complianceReport, isLoading: reportLoading } = useQuery({
    queryKey: ['compliance-report', selectedQuarter, selectedYear],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/nonprofit/compliance-report/${selectedQuarter}/${selectedYear}`);
      return response as ComplianceReport;
    },
  });

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
      case 'compliant':
        return 'text-green-600 bg-green-50';
      case 'AT RISK':
      case 'at_risk':
        return 'text-yellow-600 bg-yellow-50';
      case 'non_compliant':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
      case 'compliant':
        return <CheckCircle className="h-4 w-4" />;
      case 'AT RISK':
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">
            Champions for Change - Nonprofit Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Monitor Stripe nonprofit compliance and donation impact
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          EIN: 81-3834471
        </Badge>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <Select onValueChange={setDateRange} defaultValue="30">
          <SelectTrigger className="w-48" data-testid="select-date-range">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Overview */}
      {analyticsLoading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-volume">
                ${analytics.totalVolume.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Last {dateRange} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-donation-volume">
                ${analytics.donationVolume.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Tax-deductible donations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Program Fees</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-program-fees">
                ${analytics.programFeeVolume.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Educational program fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
              {getComplianceIcon(analytics.stripe_compliance)}
            </CardHeader>
            <CardContent>
              <Badge className={getComplianceColor(analytics.stripe_compliance)} data-testid="badge-compliance-status">
                {analytics.stripe_compliance}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Stripe nonprofit rates
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Donation Percentage Progress */}
      {analytics && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Donation Percentage (Stripe Requirement: 80%+)
            </CardTitle>
            <CardDescription>
              Monitor compliance with Stripe's nonprofit rate qualification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Ratio</span>
              <span className="text-2xl font-bold" data-testid="text-donation-percentage">
                {analytics.donationPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={analytics.donationPercentage} 
              max={100}
              className="h-3"
              data-testid="progress-donation-ratio"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="text-red-500 font-medium">80% Required</span>
              <span>100%</span>
            </div>
            
            {analytics.donationPercentage < 80 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Action Required:</strong> {analytics.recommendation}
                </AlertDescription>
              </Alert>
            )}
            
            {analytics.donationPercentage >= 80 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {analytics.recommendation}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quarterly Compliance Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quarterly Compliance Report
          </CardTitle>
          <CardDescription>
            Generate reports for Stripe nonprofit program maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select onValueChange={setSelectedQuarter} defaultValue="1">
              <SelectTrigger className="w-32" data-testid="select-quarter">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1</SelectItem>
                <SelectItem value="2">Q2</SelectItem>
                <SelectItem value="3">Q3</SelectItem>
                <SelectItem value="4">Q4</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={setSelectedYear} defaultValue="2025">
              <SelectTrigger className="w-32" data-testid="select-year">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportLoading ? (
            <div className="text-center py-4">Loading compliance report...</div>
          ) : complianceReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold" data-testid="text-total-transactions">
                    ${complianceReport.champions_for_change.totalTransactions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Transactions</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-donation-transactions">
                    ${complianceReport.champions_for_change.donationTransactions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Donation Transactions</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Badge 
                    className={getComplianceColor(complianceReport.champions_for_change.complianceStatus)}
                    data-testid="badge-quarterly-status"
                  >
                    {complianceReport.champions_for_change.complianceStatus.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-500 mt-2">
                    {complianceReport.champions_for_change.period}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recommendations:</h4>
                <ul className="space-y-1">
                  {complianceReport.champions_for_change.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="outline" className="w-full" data-testid="button-download-report">
                <Download className="h-4 w-4 mr-2" />
                Download Compliance Report
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Stripe Nonprofit Benefits Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-green-700">Stripe Nonprofit Benefits Active</CardTitle>
          <CardDescription>
            Your platform qualifies for reduced processing rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Current Rates:</h4>
              <ul className="space-y-1 text-sm">
                <li>✅ Credit/Debit Cards: <strong>2.2% + $0.30</strong></li>
                <li>✅ ACH Transactions: <strong>0.8%</strong> (max $5)</li>
                <li>💰 <strong>Savings:</strong> 0.7% vs standard rates</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Mission Impact:</h4>
              <ul className="space-y-1 text-sm">
                <li>🎓 Educational trip funding</li>
                <li>🏆 Academic competition support</li>
                <li>📚 Equipment and supplies</li>
                <li>❤️ Underprivileged youth opportunities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}