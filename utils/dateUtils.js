// Date utility functions

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const getTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) {
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
  if (months > 0) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  if (weeks > 0) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  
  return 'Just now';
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diffInMs = target - now;
  
  const seconds = Math.floor(Math.abs(diffInMs) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (diffInMs < 0) {
    // Past
    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    return 'Just now';
  } else {
    // Future
    if (days > 0) {
      return `In ${days} day${days === 1 ? '' : 's'}`;
    }
    if (hours > 0) {
      return `In ${hours} hour${hours === 1 ? '' : 's'}`;
    }
    if (minutes > 0) {
      return `In ${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    return 'Very soon';
  }
};

export const isToday = (date) => {
  if (!date) return false;
  
  const today = new Date();
  const target = new Date(date);
  
  return today.toDateString() === target.toDateString();
};

export const isYesterday = (date) => {
  if (!date) return false;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date);
  
  return yesterday.toDateString() === target.toDateString();
};

export const isThisWeek = (date) => {
  if (!date) return false;
  
  const now = new Date();
  const target = new Date(date);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  return target >= startOfWeek;
};

export const isThisMonth = (date) => {
  if (!date) return false;
  
  const now = new Date();
  const target = new Date(date);
  
  return now.getFullYear() === target.getFullYear() && 
         now.getMonth() === target.getMonth();
};

export const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6;
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getStartOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const addHours = (date, hours) => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};

export const addMinutes = (date, minutes) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  
  return `${seconds}s`;
};
