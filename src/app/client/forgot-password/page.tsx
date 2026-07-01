import { ClientAuthPlaceholderPage } from "@/components/client-portal/client-auth-placeholder-page";

export const metadata = {
  title: "Forgot password",
};

export default function ClientForgotPasswordPage() {
  return (
    <ClientAuthPlaceholderPage
      title="Forgot password"
      description="Password reset support will be available here. This placeholder can be updated when account recovery is connected."
    />
  );
}
