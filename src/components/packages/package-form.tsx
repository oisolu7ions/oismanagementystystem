"use client";

import { useActionState } from "react";
import {
  createPackageAction,
  updatePackageAction,
  type PackageActionState,
} from "@/actions/packages";
import { featuresToFormValue } from "@/lib/validators/package";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PackageFormValues = {
  name: string;
  setupPrice: string;
  monthlyPrice: string;
  description: string;
  features: string[];
  isActive: boolean;
};

type PackageFormProps = {
  mode: "create" | "edit";
  packageId?: string;
  initialValues?: Partial<PackageFormValues>;
};

const initialState: PackageActionState = {};

export function PackageForm({ mode, packageId, initialValues }: PackageFormProps) {
  const action =
    mode === "create"
      ? createPackageAction
      : updatePackageAction.bind(null, packageId!);

  const [state, formAction, pending] = useActionState(action, initialState);

  const values: PackageFormValues = {
    name: initialValues?.name ?? "",
    setupPrice: initialValues?.setupPrice ?? "",
    monthlyPrice: initialValues?.monthlyPrice ?? "",
    description: initialValues?.description ?? "",
    features: initialValues?.features ?? [],
    isActive: initialValues?.isActive ?? true,
  };

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Package name"
          name="name"
          defaultValue={values.name}
          placeholder="e.g. Growth"
          required
          error={state.fieldErrors?.name}
        />
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-slate-700">Status</span>
          <select
            name="isActive"
            defaultValue={values.isActive ? "true" : "false"}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Setup price"
          name="setupPrice"
          defaultValue={values.setupPrice}
          placeholder='e.g. Starting at $599'
          required
          error={state.fieldErrors?.setupPrice}
        />
        <Input
          label="Monthly price"
          name="monthlyPrice"
          defaultValue={values.monthlyPrice}
          placeholder='e.g. Starting at $35/month'
          required
          error={state.fieldErrors?.monthlyPrice}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        rows={4}
        defaultValue={values.description}
        placeholder="Short summary of who this package is for"
      />

      <Textarea
        label="Features"
        name="features"
        rows={8}
        defaultValue={featuresToFormValue(values.features)}
        hint="One feature per line"
        placeholder={"1–5 page website\nMobile responsive design"}
      />

      {state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving..."
            : mode === "create"
              ? "Create package"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
