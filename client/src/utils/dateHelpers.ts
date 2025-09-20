export const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return options?.addSuffix ? 'just now' : 'now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const suffix = options?.addSuffix ? ' ago' : '';
    return `${diffInMinutes}m${suffix}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const suffix = options?.addSuffix ? ' ago' : '';
    return `${diffInHours}h${suffix}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    const suffix = options?.addSuffix ? ' ago' : '';
    return `${diffInDays}d${suffix}`;
  }
  
  const suffix = options?.addSuffix ? ' ago' : '';
  return `${Math.floor(diffInDays / 7)}w${suffix}`;
};

export const format = (date: Date, formatString: string): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  const dayOfWeek = date.getDay();
  
  const replacements: Record<string, string> = {
    'PPP': `${fullMonths[m]} ${d}, ${y}`,
    'MMM': months[m],
    'MMMM': fullMonths[m],
    'd': d.toString(),
    'dd': d.toString().padStart(2, '0'),
    'M': (m + 1).toString(),
    'MM': (m + 1).toString().padStart(2, '0'),
    'yyyy': y.toString(),
    'yy': y.toString().slice(-2),
    'EEEE': days[dayOfWeek],
    'MMM d': `${months[m]} ${d}`,
  };
  
  let result = formatString;
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, 'g'), value);
  });
  
  return result;
};