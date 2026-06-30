import { ClientLoginForm } from "@/components/client-portal/client-login-form";
import { ClientBrand } from "@/components/client-portal/client-brand";
import { Card, CardBody } from "@/components/ui/card";

export const metadata = {
  title: "Client sign in",
};

export default function ClientLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <ClientBrand linked={false} />
          <p className="mt-3 text-sm text-slate-500">
            View your projects, tasks, invoices, and documents.
          </p>
        </div>

        <Card>
          <CardBody className="py-6">
            <ClientLoginForm />
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          OIS team member?{" "}
          <a href="/login" className="underline hover:text-slate-600">
            Admin sign in
          </a>
        </p>
      </div>
    </div>
  );
}
