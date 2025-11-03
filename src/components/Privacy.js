import React from 'react';
import './Privacy.css';

function Privacy() {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1>Politique de Confidentialité</h1>
        <p className="last-updated">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Bienvenue sur BudBeer. Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. 
            Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations.
          </p>
        </section>

        <section>
          <h2>2. Données collectées</h2>
          <h3>2.1 Informations de localisation</h3>
          <p>
            Avec votre autorisation, nous collectons votre position GPS pour vous proposer les bars les plus proches. 
            Vous pouvez désactiver cette fonctionnalité à tout moment dans les paramètres de l'application.
          </p>

          <h3>2.2 Données des bars</h3>
          <p>
            Nous collectons les informations que vous fournissez lorsque vous ajoutez un bar :
          </p>
          <ul>
            <li>Nom du bar</li>
            <li>Prix de la bière</li>
            <li>Localisation du bar</li>
          </ul>

          <h3>2.3 Amis ajoutés</h3>
          <p>
            Les informations des amis que vous ajoutez (nom et position) sont stockées localement sur votre appareil 
            et ne sont pas transmises à nos serveurs.
          </p>
        </section>

        <section>
          <h2>3. Utilisation des données</h2>
          <p>Nous utilisons vos données pour :</p>
          <ul>
            <li>Afficher les bars à proximité de votre position</li>
            <li>Calculer les distances et itinéraires</li>
            <li>Permettre la recherche de bars en groupe avec vos amis</li>
            <li>Améliorer nos services</li>
          </ul>
        </section>

        <section>
          <h2>4. Partage des données</h2>
          <p>
            Nous ne vendons, n'échangeons ni ne louons vos données personnelles à des tiers. 
            Vos informations de localisation ne sont jamais partagées avec d'autres utilisateurs.
          </p>
        </section>

        <section>
          <h2>5. Stockage et sécurité</h2>
          <h3>5.1 Stockage local</h3>
          <p>
            La plupart de vos données (amis ajoutés, préférences) sont stockées localement sur votre appareil 
            et ne sont pas transmises à nos serveurs.
          </p>

          <h3>5.2 Sécurité</h3>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre 
            tout accès, modification, divulgation ou destruction non autorisés.
          </p>
        </section>

        <section>
          <h2>6. Vos droits</h2>
          <p>Vous avez le droit de :</p>
          <ul>
            <li>Accéder à vos données personnelles</li>
            <li>Corriger vos données</li>
            <li>Supprimer vos données (via les paramètres de l'app)</li>
            <li>Désactiver la localisation à tout moment</li>
            <li>Supprimer tous vos amis ajoutés</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies et technologies similaires</h2>
          <p>
            Nous utilisons des technologies de cache pour améliorer les performances de l'application. 
            Vous pouvez supprimer le cache à tout moment depuis les paramètres de l'application.
          </p>
        </section>

        <section>
          <h2>8. Services tiers</h2>
          <p>
            Notre application utilise les services de cartographie Apple Maps. L'utilisation de ces services 
            est soumise à leurs propres politiques de confidentialité.
          </p>
        </section>

        <section>
          <h2>9. Modifications de la politique</h2>
          <p>
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
            Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
            vous pouvez nous contacter à :
          </p>
          <p className="contact-info">
            <strong>Email :</strong> support@budbeer.app<br />
            <strong>Adresse :</strong> [Votre adresse]
          </p>
        </section>

        <section>
          <h2>11. Conformité RGPD</h2>
          <p>
            Nous nous engageons à respecter le Règlement Général sur la Protection des Données (RGPD) 
            et à protéger les droits de confidentialité de tous nos utilisateurs dans l'Union Européenne.
          </p>
        </section>

        <div className="footer-note">
          <p>
            En utilisant BudBeer, vous acceptez cette politique de confidentialité. 
            Si vous n'acceptez pas cette politique, veuillez ne pas utiliser notre application.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Privacy;

