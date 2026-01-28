
export const sanitizeFileName = originalName => {
	return originalName.replace(/[^a-zA-Z0-9_\-.]/g, '_').trim();
};

