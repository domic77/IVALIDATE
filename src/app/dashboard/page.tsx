import { ValidationLayout } from '@/components/layouts/ValidationLayout';

export default function DashboardPage() {
  return (
    <ValidationLayout>
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600">Dashboard content will go here</p>
        </div>
      </div>
    </ValidationLayout>
  );
}