const mot_de_passe = document.getElementById("mot_de_passe");
    
function affiche_page(){
const attente = document.getElementById("attente");
    attente.remove()
const chargement = document.getElementById("chargement_ok");
    chargement.style.display = "block";
}

function choisir_couleur(niveau) {
switch (niveau) { 
    case 'faible' :
        couleur = 'red';
        break;
    case 'moyen' : 
        couleur = 'orange';
        break;
    case 'fort' :
        couleur = 'green';
        break;
    default :
        couleur = 'lightblue'
}
return couleur
}

function affiche_resultat(force, niveau) {
    division = document.getElementById("color")
    division.innerHTML = "<p>La force de ce mot de passe est : " + force +" ( " + niveau + "* ) <em>*Niveau indicatif</em></p>"

    const btn_niveau = document.createElement("button")
    division.appendChild(btn_niveau)
    btn_niveau.appendChild(document.createTextNode(niveau))
    // appeler la fonction 'choisir_couleur' avec le paramètre de niveau pour obtenir la couleur associée à ce niveau
    const couleur_niveau = choisir_couleur(niveau);
    // attribuer au bouton la couleur renvoyée
    btn_niveau.style.backgroundColor = couleur_niveau;
    btn_niveau.setAttribute('id','button_color');
}

function affiche_conseils(force) {
    // sélectionner la div "conseils"
    division = document.getElementById("conseils")
    // lui ajouter le noeud avec le paragraphe "Conseils : "
    division.innerHTML = "<h2>Conseils : </h2><br> ";
    // Supprimez tous les enfants existants de la division
    while (division.firstChild) {
        division.removeChild(division.firstChild);
    }
    
    // Créez un nouvel élément 'h2' pour le titre
    let titre = document.createElement("h2");
    titre.appendChild(document.createTextNode("Conseils :"));
    division.appendChild(titre); // Ajoutez le titre à la division

    // générer la liste des conseils et l'ajouter comme nouveau noeud dans la div "conseils"
    for (let pas = 0; pas < force.length; pas++) {
        if (typeof force != 'string' ){
            let conseil = document.createElement("p");
            conseil.appendChild(document.createTextNode(force[pas]));
            division.appendChild(conseil);
        }
        else {
            let conseil = document.createElement("p");
            conseil.appendChild(document.createTextNode(force));
            division.appendChild(conseil);
            break
        }
        
    }
}
    

// initialisation Pyodide
async function main() {
    let pyodide = await loadPyodide();
    console.log("ready!")
    affiche_page()
    return pyodide;
}

