import { LoginForm } from "@/components/auth/login-form";
import { AppBrand } from "@/components/layout/app-brand";
import { Card, CardBody } from "@/components/ui/card";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <AppBrand linked={false} showTagline={false} size="large" showLogo={false} className="justify-center" />
        </div>

        <Card>
          <CardBody className="py-6">
            <LoginForm />
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          Internal use only. Authorized OIS team members.
        </p>
      </div>
    </div>
  );
}
