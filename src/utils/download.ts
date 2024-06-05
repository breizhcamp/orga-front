import type { AxiosResponse } from "axios"

export const downloadPdfWithName = (
  response: AxiosResponse<any, any>,
  name: string
) => {
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
  document.removeChild(link);
}
