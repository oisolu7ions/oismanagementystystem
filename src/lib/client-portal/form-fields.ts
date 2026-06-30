function getSharingBoolean(formData: FormData, name: string) {
  return formData.get(name) ?? undefined;
}

export function parseProjectSharingFormData(formData: FormData) {
  return {
    clientVisible: getSharingBoolean(formData, "clientVisible"),
    clientSummary: formData.get("clientSummary") ?? undefined,
    clientStatusNote: formData.get("clientStatusNote") ?? undefined,
  };
}

export function parseTaskSharingFormData(formData: FormData) {
  return {
    clientVisible: getSharingBoolean(formData, "clientVisible"),
    clientNote: formData.get("clientNote") ?? undefined,
  };
}

export function parseInvoiceSharingFormData(formData: FormData) {
  return {
    clientVisible: getSharingBoolean(formData, "clientVisible"),
    clientNote: formData.get("clientNote") ?? undefined,
  };
}

export function parseDocumentSharingFormData(formData: FormData) {
  return {
    clientVisible: getSharingBoolean(formData, "clientVisible"),
    clientDescription: formData.get("clientDescription") ?? undefined,
  };
}
