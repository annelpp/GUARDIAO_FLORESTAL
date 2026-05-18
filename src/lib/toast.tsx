import { toast as sonnerToast } from 'sonner';

function clickableToast(
  type: 'error' | 'warning' | 'success',
  title: string,
  options?: { description?: string; duration?: number }
) {
  const id = sonnerToast.custom(
    (toastId) => (
      <div
        onClick={() => sonnerToast.dismiss(toastId)}
        className={`cursor-pointer px-4 py-3 rounded-lg shadow-lg text-sm ${
          type === 'error'
            ? 'bg-red-600 text-white'
            : type === 'warning'
            ? 'bg-yellow-600 text-white'
            : 'bg-green-600 text-white'
        }`}
      >
        <p className="font-semibold">{title}</p>
        {options?.description && <p className="opacity-90 mt-0.5">{options.description}</p>}
      </div>
    ),
    { duration: options?.duration ?? 4000 }
  );
  return id;
}

export const toast = {
  error: (title: string, options?: { description?: string; duration?: number }) =>
    clickableToast('error', title, options),
  warning: (title: string, options?: { description?: string; duration?: number }) =>
    clickableToast('warning', title, options),
  success: (title: string, options?: { description?: string; duration?: number }) =>
    clickableToast('success', title, options),
};
