import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/schema';
import { inviteEmployee, updateEmployeePermissions, revokeEmployeeAccess, getEmployeeActivity } from '@/lib/admin';
import { toast } from '@/components/ui/use-toast';

interface Employee {
    id: string;
    email: string;
    role: Role;
    last_active?: string;
}

export default function AdminDashboard() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role>('employee');
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employeeActivity, setEmployeeActivity] = useState<any[]>([]);

    const handleInviteEmployee = async () => {
        if (!newEmployeeEmail) {
            toast({
                title: "Error",
                description: "Please enter an email address",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await inviteEmployee('admin_id', {
                email: newEmployeeEmail,
                role: selectedRole,
                company_id: 'company_id' // This should come from your auth context
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Employee invitation sent successfully",
            });

            setNewEmployeeEmail('');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (employeeId: string, newRole: Role) => {
        try {
            const { error } = await updateEmployeePermissions('admin_id', employeeId, newRole);
            if (error) throw error;

            setEmployees(employees.map(emp =>
                emp.id === employeeId ? { ...emp, role: newRole } : emp
            ));

            toast({
                title: "Success",
                description: "Employee role updated successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleRevokeAccess = async (employeeId: string) => {
        try {
            const { error } = await revokeEmployeeAccess('admin_id', employeeId);
            if (error) throw error;

            setEmployees(employees.filter(emp => emp.id !== employeeId));
            toast({
                title: "Success",
                description: "Employee access revoked successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleViewActivity = async (employee: Employee) => {
        setSelectedEmployee(employee);
        try {
            const { data, error } = await getEmployeeActivity('admin_id', employee.id);
            if (error) throw error;
            setEmployeeActivity(data || []);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs defaultValue="employees" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="employees">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invite New Employee</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Input
                                    type="email"
                                    placeholder="Employee email"
                                    value={newEmployeeEmail}
                                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                                />
                                <Select
                                    value={selectedRole}
                                    onValueChange={(value: Role) => setSelectedRole(value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee">Employee</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleInviteEmployee} disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Invitation'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Employee List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Last Active</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                                                    {employee.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{employee.last_active || 'Never'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={employee.role}
                                                        onValueChange={(value: Role) => handleUpdateRole(employee.id, value)}
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="employee">Employee</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleViewActivity(employee)}
                                                    >
                                                        View Activity
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => handleRevokeAccess(employee.id)}
                                                    >
                                                        Revoke Access
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    {selectedEmployee && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity for {selectedEmployee.email}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employeeActivity.map((activity) => (
                                            <TableRow key={activity.id}>
                                                <TableCell>{activity.action}</TableCell>
                                                <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                                                <TableCell>{JSON.stringify(activity.details)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Add company settings form here */}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 