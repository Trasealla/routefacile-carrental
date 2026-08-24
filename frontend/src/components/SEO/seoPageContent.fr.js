/**
 * French copy for the SEO landing pages, keyed by the slug in seoPageData.js.
 *
 * Until this existed, /fr/rent-a-car-marrakech and the twenty pages beside it
 * served the English copy verbatim under a French <title> and lang="fr" — thin
 * duplicate content as far as a search engine is concerned, and simply the wrong
 * language for the visitor. French is the working language of the Moroccan
 * market, so these are translations written to read natively, not word-for-word
 * renderings of the English.
 *
 * Shape, per slug (every field optional — anything absent falls back to the
 * English in seoPageData.js, see seoPageLocalize.js):
 *   metaTitle, metaDesc, metaKeywords, h1, h2Intro
 *   sections: [[heading, body], …]   in the same order as the English
 *   faq:      [[question, answer], …] in the same order as the English
 *   crumbs:   [name, …]               in the same order as the English
 *
 * The section and FAQ arrays are matched by POSITION and are all-or-nothing: if
 * the length does not match the English the whole array falls back. Add or
 * remove a section in seoPageData.js and you must do the same here.
 *
 * House rules are the English file's rules and they apply unchanged: quote only
 * live rates (economy from 400 MAD/jour, SUV from 600 MAD/jour, premium to
 * 1 400 MAD/jour), no insurance claims, no VAT figures, Moroccan requirements.
 */

// Repeated verbatim across pages, exactly as in the English file.
const REQUIREMENTS_BODY =
  "Pour louer une voiture chez Route Facile, il vous faut un permis de conduire détenu depuis au moins un an, un passeport (pour les visiteurs) ou une CIN (pour les résidents), ainsi qu'une caution par carte ou en espèces. Les permis rédigés en alphabet latin sont acceptés tels quels ; si le vôtre est dans une autre écriture, présentez un permis de conduire international en complément. L'âge minimum est de 21 ans. Les conducteurs de moins de 25 ans sont acceptés sur nos catégories économique et compacte.";

const DELIVERY_BODY =
  "Nous livrons dans les aéroports, les hôtels, les riads et à toute adresse privée, et nous récupérons la voiture où vous le souhaitez à la fin de la location. La livraison s'organise au moment de la réservation : indiquez-nous l'adresse et l'heure, et la voiture vous attend. Les remises en aéroport se font dans le hall des arrivées.";

const PRICE_FAQ_400 =
  "À partir de 400 MAD par jour pour une citadine économique, kilométrage illimité inclus.";