// fonction qui se lance à l'appui sur le bouton "Valider"
async function evaluatePython() {

// attend que le module pyodide soit chargé
let pyodide = await pyodideReadyPromise;

// essaie de suivre les instructions du bloc "try" en cas d'erreur c'est le bloc "catch" qui est exécuté
try {
        // programme de test en Python 
        pyodide.runPython(`          
            from math import log2
            import js
            def tester_presence_par_type(mot,type_symboles):
                """
                Tester si un mot contient l'un des symboles de type_symboles
                
                PARAM
                -----
                mot(str) : un mot de passe
                type_symboles(str) : symboles recherchés
                
                RETURN
                -------
                (bool)  : vrai si le mot contient l'un des symboles recherchés, faux sinon 
                
                EXAMPLES
                --------
                >>> tester_presence_par_type("monTest","abcdefghijklmnopqrstuvwxyz")
                True
                (à compléter)
                """
                for i in range(len(mot)):
                    if mot[i] in type_symboles:
                        return True
                return False
            def estimer_force_mot_de_passe(mot) :
                """
                Estimer la force d'un mot de passe en fonction de son entropie E
                https://fr.wikipedia.org/wiki/Robustesse_d%27un_mot_de_passe#Entropie_des_mots_de_passe_al%C3%A9atoires
                E = L*log_2(N) avec
                « N » est le nombre de symboles possibles et « L » est le nombre de symboles du mot de passe
                
                # il y a 26 lettres minuscules,  26 lettres majuscules, 10 chiffres et 11 caractères spéciaux
                alphabet_minuscule = 'abcdefghijklmnopqrstuvwxyz' 
                alphabet_majuscule = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                nombre = '0123456789'
                caracteres_speciaux=' -!#$%&()*?' 
                
                PARAM
                -----
                mot(str) : un mot de passe
                
                RETURN
                -------
                (int)  : entropie E du mot de passe en supposant que les caractères sont aléatoires
                        
                EXAMPLES
                --------
                >>> estimer_force_mot_de_passe("monTest")
                39
                >>> estimer_force_mot_de_passe("monTest1")
                47
                >>> estimer_force_mot_de_passe("mon#Test1")
                55
                """
                alphabet_minuscule = 'abcdefghijklmnopqrstuvwxyz'
                alphabet_majuscule = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                nombre = '0123456789'
                caracteres_speciaux=' -!#$%&()*?'
                types = [ tester_presence_par_type(mot,type) for type in (alphabet_minuscule, alphabet_majuscule, nombre, caracteres_speciaux)]
                N = 0
                if types[0]:
                    N += 26
                if types[1]:
                    N += 26
                if types[2]:
                    N += 10
                if types[3]:
                    N += 11
                score = (len(mot))*log2(N)
                return round(score-0.5), types
            def estimer_niveau(nb) :
                """
                Estimer le niveau de sensibilté d'un mot de passe selon les préconisations de l'ANSSI : page 28 de ce document
                https://cyber.gouv.fr/publications/recommandations-relatives-lauthentification-multifacteur-et-aux-mots-de-passe    
                
                PARAM
                -----
                nb(int) : entropie d'un mot de passe
                
                RETURN
                -------
                (str)  : 'faible' , 'moyen' ou 'fort'
                
                EXAMPLES
                --------
                à compléter
                """
                if nb <= 85:
                    return "faible"
                elif nb <= 100:
                    return "moyen"
                else :
                    return "fort"
            def lister_conseils(types, mdp) :
                """
                Liste de conseils pour améliorer son mot de passe selon le type de caractères qu'il contient
                
                PARAM
                -----
                type_caracteres(list) : liste de booléens selon que le mot de passe contient ou pas dans l'ordre : 
                                            des minuscules, des majuscules, des chiffres ou des caracteres speciaux
                                        par exemple : [True, False, False, False] signifie que le mot de passe contient
                                        des minuscules et ne contient ni majuscules, ni chiffres ni caracteres spéciaux.
                mot_de_passe(str) : Le mot de passe testé
                
                RETURN
                -------
                (list)  : liste de chaines de caractères contenant chacun un conseil
                
                EXAMPLES
                --------
                à compléter
                """
                
                liste_conseils = []
                if len(mdp) < 15:
                    liste_conseils.append("Allongez votre mot de passe.")
                if not types[0] : # si le mot de passe ne contient pas de minuscules
                    liste_conseils.append("Ajoutez des minuscules.")
                if not types[1] :
                    liste_conseils.append("Ajoutez des majuscules.")
                if not types[2] :
                    liste_conseils.append("Ajoutez des chiffres.")
                if not types[3] :
                    liste_conseils.append("Ajoutez des caractères spéciaux.")
                if liste_conseils == []:
                    return "Tout a l'air bien dans ce mot de passe."
                else:
                    return liste_conseils
            mot_de_passe = js.mot_de_passe.value  # affecte la valeur de la variable js "mot de passe" à la variable python "mot de passe"
            force, presences_types = estimer_force_mot_de_passe(mot_de_passe)
            niveau = estimer_niveau(force)
            liste_conseils = lister_conseils(presences_types, mot_de_passe)
            `
        );
        // fin du Python
        
        // suite du programme en javascript
        
        let force = pyodide.globals.get('force') // pour récupérer la variable python "force" en js
        let niveau = pyodide.globals.get('niveau') // pour récupérer la variable python "niveau" en js
        let liste_conseils = pyodide.globals.get('liste_conseils') //  pour récupérer la variable python "liste_conseils" en js
        affiche_resultat(force,niveau)
        if (niveau != 'fort') {
            affiche_conseils(liste_conseils)
            }
        else {
            // on efface les anciens conseils
            conseils = document.getElementById("conseils");
            while (conseils.hasChildNodes()) {
            conseils.removeChild(conseils.firstChild);
            }
        //si le niveau du mot de passe est fort, afficher un dernier conseil dans la div "conseils" de la page HTML
            // à compléter 

        }
        
        }
        
        // en cas d'erreur dans le bloc "try", affichage de message d'erreur dans la console
        catch (err) {
        console.log(err);
        }
    }
    
let pyodideReadyPromise = main();
