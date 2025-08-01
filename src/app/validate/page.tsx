import { ValidationForm } from "@/components/dashboard/ValidationForm";

export default function ValidatePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          iValidate Core Demo
        </h1>
        <p className="text-gray-600">
          See how your startup idea validation will work
        </p>
      </div>
      <ValidationForm />
    </div>
  );
}