export type DefaultPackageSeed = {
  name: string;
  setupPrice: string;
  monthlyPrice: string;
  description: string;
  features: string[];
  isActive: boolean;
};

export const defaultOisPackages: DefaultPackageSeed[] = [
  {
    name: "Standard",
    setupPrice: "Starting at $599",
    monthlyPrice: "Starting at $35/month",
    description:
      "A clean professional website package for small businesses that need a solid online presence.",
    features: [
      "1–5 page website",
      "Mobile responsive design",
      "Contact form",
      "Google Maps integration",
      "SSL/security setup",
      "Social media links",
    ],
    isActive: true,
  },
  {
    name: "Growth",
    setupPrice: "Starting at $1,499",
    monthlyPrice: "Starting at $65/month",
    description:
      "A stronger business website package with lead capture, automation, and CRM-ready features.",
    features: [
      "Everything in Standard",
      "Booking/inquiry system",
      "Lead capture forms",
      "CRM integration",
      "Email automation",
      "Dashboard/reporting",
      "Monthly updates",
    ],
    isActive: true,
  },
  {
    name: "Deluxe",
    setupPrice: "Starting at $2,499",
    monthlyPrice: "Starting at $125/month",
    description:
      "A premium package for businesses that need deeper automation, dashboards, portals, and integrations.",
    features: [
      "Everything in Growth",
      "Advanced automation",
      "Client portal",
      "Custom dashboard",
      "Multiple integrations",
      "Priority updates",
      "Advanced reporting",
    ],
    isActive: true,
  },
  {
    name: "Web Apps & Software",
    setupPrice: "Custom quote",
    monthlyPrice: "Custom quote",
    description:
      "Custom software, dashboards, tools, and integrations built around a business process.",
    features: [
      "Web applications",
      "Admin dashboards",
      "API integrations",
      "E-commerce workflows",
      "Custom business tools",
      "Phased delivery",
    ],
    isActive: true,
  },
];
