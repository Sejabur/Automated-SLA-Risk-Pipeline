"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login, signup } from "@/app/login/actions";
import { useFormStatus } from "react-dom";

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full bg-[#E76257] hover:bg-[#D54A3E] text-white h-10 rounded-md font-medium shadow-sm transition-colors"
    >
      {pending ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
    </Button>
  );
}

export function AuthForm({ message }: { message?: string }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Card className="w-full max-w-md shadow-lg border-slate-200 bg-white rounded-xl">
      <CardHeader className="space-y-3 pb-4">
        <CardTitle className="text-2xl text-center font-bold font-heading text-[#1C2439] tracking-tight">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </CardTitle>
        <CardDescription className="text-center text-slate-500 font-medium">
          {isLogin ? "Sign in to your account to continue." : "Enter your details to register."}
        </CardDescription>
      </CardHeader>
      <CardContent>

        {isLogin && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Public Demo Accounts</p>
            <div className="space-y-2 text-sm text-[#1C2439]">
              <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded shadow-sm">
                <span className="font-medium">Admin:</span>
                <span className="font-mono text-slate-500">admin@sejabur.dev / 123456</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded shadow-sm">
                <span className="font-medium">Operator:</span>
                <span className="font-mono text-slate-500">operator@sejabur.dev / 123456</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6 relative overflow-hidden">
          {/* Animated Background Indicator */}
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-300 ease-in-out z-0"
            style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
          />
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors z-10 ${
              isLogin ? "text-[#1C2439]" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors z-10 ${
              !isLogin ? "text-[#1C2439]" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="relative overflow-hidden transition-all duration-300 ease-in-out">
          <form action={isLogin ? login : signup} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#1C2439] font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              className="border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#1C2439] font-medium">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
              className="border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm h-10"
            />
          </div>
          
          {message && (
            <div className="text-sm font-medium text-[#E76257] bg-red-50 p-3 rounded-md border border-red-100 flex items-center justify-center">
              {message}
            </div>
          )}

          <div className="pt-2">
            <SubmitButton isLogin={isLogin} />
          </div>
        </form>
        </div>
      </CardContent>
    </Card>
  );
}
