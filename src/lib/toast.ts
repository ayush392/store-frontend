import { toast, type ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
  duration: 3000
  // position: 'bottom-center'
};

export const notifySuccess = (message: string) => {
  return toast.success(message, { ...defaultOptions });
};

export const notifyError = (message: string) => {
  return toast.error(message, { ...defaultOptions });
};

export const notifyLoading = (message: string) => {
  return toast.loading(message, { ...defaultOptions });
};
