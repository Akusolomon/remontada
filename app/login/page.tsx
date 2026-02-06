'use client';

import React, { useEffect } from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, List } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserInter{
  _id:string,
  name:string
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<[UserInter]>()

     useEffect(() => {
      // Redirect if already authenticated
        if (isAuthenticated) {
    router.push('/dashboard');
    return 
  } })


     useEffect(() => {
   
     fetch("http://localhost:3000/user", {
        method: "GET",
        headers: { "Content-Type": "application/json"},
      }).then(res => res.json()).then(data => setUsers(data))
   
  },[] )


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!selectedAdmin || !password) {
      setError('Please enter both admin name and password');
      setIsLoading(false);
      return;
    }

    const success = await login(selectedAdmin, password);

    if ( success) {
      router.push('/dashboard');
    } else {
      console.log(success,"=========")
      setError('Invalid admin name or password');
      setPassword('');
    }

    setIsLoading(false);
  };


      

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="mb-4 flex justify-center">
            <div className="text-3xl font-bold text-primary">🎮</div>
          </div>
          <CardTitle className="text-center text-2xl">Game Zone Admin</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Name</label>
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select admin" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((e) => (
                    <SelectItem key={e._id} value={e.name}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !selectedAdmin}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-semibold text-foreground">Demo Credentials:</p>
              <p className="text-muted-foreground">Password: pass123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
