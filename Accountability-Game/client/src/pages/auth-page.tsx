import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, Users, BarChart3, Target } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", displayName: "" });

  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Stride</CardTitle>
            <CardDescription>Track habits, connect with accountability buddies</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      data-testid="input-login-username"
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      data-testid="input-login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>
                  <div className="text-center mt-2">
                    <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-forgot-password">
                      Forgot your password?
                    </Link>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      data-testid="input-register-username"
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      data-testid="input-register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-displayname">Display Name</Label>
                    <Input
                      id="register-displayname"
                      data-testid="input-register-displayname"
                      type="text"
                      value={registerData.displayName}
                      onChange={(e) => setRegisterData({ ...registerData, displayName: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      data-testid="input-register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden lg:flex flex-1 bg-primary/10 items-center justify-center p-8">
        <div className="max-w-md space-y-8">
          <h2 className="text-3xl font-bold">Build Better Habits Together</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Track Daily Habits</h3>
                <p className="text-muted-foreground text-sm">Log your habits and see your progress over time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Accountability Buddies</h3>
                <p className="text-muted-foreground text-sm">Connect with friends and hold each other accountable</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Weekly Planning</h3>
                <p className="text-muted-foreground text-sm">Plan your tasks and stay organized</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Analytics & Insights</h3>
                <p className="text-muted-foreground text-sm">Understand your patterns and improve</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
