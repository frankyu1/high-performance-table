export function isImageUrl(content) {
  return content.startsWith('http') && 
         (content.includes('.jpg') || 
          content.includes('.png') || 
          content.includes('.webp'));
};

export function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export function formatInstances(instances) {
  if (instances.length === 0) return 'N/A';
  return instances.join(', ');
}; 