import moment from 'moment';

export const generateUniqueFileName = () => {
	return `${moment().format('YYYY-MM-DD_HH-mm-ss')}_${Math.random()
		.toString(36)
		.substring(2, 6)}`;
};
