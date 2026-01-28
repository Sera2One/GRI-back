import { colours } from "../../src/services/colours.js";

const text = ` Voici la liste des commande disponible:`
const text1 = `start: `
const text1a = `Pour lancer le serveur.`
const text2 = `db:install: Pour installer la base de donnée`
const text2a = `Pour installer la base de donnée`
const text3 = `db:initial-data :`
const text3a =  `Pour installer les données initial (module,page,component et user admin gri) par défaut de l'application`
const text4 = `db:data-test :`
const text4a =  `Pour installer les donnés test (message, poste, commentaire, etc)`
const text5 = `generete:models :` 
const text5a = `Pour installer le models, attention cette commande est utilisée à usage devellopeur uniquement.`
const text6 = `generete:fakeUsers :`
const text6a =  `Pour générer des 60 faux utilisateurs ayant de usrCode= 15 jusqu'à 60`
const text7 = `docs :` 
const text7a = `Pour générer la documentation`
const text0 = `help :` 
const text0a = `Pour afficher cette page
Comment ça marche, il suffit de taper npm run <commande>  suivie du commende :
Exemple:
npm run start
`

console.log(text);
console.log(colours.fg.yellow,text1,colours.fg.white, text1a);
console.log(colours.fg.yellow,text2,colours.fg.white, text2a);
console.log(colours.fg.yellow,text3,colours.fg.white, text3a);
console.log(colours.fg.yellow,text4,colours.fg.white, text4a);
console.log(colours.fg.yellow,text5,colours.fg.white, text5a);
console.log(colours.fg.yellow,text6,colours.fg.white, text6a);
console.log(colours.fg.yellow,text7,colours.fg.white, text7a);
console.log(colours.fg.yellow,text0,colours.fg.white, text0a);
