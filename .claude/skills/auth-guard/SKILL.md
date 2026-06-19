# Skill: auth-guard

## Purpose
Supabase Auth + ProtectedRoute pattern define ထားသည်။
Login မဝင်ဘဲ protected pages access မရအောင် ထိန်းသည်။

## When to use
- ProtectedRoute ရေးသောအခါ
- Auth pages ရေးသောအခါ
- App.jsx routes setup လုပ်သောအခါ

## AuthContext Pattern
- getSession() ဖြင့် initial check
- onAuthStateChange() ဖြင့် state listen
- loading=true ဆိုရင် spinner ပြပါ

## ProtectedRoute Logic
if (loading) → show spinner
if (!user)   → <Navigate to="/login" replace />
else         → render children

## Routes
Public:    /login
Protected: / /transactions /reports /categories

## Login Page
- already logged in ဆိုရင် → / redirect
- error messages မြန်မာဘာသာ ပြပါ