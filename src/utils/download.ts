import type { AxiosResponse } from "axios"

export const downloadPdfWithName = (
  response: AxiosResponse<any, any>,
  name: string
) => downloadFileWithNameAndType(response, name, 'application/pdf')

export const downloadFileWithNameAndType = (
  response: AxiosResponse<any, any>,
  name: string, 
  type: string
) => {
  const blob = new Blob([response.data], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
  document.removeChild(link);
}