const CONTENT = {
  // ═══════════════════════════════════════════════
  // VILLES
  // ═══════════════════════════════════════════════
  "rent-a-car-marrakech": {
    metaTitle: "Location de voiture à Marrakech | Dès 400 MAD/jour — Route Facile",
    metaDesc:
      "Location de voiture à Marrakech avec Route Facile. Véhicules récents, kilométrage illimité, livraison gratuite à votre riad, votre hôtel ou à l'aéroport Ménara. Réservez en ligne en quelques minutes.",
    metaKeywords:
      "location voiture marrakech, louer une voiture à marrakech, location auto marrakech, location voiture aéroport marrakech, location voiture pas cher marrakech",
    h1: "Location de voiture à Marrakech",
    h2Intro:
      "Marrakech est la ville où Route Facile est installée : c'est donc celle que nous connaissons le mieux. Prenez votre voiture à l'aéroport Ménara, à Guéliz, ou faites-la livrer devant votre riad dans la médina — puis partez vers l'Atlas, Essaouira ou le désert d'Agafay quand bon vous semble.",
    crumbs: ["Accueil", "Location de voiture au Maroc", "Location de voiture à Marrakech"],
    sections: [
      [
        "Pourquoi louer une voiture à Marrakech ?",
        "Dans la médina, vous marcherez ; mais tout ce qui mérite le détour au-delà demande des roues. Une voiture transforme la vallée de l'Ourika, les cascades d'Ouzoud, Essaouira et le désert d'Agafay en excursions faciles à la journée, au lieu de circuits organisés qui prennent la journée entière. Le stationnement est simple à Guéliz et à l'Hivernage, et la route de l'Atlas est bien revêtue sur tout le trajet.",
      ],
      [
        "Tarifs de location de voiture à Marrakech",
        "Les citadines économiques comme la Hyundai i20 et la Renault Clio démarrent à 400 MAD par jour. Les compactes telles que la Peugeot 208 démarrent à 550 MAD. Les SUV, dont le Dacia Duster et le Peugeot 2008, démarrent à 600 MAD, et les véhicules premium vont jusqu'à 1 400 MAD par jour. Chaque tarif comprend le kilométrage illimité, et les réservations à la semaine ou au mois reviennent moins cher à la journée.",
      ],
      ["Livraison partout à Marrakech", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Combien coûte la location d'une voiture à Marrakech ?",
        "Les citadines économiques démarrent à 400 MAD par jour avec kilométrage illimité. Les SUV démarrent à 600 MAD par jour. Plus la durée est longue, plus le tarif journalier baisse.",
      ],
      [
        "Puis-je récupérer ma voiture à l'aéroport Marrakech-Ménara ?",
        "Oui. Communiquez-nous votre numéro de vol lors de la réservation et nous vous accueillons dans le hall des arrivées, voiture prête.",
      ],
      [
        "Une caution est-elle demandée ?",
        "Oui, une caution remboursable est prise à la remise des clés, par carte ou en espèces, et restituée dès que la voiture revient dans le même état.",
      ],
      [
        "Puis-je aller jusqu'à l'Atlas ou à Essaouira ?",
        "Oui. Le kilométrage est illimité et aucune restriction de circulation ne s'applique au Maroc. Les deux routes sont goudronnées et conviennent à toutes les voitures de notre flotte.",
      ],
    ],
  },

  "rent-a-car-casablanca": {
    metaTitle: "Location de voiture à Casablanca | Livraison aéroport — Route Facile",
    metaDesc:
      "Location de voiture à Casablanca avec Route Facile. Livraison à l'aéroport Mohammed V, au centre-ville ou à votre bureau. Kilométrage illimité, véhicules récents, tarifs clairs.",
    metaKeywords:
      "location voiture casablanca, louer une voiture à casablanca, location auto casablanca, location voiture aéroport mohammed v",
    h1: "Location de voiture à Casablanca",
    h2Intro:
      "Casablanca est la capitale économique du Maroc, et sa circulation récompense ceux qui ont leur propre voiture. Route Facile livre à l'aéroport Mohammed V, dans les hôtels du centre et dans les bureaux de Sidi Maârouf et de Casa Finance City.",
    crumbs: ["Accueil", "Location de voiture au Maroc", "Location de voiture à Casablanca"],
    sections: [
      [
        "Pourquoi louer une voiture à Casablanca ?",
        "La ville s'étend loin, et enchaîner la Corniche, le quartier des Habous, Maârif et les quartiers d'affaires en taxi revient vite cher. Une voiture de location met aussi Rabat, El Jadida et Azemmour à une heure d'autoroute.",
      ],
      [
        "Tarifs de location de voiture à Casablanca",
        "Les citadines économiques démarrent à 400 MAD par jour, les compactes à 550 MAD et les SUV à 600 MAD. Le kilométrage illimité est inclus dans chaque réservation. Pour un séjour d'un mois ou plus, demandez-nous nos tarifs longue durée : ils sont nettement plus avantageux à la journée.",
      ],
      ["Livraison partout à Casablanca", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Livrez-vous à l'aéroport Mohammed V ?",
        "Oui. Donnez-nous votre numéro de vol et nous vous retrouvons aux arrivées de l'aéroport Mohammed V, voiture prête à partir.",
      ],
      [
        "Quel est le prix d'une location de voiture à Casablanca par jour ?",
        "À partir de 400 MAD par jour pour une citadine économique avec kilométrage illimité. Les SUV démarrent à 600 MAD par jour.",
      ],
      [
        "Puis-je louer à Casablanca et rendre la voiture à Marrakech ?",
        "Oui, les locations en aller simple entre les villes que nous desservons sont possibles. Indiquez les deux villes au moment de réserver pour que nous confirmions l'organisation.",
      ],
    ],
  },

  "rent-a-car-rabat": {
    metaTitle: "Location de voiture à Rabat | Location dans la capitale — Route Facile",
    metaDesc:
      "Location de voiture à Rabat avec Route Facile. Livraison à l'aéroport Rabat-Salé, dans le quartier de l'Agdal ou à votre hôtel. Kilométrage illimité et tarifs clairs, tout compris.",
    metaKeywords:
      "location voiture rabat, louer une voiture à rabat, location auto rabat, location voiture aéroport rabat salé",
    h1: "Location de voiture à Rabat",
    h2Intro:
      "Rabat est compacte, verte et agréable à conduire. Route Facile livre à l'aéroport Rabat-Salé, dans les quartiers de l'Agdal et de Hassan, ainsi que dans les hôtels le long du fleuve.",
    crumbs: ["Accueil", "Location de voiture au Maroc", "Location de voiture à Rabat"],
    sections: [
      [
        "Pourquoi louer une voiture à Rabat ?",
        "La capitale est agréable à conduire selon les standards marocains, avec de larges avenues et une circulation raisonnable. Une voiture rend Salé, Témara et les plages au sud de la ville faciles d'accès, et Casablanca est à moins d'une heure par l'autoroute.",
      ],
      [
        "Tarifs de location de voiture à Rabat",
        "Les tarifs démarrent à 400 MAD par jour pour les citadines économiques et à 600 MAD pour les SUV, tous avec kilométrage illimité. Les réservations à la semaine et au mois bénéficient d'un tarif journalier réduit : demandez-le au moment de réserver.",
      ],
      ["Livraison partout à Rabat", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Puis-je récupérer une voiture à l'aéroport Rabat-Salé ?",
        "Oui. Transmettez-nous les détails de votre vol au moment de réserver et la voiture vous attendra à l'aéroport.",
      ],
      ["Combien coûte une location de voiture à Rabat ?", PRICE_FAQ_400],
      [
        "Est-il facile de se garer à Rabat ?",
        "En général, oui. Le stationnement en voirie est largement disponible à l'Agdal et à Hassan, et les parkings gardés sont peu coûteux.",
      ],
    ],
  },

  "rent-a-car-agadir": {
    metaTitle: "Location de voiture à Agadir | Plage et aéroport — Route Facile",
    metaDesc:
      "Location de voiture à Agadir avec Route Facile. Livraison à l'aéroport Al Massira et dans les hôtels du front de mer. Kilométrage illimité, véhicules récents, tarifs transparents.",
    metaKeywords:
      "location voiture agadir, louer une voiture à agadir, location auto agadir, location voiture aéroport agadir",
    h1: "Location de voiture à Agadir",
    h2Intro:
      "Agadir est une ville qui se parcourt en voiture : la plage, la marina et les villages de surf le long de la côte sont très étalés. Route Facile livre à l'aéroport Al Massira et dans les hôtels de la baie.",
    crumbs: ["Accueil", "Location de voiture au Maroc", "Location de voiture à Agadir"],
    sections: [
      [
        "Pourquoi louer une voiture à Agadir ?",
        "Avec une voiture, vous atteignez Taghazout et les spots de surf en une demi-heure, vous descendez jusqu'à Sidi Ifni, ou vous partez vers l'intérieur pour Paradise Valley et le parc de Souss-Massa. Aucun de ces trajets n'est réellement praticable sans véhicule.",
      ],
      [
        "Tarifs de location de voiture à Agadir",
        "Les citadines économiques démarrent à 400 MAD par jour et les SUV à 600 MAD, avec kilométrage illimité sur chaque réservation. Les locations plus longues font baisser le tarif journalier.",
      ],
      ["Livraison partout à Agadir", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Livrez-vous à l'aéroport Agadir Al Massira ?",
        "Oui. Communiquez-nous votre numéro de vol au moment de réserver et nous vous retrouvons aux arrivées.",
      ],
      [
        "Puis-je aller à Taghazout ou à Paradise Valley ?",
        "Oui. Le kilométrage est illimité et les deux itinéraires sont goudronnés, adaptés à toutes les voitures de la flotte.",
      ],
      ["Combien coûte une location de voiture à Agadir ?", PRICE_FAQ_400],
    ],
  },

  "rent-a-car-tanger": {
    metaTitle: "Location de voiture à Tanger | Aéroport et port — Route Facile",
    metaDesc:
      "Location de voiture à Tanger avec Route Facile. Livraison à l'aéroport Ibn Battouta, au port et au centre-ville. Kilométrage illimité et tarification simple.",
    metaKeywords:
      "location voiture tanger, louer une voiture à tanger, location auto tanger, location voiture aéroport tanger",
    h1: "Location de voiture à Tanger",
    h2Intro:
      "Tanger se tient là où la Méditerranée rencontre l'Atlantique, et c'est le littoral de part et d'autre qui justifie d'avoir une voiture. Route Facile livre à l'aéroport Ibn Battouta, au port des ferries et dans les hôtels du centre-ville.",
    crumbs: ["Accueil", "Location de voiture au Maroc", "Location de voiture à Tanger"],
    sections: [
      [
        "Pourquoi louer une voiture à Tanger ?",
        "Le cap Spartel, les grottes d'Hercule, Asilah et Chefchaouen sont tous à distance confortable de Tanger. Si vous arrivez par ferry depuis l'Espagne, avoir une voiture qui vous attend au port fait gagner énormément de temps.",
      ],
      [
        "Tarifs de location de voiture à Tanger",
        "À partir de 400 MAD par jour pour les citadines économiques et de 600 MAD pour les SUV, kilométrage illimité inclus. Demandez nos tarifs hebdomadaires pour les séjours plus longs.",
      ],
      ["Livraison partout à Tanger", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Puis-je récupérer une voiture au port de Tanger ?",
        "Oui. Indiquez-nous votre heure d'arrivée en ferry au moment de réserver et nous vous retrouverons au port.",
      ],
      [
        "Puis-je aller de Tanger à Chefchaouen ?",
        "Oui, comptez environ deux heures de route sur de bonnes voies, et le kilométrage est illimité.",
      ],
      [
        "Combien coûte une location de voiture à Tanger ?",
        "Les citadines économiques démarrent à 400 MAD par jour.",
      ],
    ],
  },

  "rent-a-car-fes": {
    metaTitle: "Location de voiture à Fès | Pour la médina et au-delà — Route Facile",
    metaDesc:
      "Location de voiture à Fès avec Route Facile. Livraison à l'aéroport Fès-Saïss et dans les hôtels près de la médina. Kilométrage illimité, véhicules récents, tarifs clairs.",
    metaKeywords:
      "location voiture fès, louer une voiture à fès, location auto fès, location voiture aéroport fès saïss",
    h1: "Location de voiture à Fès",
    h2Intro:
      "Fès prend toute sa valeur en voiture dès que l'on sort de la médina : Meknès, Volubilis, Ifrane et les cédraies du Moyen Atlas sont tous à portée. Route Facile livre à l'aéroport Fès-Saïss et dans les hôtels autour de la vieille ville.",
    crumbs: ["Accueil", "Location de voiture au Maroc", "Location de voiture à Fès"],
    sections: [
      [
        "Pourquoi louer une voiture à Fès ?",
        "La médina elle-même est interdite aux voitures : une location sert donc à découvrir ce qui l'entoure. Volubilis et Meknès font une belle sortie à la journée, et la montée vers Ifrane et la cédraie est l'une des plus belles routes du pays.",
      ],
      [
        "Tarifs de location de voiture à Fès",
        "Les citadines économiques démarrent à 400 MAD par jour et les SUV à 600 MAD, avec kilométrage illimité sur toute la gamme.",
      ],
      ["Livraison partout à Fès", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Puis-je circuler en voiture dans la médina de Fès ?",
        "Non, la médina est entièrement piétonne. Nous livrons à votre hôtel ou au parking accessible le plus proche, selon ce qui vous arrange le mieux.",
      ],
      [
        "Volubilis est à quelle distance de Fès en voiture ?",
        "Environ 1 h 30 de route à l'aller, sur de bonnes voies.",
      ],
      ["Combien coûte une location de voiture à Fès ?", PRICE_FAQ_400],
    ],
  },

  "rent-a-car-oujda": {
    metaTitle: "Location de voiture à Oujda | Maroc oriental — Route Facile",
    metaDesc:
      "Location de voiture à Oujda avec Route Facile. Livraison à l'aéroport Angads et au centre-ville. Kilométrage illimité et tarifs transparents dans tout l'Oriental.",
    metaKeywords:
      "location voiture oujda, louer une voiture à oujda, location auto oujda, location voiture aéroport oujda",
    h1: "Location de voiture à Oujda",
    h2Intro:
      "Oujda est la porte d'entrée du Maroc oriental et de la côte méditerranéenne à Saïdia. Route Facile livre à l'aéroport Angads et partout dans la ville.",
    crumbs: ["Accueil", "Location de voiture au Maroc", "Location de voiture à Oujda"],
    sections: [
      [
        "Pourquoi louer une voiture à Oujda ?",
        "Les plages de Saïdia, les monts des Beni-Snassen et les gorges du Zegzel sont tous à courte distance de la ville, et aucun n'est bien desservi par les transports en commun.",
      ],
      [
        "Tarifs de location de voiture à Oujda",
        "À partir de 400 MAD par jour pour les citadines économiques avec kilométrage illimité ; SUV à partir de 600 MAD par jour.",
      ],
      ["Livraison partout à Oujda", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Livrez-vous à l'aéroport Oujda Angads ?",
        "Oui, avec votre numéro de vol nous vous retrouvons aux arrivées.",
      ],
      [
        "Saïdia est à quelle distance d'Oujda ?",
        "Environ une heure de voiture sur une bonne route.",
      ],
    ],
  },

  // ═══════════════════════════════════════════════
  // CATÉGORIES
  // ═══════════════════════════════════════════════
  "suv-rental-morocco": {
    metaTitle: "Location de SUV au Maroc | SUV et 4x4 dès 600 MAD — Route Facile",
    metaDesc:
      "Louez un SUV au Maroc avec Route Facile. Dacia Duster, Peugeot 2008, Hyundai Tucson et d'autres à partir de 600 MAD/jour avec kilométrage illimité.",
    metaKeywords:
      "location suv maroc, location 4x4 maroc, louer un suv à marrakech, location dacia duster maroc",
    h1: "Location de SUV au Maroc",
    h2Intro:
      "Une garde au sol plus haute et un coffre plus vaste font du SUV le choix raisonnable pour l'Atlas, les routes du désert et les longs trajets en famille. La gamme SUV de Route Facile démarre à 600 MAD par jour avec kilométrage illimité.",
    crumbs: ["Accueil", "Notre flotte", "Location de SUV au Maroc"],
    sections: [
      [
        "Notre gamme de SUV",
        "Le Dacia Duster et le Peugeot 2008 démarrent à 600 MAD par jour, le Hyundai Tucson à 750 MAD. Tous sont automatiques, accueillent cinq personnes et incluent le kilométrage illimité.",
      ],
      [
        "Quand un SUV en vaut la peine",
        "Choisissez un SUV si vous partez dans l'Atlas, si vous empruntez les routes de l'Agafay ou de Merzouga, ou si vous voyagez en famille avec tous les bagages. Pour la conduite en ville et les trajets d'autoroute, une citadine économique ou compacte revient moins cher et se révèle tout aussi confortable.",
      ],
      ["Où nous livrons", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Combien coûte la location d'un SUV au Maroc ?",
        "Les SUV démarrent à 600 MAD par jour avec kilométrage illimité. Le Hyundai Tucson démarre à 750 MAD par jour.",
      ],
      ["Vos SUV sont-ils automatiques ?", "Oui, les SUV de notre flotte sont automatiques."],
      [
        "Puis-je emprunter des pistes non goudronnées avec un SUV ?",
        "Les pistes légères sans revêtement ne posent pas de problème. Le tout-terrain sérieux et les parcours dans les dunes ne sont pas autorisés — parlez-nous de votre itinéraire et nous vous conseillerons le véhicule adapté.",
      ],
    ],
  },

  "luxury-car-rental-marrakech": {
    metaTitle: "Location de voiture de luxe à Marrakech | Véhicules premium — Route Facile",
    metaDesc:
      "Location de voiture premium à Marrakech avec Route Facile. Véhicules récents et bien équipés, livrés à votre riad, votre hôtel ou à l'aéroport Ménara.",
    metaKeywords:
      "location voiture luxe marrakech, location voiture premium marrakech, louer une voiture haut de gamme marrakech",
    h1: "Location de voiture de luxe à Marrakech",
    h2Intro:
      "Pour un mariage, un déplacement professionnel ou toute occasion où la voiture compte, la gamme premium de Route Facile propose des véhicules récents et bien équipés, livrés là où vous séjournez à Marrakech.",
    crumbs: ["Accueil", "Notre flotte", "Location de voiture de luxe à Marrakech"],
    sections: [
      [
        "Notre gamme premium",
        "Les véhicules premium se situent entre 900 et 1 400 MAD par jour environ selon le modèle et la saison, kilométrage illimité inclus. Les disponibilités sont limitées : réservez à l'avance pour des dates précises.",
      ],
      ["Livraison et remise des clés", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Combien coûte la location d'une voiture de luxe à Marrakech ?",
        "Les véhicules premium se situent entre 900 et 1 400 MAD par jour environ avec kilométrage illimité, selon le modèle et la saison.",
      ],
      [
        "La voiture peut-elle être livrée à mon riad ?",
        "Oui. Lorsque le riad se trouve dans la médina piétonne, nous livrons au point d'accès véhicule le plus proche et nous vous accompagnons à pied jusqu'au bout.",
      ],
      [
        "Proposez-vous un chauffeur ?",
        "Nos véhicules premium sont proposés en conduite libre. Contactez-nous directement pour envisager une autre formule.",
      ],
    ],
  },

  "cheap-car-rental-morocco": {
    metaTitle: "Location de voiture pas chère au Maroc | Dès 400 MAD/jour — Route Facile",
    metaDesc:
      "Location de voiture abordable au Maroc à partir de 400 MAD par jour. Kilométrage illimité, aucun frais caché, livraison gratuite. Réservez avec Route Facile en quelques minutes.",
    metaKeywords:
      "location voiture pas cher maroc, location voiture économique maroc, louer une voiture pas chère à marrakech",
    h1: "Location de voiture pas chère au Maroc",
    h2Intro:
      "La formule la plus économique chez Route Facile est une citadine à partir de 400 MAD par jour, réservée exactement pour la durée dont vous avez besoin — le tarif journalier baisse à mesure que la location s'allonge.",
    crumbs: ["Accueil", "Notre flotte", "Location de voiture pas chère au Maroc"],
    sections: [
      [
        "Nos voitures les plus abordables",
        "La Hyundai i20 démarre à 400 MAD par jour et la Renault Clio à 450 MAD. Les deux sont automatiques, accueillent cinq personnes et incluent le kilométrage illimité — ce qui compte, car les distances au Maroc s'additionnent vite.",
      ],
      [
        "Comment faire baisser la facture",
        "Réservez toute la période en une seule fois plutôt qu'en plusieurs locations courtes, prenez une citadine économique sauf si vous avez réellement besoin de place, et réservez tôt en haute saison, car ce sont les catégories les moins chères qui partent en premier.",
      ],
      [
        "Aucun frais caché",
        "Le prix annoncé est le prix payé. Le kilométrage est illimité, la livraison et la récupération font partie de la réservation, et aucun frais de service ne s'ajoute à la remise des clés. Le seul montant distinct est la caution remboursable, restituée quand la voiture revient telle qu'elle est partie.",
      ],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Quelle est la location de voiture la moins chère au Maroc ?",
        "Notre catégorie économique démarre à 400 MAD par jour, kilométrage illimité inclus.",
      ],
      [
        "Y a-t-il des frais cachés ?",
        "Non. Le tarif annoncé est celui que vous payez, auquel s'ajoute une caution remboursable restituée à la fin de la location.",
      ],
      [
        "Le kilométrage est-il vraiment illimité ?",
        "Oui, sur chaque réservation. Aucun frais au kilomètre n'est appliqué où que ce soit au Maroc.",
      ],
    ],
  },

  "monthly-car-rental-morocco": {
    metaTitle: "Location de voiture au mois au Maroc | Tarifs longue durée — Route Facile",
    metaDesc:
      "Location de voiture au mois au Maroc avec Route Facile. Tarifs journaliers réduits pour les longs séjours, kilométrage illimité, livraison incluse. Idéal pour les télétravailleurs et les résidents.",
    metaKeywords:
      "location voiture mensuelle maroc, location voiture au mois maroc, location longue durée maroc",
    h1: "Location de voiture au mois au Maroc",
    h2Intro:
      "Vous restez un mois ou plus ? Une réservation mensuelle coûte nettement moins cher à la journée que des locations courtes répétées, et la voiture reste avec vous du début à la fin.",
    crumbs: ["Accueil", "Notre flotte", "Location de voiture au mois au Maroc"],
    sections: [
      [
        "Comment fonctionne la location mensuelle",
        "Vous choisissez la voiture et la date de départ, et vous la gardez pour le mois. L'entretien courant et les révisions sont à notre charge. Si vos plans changent, la prolongation est en général simple — prévenez-nous avant la date de restitution.",
      ],
      [
        "À qui cela convient",
        "Aux télétravailleurs qui passent une saison à Marrakech ou à Essaouira, aux familles en séjour prolongé et aux résidents entre deux véhicules. Au-delà de trois mois, contactez-nous directement : nous pouvons établir un devis sur une durée plus longue.",
      ],
      ["Livraison et récupération", DELIVERY_BODY],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Combien coûte une location de voiture au mois au Maroc ?",
        "Les tarifs mensuels dépendent du véhicule et de la saison, et reviennent bien en dessous du tarif journalier. Envoyez-nous vos dates et nous établissons un devis pour la voiture exacte.",
      ],
      [
        "Puis-je prolonger une location mensuelle ?",
        "Oui, sous réserve de disponibilité. Prévenez-nous avant la date de restitution et nous nous en occupons.",
      ],
      [
        "L'entretien est-il inclus ?",
        "Oui. Les révisions courantes pendant votre location sont prises en charge par nos soins, sans supplément.",
      ],
    ],
  },

  "long-term-car-rental-casablanca": {
    metaTitle: "Location longue durée à Casablanca | Tarifs entreprises — Route Facile",
    metaDesc:
      "Location de voiture longue durée à Casablanca pour les entreprises et les résidents. Tarifs mensuels réduits, entretien pris en charge, livraison à votre bureau. Route Facile.",
    metaKeywords:
      "location longue durée casablanca, location voiture au mois casablanca, LLD casablanca",
    h1: "Location longue durée à Casablanca",
    h2Intro:
      "Pour les véhicules de fonction, les missions de plusieurs mois et les séjours prolongés, une location longue durée à Casablanca revient bien moins cher à la journée qu'une réservation courte et vous décharge de la gestion du véhicule.",
    crumbs: ["Accueil", "Notre flotte", "Location longue durée à Casablanca"],
    sections: [
      [
        "Comment ça marche",
        "Vous choisissez le véhicule et la période, et nous le livrons à votre bureau ou à votre adresse à Casablanca. L'entretien reste à notre charge pendant toute la durée. Une facturation mensuelle peut être mise en place pour les comptes entreprises.",
      ],
      [
        "Pour les entreprises",
        "Si vous avez besoin de plusieurs véhicules, ou de véhicules répartis sur plusieurs villes, écrivez-nous à info@routefacilecarrental.com et nous établirons un devis pour l'ensemble du besoin.",
      ],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "À partir de quand parle-t-on de longue durée ?",
        "À partir d'un mois. Au-delà de trois mois, contactez-nous pour un tarif sur mesure.",
      ],
      [
        "Pouvez-vous facturer une entreprise ?",
        "Oui. Une facturation mensuelle pour les comptes entreprises peut être mise en place au moment de la réservation.",
      ],
      ["Qui prend en charge l'entretien ?", "Nous, pendant toute la durée de la location."],
    ],
  },

  "airport-car-rental-morocco": {
    metaTitle: "Location de voiture en aéroport au Maroc | Accueil aux arrivées — Route Facile",
    metaDesc:
      "Location de voiture dans les aéroports marocains — Marrakech Ménara, Casablanca Mohammed V, Agadir Al Massira, Tanger Ibn Battouta. Accueil aux arrivées par Route Facile.",
    metaKeywords:
      "location voiture aéroport maroc, location voiture aéroport marrakech, location voiture aéroport casablanca, location voiture aéroport agadir",
    h1: "Location de voiture en aéroport au Maroc",
    h2Intro:
      "Route Facile vous accueille dans le hall des arrivées, voiture prête. Pas de navette vers un dépôt excentré, pas de file d'attente à un comptoir : communiquez votre numéro de vol à la réservation et nous suivons l'arrivée.",
    crumbs: ["Accueil", "Notre flotte", "Location de voiture en aéroport au Maroc"],
    sections: [
      [
        "Les aéroports que nous couvrons",
        "Marrakech Ménara (RAK), Casablanca Mohammed V (CMN), Agadir Al Massira (AGA), Tanger Ibn Battouta (TNG), Fès-Saïss (FEZ), Rabat-Salé (RBA) et Oujda Angads (OUD).",
      ],
      [
        "Comment se passe la remise des clés",
        "Donnez-nous votre numéro de vol au moment de réserver. Nous surveillons l'arrivée : un vol retardé ne vous fait donc pas perdre la voiture. Notre chauffeur vous retrouve aux arrivées avec les clés et le dossier, fait le tour du véhicule avec vous, et vous partez.",
      ],
      [
        "Vols tardifs et matinaux",
        "Les arrivées en dehors des horaires habituels ne posent aucun problème : indiquez-nous l'heure et nous y serons. Les restitutions fonctionnent de la même manière : nous récupérons la voiture à l'aéroport le jour de votre départ.",
      ],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Que se passe-t-il si mon vol a du retard ?",
        "Nous suivons votre numéro de vol : la remise des clés se décale simplement avec l'heure d'arrivée, sans supplément.",
      ],
      [
        "La livraison à l'aéroport est-elle facturée en plus ?",
        "La livraison à l'aéroport s'organise dans le cadre de votre réservation : confirmez-la au moment de réserver et le coût est compris dans le devis affiché.",
      ],
      [
        "Puis-je restituer la voiture dans un autre aéroport ?",
        "Oui, entre les aéroports que nous desservons. Indiquez les deux aéroports au moment de réserver pour que nous confirmions l'organisation.",
      ],
    ],
  },

  "7-seater-car-rental-morocco": {
    metaTitle: "Location de voiture 7 places au Maroc | Familles et groupes — Route Facile",
    metaDesc:
      "Location de voiture 7 places et de monospaces familiaux au Maroc avec Route Facile. De la place pour les bagages, kilométrage illimité, livraison à votre hôtel ou à l'aéroport.",
    metaKeywords:
      "location voiture 7 places maroc, location monospace maroc, location voiture familiale marrakech, 7 places location maroc",
    h1: "Location de voiture 7 places au Maroc",
    h2Intro:
      "Vous voyagez en famille ou en groupe ? Nos véhicules les plus spacieux accueillent sept personnes tout en laissant de la place aux bagages — un point qui compte sur les longs trajets entre les villes marocaines.",
    crumbs: ["Accueil", "Notre flotte", "Location de voiture 7 places au Maroc"],
    sections: [
      [
        "Véhicules familiaux et pour groupes",
        "La disponibilité des véhicules 7 places varie selon la ville et la saison. Indiquez-nous vos dates, la taille de votre groupe et le volume de bagages, et nous vous confirmerons ce que nous pouvons mettre à votre disposition.",
      ],
      [
        "Organiser un voyage en groupe",
        "Pour un Marrakech-Merzouga, ou un circuit passant par Fès, Chefchaouen et Tanger, le kilométrage illimité fait que la distance ne vous coûte rien de plus. Des sièges enfant peuvent être prévus : demandez-les au moment de réserver.",
      ],
      ["Ce qu'il vous faut pour louer", REQUIREMENTS_BODY],
    ],
    faq: [
      [
        "Avez-vous des voitures 7 places disponibles ?",
        "La disponibilité varie selon la ville et la date. Envoyez-nous vos dates et la taille de votre groupe et nous vous confirmerons ce qui est disponible.",
      ],
      [
        "Puis-je obtenir des sièges enfant ?",
        "Oui, des sièges enfant peuvent être prévus : demandez-les au moment de réserver.",
      ],
      [
        "Y a-t-il assez de place pour les bagages de sept personnes ?",
        "Dites-nous combien de bagages vous emportez et nous vous recommanderons le véhicule adapté, plutôt que de vous laisser deviner.",
      ],
    ],
  },

  // ═══════════════════════════════════════════════
  // AÉROPORTS ET QUARTIERS
  // ═══════════════════════════════════════════════
  "car-rental-marrakech-menara-airport": {
    metaTitle: "Location de voiture à l'aéroport Marrakech-Ménara (RAK) — Route Facile",
    metaDesc:
      "Louez une voiture à l'aéroport Marrakech-Ménara. Accueil aux arrivées, voiture prête, vol suivi, kilométrage illimité. Réservez avec Route Facile.",
    metaKeywords:
      "location voiture aéroport marrakech ménara, location voiture RAK, louer une voiture aéroport marrakech",
    h1: "Location de voiture à l'aéroport Marrakech-Ménara",
    h2Intro:
      "Ménara est à dix minutes de route de la médina, et récupérer la voiture dès les arrivées vous met immédiatement en route au lieu de négocier un taxi à la descente d'avion.",
    crumbs: ["Accueil", "Location de voiture à Marrakech", "Aéroport Ménara"],
    sections: [
      [
        "Notre accueil à RAK",
        "Communiquez votre numéro de vol au moment de réserver. Nous surveillons l'heure d'arrivée, nous vous retrouvons dans le hall des arrivées, nous vous remettons les clés et nous vous accompagnons jusqu'à la voiture. Ni navette vers un dépôt, ni file d'attente à un comptoir.",
      ],
      [
        "Tarifs au départ de l'aéroport Ménara",
        "Citadines économiques à partir de 400 MAD par jour, SUV à partir de 600 MAD, tous avec kilométrage illimité.",
      ],
      [
        "Restitution de la voiture",
        "Nous récupérons le véhicule à l'aéroport le jour de votre départ. Indiquez-nous votre heure de vol et nous vous y retrouverons.",
      ],
    ],
    faq: [
      [
        "Où nous retrouvons-nous exactement à l'aéroport Ménara ?",
        "Dans le hall des arrivées, après le passage de la douane. Nous confirmons le point de rendez-vous par WhatsApp avant votre vol.",
      ],
      [
        "Et si mon vol atterrit tard dans la nuit ?",
        "Aucun problème. Indiquez-nous l'heure d'arrivée au moment de réserver et nous serons là.",
      ],
    ],
  },

  "car-rental-casablanca-mohammed-v-airport": {
    metaTitle: "Location de voiture à l'aéroport Casablanca Mohammed V (CMN) — Route Facile",
    metaDesc:
      "Louez une voiture à l'aéroport Casablanca Mohammed V. Accueil aux arrivées, vol suivi, kilométrage illimité, tarifs clairs. Réservez avec Route Facile.",
    metaKeywords:
      "location voiture aéroport casablanca, location voiture mohammed v, location voiture CMN",
    h1: "Location de voiture à l'aéroport Casablanca Mohammed V",
    h2Intro:
      "Mohammed V est la principale porte d'entrée internationale du Maroc et se situe à environ 30 km du centre de Casablanca. Disposer de sa voiture dès les arrivées simplifie autant la ville que l'autoroute vers Rabat ou Marrakech.",
    crumbs: ["Accueil", "Location de voiture à Casablanca", "Aéroport Mohammed V"],
    sections: [
      [
        "Notre accueil à CMN",
        "Donnez-nous votre numéro de vol et nous suivons l'arrivée. Notre chauffeur vous retrouve dans le hall des arrivées, voiture prête et dossier déjà rempli.",
      ],
      [
        "Tarifs au départ de l'aéroport Mohammed V",
        "À partir de 400 MAD par jour pour les citadines économiques et de 600 MAD pour les SUV, kilométrage illimité inclus.",
      ],
      [
        "Les trajets au départ de l'aéroport",
        "Rabat est à moins d'une heure par l'autoroute, Marrakech à environ trois heures, et El Jadida à une heure et demie en longeant la côte.",
      ],
    ],
    faq: [
      [
        "À quelle distance l'aéroport Mohammed V est-il du centre de Casablanca ?",
        "Environ 30 km, soit 30 à 40 minutes selon la circulation.",
      ],
      [
        "Puis-je rejoindre Marrakech directement depuis CMN ?",
        "Oui. Comptez environ trois heures d'autoroute, et le kilométrage est illimité.",
      ],
    ],
  },

  "car-rental-agadir-al-massira-airport": {
    metaTitle: "Location de voiture à l'aéroport Agadir Al Massira (AGA) — Route Facile",
    metaDesc:
      "Louez une voiture à l'aéroport Agadir Al Massira. Accueil aux arrivées, voiture prête, kilométrage illimité, tarifs transparents. Route Facile.",
    metaKeywords:
      "location voiture aéroport agadir, location voiture al massira, location voiture AGA maroc",
    h1: "Location de voiture à l'aéroport Agadir Al Massira",
    h2Intro:
      "Al Massira se trouve à environ 25 km du front de mer d'Agadir. Avec une voiture qui vous attend, vous êtes à votre hôtel — ou plus haut sur la côte à Taghazout — en moins d'une heure.",
    crumbs: ["Accueil", "Location de voiture à Agadir", "Aéroport Al Massira"],
    sections: [
      [
        "Notre accueil à AGA",
        "Communiquez votre numéro de vol au moment de réserver. Nous vous retrouvons aux arrivées avec les clés et nous effectuons la remise sur place.",
      ],
      [
        "Tarifs au départ de l'aéroport Al Massira",
        "Citadines économiques à partir de 400 MAD par jour, SUV à partir de 600 MAD, kilométrage illimité sur toute la gamme.",
      ],
      [
        "Où l'on part d'ici",
        "Taghazout et les plages de surf sont à une demi-heure au nord, Paradise Valley à environ une heure dans les terres, et Sidi Ifni à deux heures et demie au sud.",
      ],
    ],
    faq: [
      [
        "À quelle distance l'aéroport Al Massira est-il d'Agadir ?",
        "Environ 25 km, soit à peu près 30 minutes en voiture.",
      ],
      [
        "Puis-je restituer la voiture à l'aéroport ?",
        "Oui. Indiquez-nous votre heure de départ et nous viendrons la récupérer à l'aéroport.",
      ],
    ],
  },

  "car-rental-tanger-ibn-battouta-airport": {
    metaTitle: "Location de voiture à l'aéroport Tanger Ibn Battouta (TNG) — Route Facile",
    metaDesc:
      "Louez une voiture à l'aéroport Tanger Ibn Battouta. Accueil aux arrivées, kilométrage illimité, trajets faciles vers Chefchaouen et Asilah. Route Facile.",
    metaKeywords:
      "location voiture aéroport tanger, location voiture ibn battouta, location voiture TNG maroc",
    h1: "Location de voiture à l'aéroport Tanger Ibn Battouta",
    h2Intro:
      "Ibn Battouta est à environ 15 km du centre de Tanger. Une voiture dès les arrivées met Asilah, Chefchaouen et la côte du cap Spartel à portée confortable.",
    crumbs: ["Accueil", "Location de voiture à Tanger", "Aéroport Ibn Battouta"],
    sections: [
      [
        "Notre accueil à TNG",
        "Donnez-nous votre numéro de vol et nous serons dans le hall des arrivées, voiture prête à partir.",
      ],
      [
        "Tarifs au départ de l'aéroport Ibn Battouta",
        "À partir de 400 MAD par jour pour les citadines économiques et de 600 MAD pour les SUV, kilométrage illimité inclus.",
      ],
      [
        "Les trajets au départ de Tanger",
        "Asilah est à environ 45 minutes en descendant la côte atlantique, Chefchaouen à environ deux heures dans les terres, et le cap Spartel à quelques minutes de la ville.",
      ],
    ],
    faq: [
      [
        "Pouvez-vous aussi me retrouver au port de Tanger ?",
        "Oui. Indiquez-nous votre heure d'arrivée en ferry et nous vous retrouverons au port à la place.",
      ],
      [
        "À quelle distance l'aéroport est-il du centre de Tanger ?",
        "Environ 15 km, soit à peu près 20 minutes.",
      ],
    ],
  },

  "car-rental-marrakech-gueliz": {
    metaTitle: "Location de voiture à Guéliz, Marrakech | Livraison à domicile — Route Facile",
    metaDesc:
      "Location de voiture à Guéliz, Marrakech. Livrée à votre appartement, votre hôtel ou votre bureau dans la ville nouvelle. Kilométrage illimité, tarifs clairs. Route Facile.",
    metaKeywords:
      "location voiture guéliz, location voiture guéliz marrakech, louer une voiture à guéliz",
    h1: "Location de voiture à Guéliz, Marrakech",
    h2Intro:
      "Guéliz est le quartier moderne de Marrakech et la partie de la ville où il est le plus simple de conduire et de se garer. Route Facile livre dans les appartements, les bureaux et les hôtels de tout le quartier.",
    crumbs: ["Accueil", "Location de voiture à Marrakech", "Guéliz"],
    sections: [
      [
        "Livraison à Guéliz",
        "Donnez-nous l'adresse et une heure, et nous vous amenons la voiture. La remise prend quelques minutes : le dossier, un tour du véhicule, et les clés.",
      ],
      [
        "Conduire et se garer à Guéliz",
        "Les rues y sont larges et bien signalées, et le stationnement en voirie comme les parkings gardés se trouvent facilement — tout le contraire de la médina, où les voitures ne circulent pas du tout.",
      ],
      [
        "Tarifs",
        "Citadines économiques à partir de 400 MAD par jour, SUV à partir de 600 MAD, kilométrage illimité inclus.",
      ],
    ],
    faq: [
      [
        "Livrez-vous dans les appartements à Guéliz ?",
        "Oui, dans les appartements, les hôtels et les bureaux, partout dans le quartier.",
      ],
      [
        "Est-il facile de se garer à Guéliz ?",
        "Oui. Le stationnement en voirie et les parkings gardés sont tous deux largement disponibles.",
      ],
    ],
  },

  "car-rental-marrakech-hivernage": {
    metaTitle: "Location de voiture à l'Hivernage, Marrakech | Livraison à l'hôtel — Route Facile",
    metaDesc:
      "Location de voiture à l'Hivernage, Marrakech. Livrée à votre hôtel ou à votre résidence, kilométrage illimité, tarification simple. Route Facile.",
    metaKeywords:
      "location voiture hivernage, location voiture hivernage marrakech, louer une voiture à l'hivernage",
    h1: "Location de voiture à l'Hivernage, Marrakech",
    h2Intro:
      "L'Hivernage est le quartier des hôtels, à quelques minutes de la Koutoubia et des jardins de la Ménara. Route Facile livre devant les hôtels dans tout le quartier.",
    crumbs: ["Accueil", "Location de voiture à Marrakech", "Hivernage"],
    sections: [
      [
        "Livraison à l'hôtel à l'Hivernage",
        "Indiquez-nous l'hôtel et l'heure. Nous vous retrouvons à l'entrée, nous effectuons la remise sur place, et nous récupérons la voiture de la même manière à la fin de votre séjour.",
      ],
      [
        "Sortir de la ville",
        "Depuis l'Hivernage, la route vers l'Atlas et la vallée de l'Ourika se prend directement, et l'aéroport Ménara est à une dizaine de minutes.",
      ],
      [
        "Tarifs",
        "À partir de 400 MAD par jour pour les citadines économiques et de 600 MAD pour les SUV, avec kilométrage illimité.",
      ],
    ],
    faq: [
      [
        "La voiture peut-elle être livrée à mon hôtel à l'Hivernage ?",
        "Oui, nous vous retrouvons à l'entrée de l'hôtel à l'heure qui vous convient.",
      ],
      [
        "À quelle distance l'Hivernage est-il de l'aéroport ?",
        "À une dizaine de minutes en voiture.",
      ],
    ],
  },

  "car-rental-casablanca-ain-diab": {
    metaTitle: "Location de voiture à Aïn Diab, Casablanca | Livraison Corniche — Route Facile",
    metaDesc:
      "Location de voiture à Aïn Diab, Casablanca. Livrée le long de la Corniche à votre hôtel ou à votre résidence. Kilométrage illimité et tarifs clairs. Route Facile.",
    metaKeywords:
      "location voiture aïn diab, location voiture aïn diab casablanca, location voiture corniche casablanca",
    h1: "Location de voiture à Aïn Diab, Casablanca",
    h2Intro:
      "Aïn Diab longe la Corniche de Casablanca, en passant devant la mosquée Hassan II et les clubs de plage. Route Facile livre dans les hôtels et les résidences sur toute sa longueur.",
    crumbs: ["Accueil", "Location de voiture à Casablanca", "Aïn Diab"],
    sections: [
      [
        "Livraison le long de la Corniche",
        "Donnez-nous l'adresse et l'heure et nous vous amenons la voiture partout à Aïn Diab ou le long de la Corniche.",
      ],
      [
        "Conduire depuis Aïn Diab",
        "Le centre-ville est à environ quinze minutes, l'aéroport Mohammed V à une quarantaine, et la route côtière vers le sud en direction d'El Jadida part d'ici.",
      ],
      [
        "Tarifs",
        "Citadines économiques à partir de 400 MAD par jour, SUV à partir de 600 MAD, kilométrage illimité inclus.",
      ],
    ],
    faq: [
      [
        "Livrez-vous dans les hôtels de la Corniche ?",
        "Oui, partout le long d'Aïn Diab et de la Corniche.",
      ],
      [
        "À quelle distance Aïn Diab est-il de l'aéroport Mohammed V ?",
        "Environ 40 minutes en voiture selon la circulation.",
      ],
    ],
  },
};

export default CONTENT;
