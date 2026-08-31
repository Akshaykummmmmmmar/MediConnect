import { toast } from 'sonner';

const notify = {
  success: (message, opts) => toast.success(message, opts),
  error: (message, opts) => toast.error(message, opts),
  info: (message, opts) => toast.info(message, opts),
  warning: (message, opts) => toast.warning(message, opts),
};

export default notify;
