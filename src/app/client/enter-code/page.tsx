import { ClientAuthPlaceholderPage } from "@/components/client-portal/client-auth-placeholder-page";

export const metadata = {
  title: "Enter code",
};

export default function ClientEnterCodePage() {
  return (
    <ClientAuthPlaceholderPage
      title="Enter your code"
      description="Code entry support will be available here. This placeholder can be updated when the code flow is connected."
    />
  );
}
