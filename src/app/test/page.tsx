"use client";
import { TestPanel } from '@/components/TestPanel';

export default function TestPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Testing Dashboard</h1>
      <TestPanel />
    </main>
  );
} 