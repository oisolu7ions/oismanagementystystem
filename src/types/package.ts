export type PackageListItem = {
  id: string;
  name: string;
  setupPrice: string;
  monthlyPrice: string;
  isActive: boolean;
  featureCount: number;
  clientCount: number;
  updatedAt: Date;
};

export type PackageDetail = {
  id: string;
  name: string;
  setupPrice: string;
  monthlyPrice: string;
  description: string | null;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  clientCount: number;
  projectCount: number;
};
