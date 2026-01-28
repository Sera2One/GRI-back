import { createHmac } from 'crypto';
import "../services/env.js";


const SECRET_KEY = process.env.APP_KEY;

export function generateSecureKey(text, Date) {
	const dateStr = formatDate(Date); // YYYY-MM-DD
	const baseString = `${text}#${dateStr}`;
	const signature = hmacHash(baseString, SECRET_KEY);

	// On formate pour que ça ressemble à une carte API
	return formatAsCardCode(signature);
}

export function verifySecureKey(key, text, date) {
	const expected = generateSecureKey(text, date);
	return key === expected;
}

// === Helpers ===

function hmacHash(str, secret) {
	return createHmac('sha256', secret)
		.update(str)
		.digest('hex')
		.slice(0, 32)
		.toUpperCase();
}

function formatAsCardCode(str) {
	return str.match(/.{1,4}/g).join('-');
}

function formatDate(dateInput) {
	let date;
	if (typeof dateInput === 'string') {
		date = new Date(dateInput);
	} else if (dateInput instanceof Date) {
		date = dateInput;
	} else {
		throw new Error('Date invalide');
	}

	if (isNaN(date.getTime())) {
		throw new Error('Format de date non valide');
	}

	return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ex: Clé sécurisée : 9F3A-AB2C-4F20-CC10-B212-445A-0FAB-A993
/* 
const key = generateSecureKey("USER-1", new Date("2025-06-24"));
console.log("Clé sécurisée :", key);

const valid = verifySecureKey(key, "USER-1", new Date("2025-06-24"));
console.log("Valide ?", valid);
 */
// true 