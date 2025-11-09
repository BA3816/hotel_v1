import AdminSidebar from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Eye, CreditCard, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
const AdminPayments = () => {

  const payments = [
    {
      id: "PAY001",
      bookingId: "BK001",
      guest: "Sarah Johnson",
      amount: "$125.00",
      method: "Credit Card",
      status: "completed",
      date: "2024-01-20",
      reference: "ch_3O4Fg42eZvKYlo2C0123456789",
      type: "full-payment"
    },
    {
      id: "PAY002", 
      bookingId: "BK002",
      guest: "Mike Chen",
      amount: "$90.00",
      method: "PayPal",
      status: "pending",
      date: "2024-01-21",
      reference: "PAYID-MX3VRIY1234567890",
      type: "full-payment"
    },
    {
      id: "PAY003",
      bookingId: "BK003",
      guest: "Anna Garcia", 
      amount: "$115.00",
      method: "Credit Card",
      status: "completed",
      date: "2024-01-22",
      reference: "ch_3O4Fg42eZvKYlo2C0987654321",
      type: "full-payment"
    },
    {
      id: "PAY004",
      bookingId: "BK004",
      guest: "Tom Wilson",
      amount: "$65.00",
      method: "Bank Transfer",
      status: "completed",
      date: "2024-01-23",
      reference: "TXN-20240123-001",
      type: "partial-payment"
    },
    {
      id: "PAY005",
      bookingId: "BK005",
      guest: "Lisa Brown",
      amount: "$80.00",
      method: "Credit Card",
      status: "refunded",
      date: "2024-01-24",
      reference: "re_3O4Fg42eZvKYlo2C0555444333",
      type: "refund"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "refunded": return "bg-purple-100 text-purple-800";
      case "partial": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "full-payment": return "bg-blue-100 text-blue-800";
      case "partial-payment": return "bg-orange-100 text-orange-800";
      case "refund": return "bg-purple-100 text-purple-800";
      case "deposit": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "full-payment": return "Full Payment";
      case "partial-payment": return "Partial";
      case "refund": return "Refund";
      case "deposit": return "Deposit";
      default: return type;
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Payment Management</h1>
            <p className="text-muted-foreground">Track payments, refunds, and financial transactions.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <CreditCard size={16} className="mr-2" />
              Process Payment
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">$12,340</p>
                <p className="text-sm text-green-600">+18% from last month</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary opacity-80" />
            </div>
          </Card>
          
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-foreground">$450</p>
                <p className="text-sm text-yellow-600">3 transactions</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600 opacity-80" />
            </div>
          </Card>
          
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refunds Issued</p>
                <p className="text-2xl font-bold text-foreground">$320</p>
                <p className="text-sm text-purple-600">2 this month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-80" />
            </div>
          </Card>
          
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">98.5%</p>
                <p className="text-sm text-green-600">+2.1% this month</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input placeholder="Search payments..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-payment">Full Payment</SelectItem>
                <SelectItem value="partial-payment">Partial Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" placeholder="Date" />
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="shadow-soft">
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell className="font-medium text-primary">{payment.bookingId}</TableCell>
                    <TableCell>{payment.guest}</TableCell>
                    <TableCell className="font-medium">{payment.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CreditCard size={14} className="text-muted-foreground" />
                        <span>{payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(payment.type)}>
                        {getTypeText(payment.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" title="View Details">
                          <Eye size={14} />
                        </Button>
                        <Button variant="outline" size="sm" title="Download Receipt">
                          <Download size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminPayments;