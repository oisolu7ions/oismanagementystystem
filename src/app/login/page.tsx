import { LoginForm } from "@/components/auth/login-form";
import { AppBrand } from "@/components/layout/app-brand";
import { Card, CardBody } from "@/components/ui/card";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ expired?: string }>;
}) {
  return (
    <LoginPageContent searchParams={searchParams} />
  );
}

async function LoginPageContent({
  searchParams,
}: {
  searchParams?: Promise<{ expired?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const showIdleMessage = params?.expired === "idle";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <AppBrand linked={false} showTagline={false} size="large" showLogo={false} className="justify-center" />
        </div>

        <Card>
          <CardBody className="py-6">
            {showIdleMessage ? (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Your session ended after 5 minutes of inactivity. Sign in again to continue.
              </p>
            ) : null}
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
