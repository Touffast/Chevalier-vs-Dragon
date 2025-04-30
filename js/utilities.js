'use strict';   // Mode strict du JavaScript

/*************************************************************************************************/
/* *********************************** FONCTIONS UTILITAIRES *********************************** */
/*************************************************************************************************/


function getRandomInteger(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function throwDices(dices, sides)
{
    // Déclaration des variables locales à la fonction throwDices()
    let index;
    let sum;

    // Initialisation de la somme des dés à 0
    sum = 0;

    /*
      dices = nombre de jets de dés
      Pour chaque jet de dé, le tirage renvoie un nombre entier compris entre 1 et le nombre de faces du dé
    */
    // Pour chaque jet de dé : un tirage aléatoire compris dans [1,sides]
    for(index = 0 ; index < dices ; index++){
        // ...on le lance et on ajoute sa valeur à la somme totale
        sum += getRandomInteger(1, sides);
    }

    // Retour en résultat de la somme totale des dés
    return sum;
}

function requestInteger(message, min, max)
{
    let integer;

    /*
     * La boucle s'exécute tant que l'entier n'est pas un nombre (fonction isNaN()) et
     * n'est pas compris entre les arguments min et max -> [min,max].
     */
    do
    {
        // On demande à l'utilisateur de saisir un nombre entier.
        integer = parseInt(window.prompt(message));
    }
    while(isNaN(integer) == true || integer < min || integer > max);

    return integer;
}