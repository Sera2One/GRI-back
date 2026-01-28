/**
  * Convertir l'image en image webp plus legé
 * @param {string} sourcePath - source de l'image,
 * @param {number} quality - Qualité de l'image ,
 * @param {string} outputPath - [optionnelle] fichier de de destination,
 * @returns {void} . 
 * **/

import sharp from "sharp"

export const convertToWebp = async (sourcePath, quality = 80, outputPath = undefined) => {
	sharp(sourcePath)
		.webp({ quality: quality }) // Set quality from 0-100
		.toFile(outputPath ? outputPath : sourcePath + '.webp')
		.then(info => console.log('Conversion successful:', info))
		.catch(err => console.error('Error:', err));
};
