'use strict';

// Assure que le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  // FORMULAIRE de configuration
  const form = document.getElementById('game-setup');
  // Container de jeu
  const container = document.querySelector('.game');
  if (!form || !container) {
    console.error('Formulaire ou container .game introuvable');
    return;
  }

  const header = container.querySelector('h2');
  const headerHtml = header ? header.outerHTML : '';

  // Mapping des images selon la classe
  const imgMap = {
    chevalier: { normal: 'knight.png', wounded: 'knight-wounded.png', winner: 'knight-winner.png' },
    voleur:   { normal: 'thief.png',  wounded: 'thief-wounded.png',  winner: 'thief-winner.png'  },
    mage:     { normal: 'mage.png',   wounded: 'mage-wounded.png',   winner: 'mage-winner.png'   }
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    // On récupère les choix
    const data = new FormData(form);
    const difficulty  = data.get('difficulty');
    const playerClass = data.get('playerClass');

    // Masquer le formulaire
    form.style.display = 'none';

    // Génération aléatoire des PV initiaux
    let maxPVDragon, maxPVPlayer;
    if (difficulty === 'facile') {
      maxPVDragon = 100 + throwDices(5, 10);
      maxPVPlayer = 100 + throwDices(10, 10);
    } else if (difficulty === 'normal') {
      maxPVDragon = 100 + throwDices(10, 10);
      maxPVPlayer = 100 + throwDices(10, 10);
    } else {
      maxPVDragon = 100 + throwDices(10, 10);
      maxPVPlayer = 100 + throwDices(7, 10);
    }
    let currentPVDragon = maxPVDragon;
    let currentPVPlayer = maxPVPlayer;

    // Construction du HTML dynamique
    let html = '';
    // PV initiaux
    html += `
      <h3>PV de départ (${difficulty.toUpperCase()}, ${playerClass})</h3>
      <div class="game-state">
        <figure class="game-state_player">
          <img src="images/${imgMap[playerClass].normal}" alt="${playerClass}">
          <figcaption>
            <progress max="${maxPVPlayer}" value="0" data-value="${currentPVPlayer}"></progress>
            ${currentPVPlayer} PV
          </figcaption>
        </figure>
        <figure class="game-state_player">
          <img src="images/dragon.png" alt="Dragon">
          <figcaption>
            <progress max="${maxPVDragon}" value="0" data-value="${currentPVDragon}"></progress>
            ${currentPVDragon} PV
          </figcaption>
        </figure>
      </div>
    `;

    // Boucle de tours
    let turn = 1;
    while (currentPVDragon > 0 && currentPVPlayer > 0) {
      // Initiative
      let initDragon = throwDices(10, 6);
      let initPlayer = throwDices(10, 6);
      if (playerClass === 'voleur') {
        initPlayer = Math.floor(initPlayer * (1 + throwDices(1, 6) / 100));
      }
      const playerAttacks = initPlayer >= initDragon;

      // Dégâts de base + modificateurs
      const baseDmg = throwDices(3, 6);
      let modPct = 0;
      let dmg;
      if (playerAttacks) {
        if (difficulty === 'facile') modPct = throwDices(2, 6);
        else if (difficulty === 'difficile') modPct = -throwDices(1, 6);
        if (playerClass === 'mage') modPct += throwDices(1, 10);
        dmg = Math.floor(baseDmg * (1 + modPct / 100));
        currentPVDragon = Math.max(0, currentPVDragon - dmg);
        html += `
          <h3>Tour n°${turn}</h3>
          <figure class="game-round">
            <img src="images/${imgMap[playerClass].winner}" alt="${playerClass} vainqueur">
            <figcaption>Vous infligez ${dmg} points de dommage !</figcaption>
          </figure>
        `;
      } else {
        if (difficulty === 'facile') modPct = -throwDices(2, 6);
        else if (difficulty === 'difficile') modPct = throwDices(1, 6);
        if (playerClass === 'chevalier') modPct -= throwDices(1, 10);
        dmg = Math.floor(baseDmg * (1 + modPct / 100));
        currentPVPlayer = Math.max(0, currentPVPlayer - dmg);
        html += `
          <h3>Tour n°${turn}</h3>
          <figure class="game-round">
            <img src="images/dragon-winner.png" alt="Dragon vainqueur">
            <figcaption>Le dragon inflige ${dmg} points de dommage !</figcaption>
          </figure>
        `;
      }

      // État après le tour
      const playerKey = currentPVPlayer <= maxPVPlayer * 0.3 ? 'wounded' : 'normal';
      const dragonKey = currentPVDragon <= maxPVDragon * 0.3 ? 'dragon-wounded.png' : 'dragon.png';
      html += `
        <div class="game-state">
          <figure class="game-state_player">
            <img src="images/${imgMap[playerClass][playerKey]}" alt="${playerClass}">
            <figcaption>
              <progress max="${maxPVPlayer}" value="0" data-value="${currentPVPlayer}"></progress>
              ${currentPVPlayer > 0 ? currentPVPlayer + ' PV' : 'Game Over'}
            </figcaption>
          </figure>
          <figure class="game-state_player">
            <img src="images/${dragonKey}" alt="Dragon">
            <figcaption>
              <progress max="${maxPVDragon}" value="0" data-value="${currentPVDragon}"></progress>
              ${currentPVDragon > 0 ? currentPVDragon + ' PV' : 'Game Over'}
            </figcaption>
          </figure>
        </div>
      `;
      turn++;
    }

    // Fin de la partie
    const playerWon = currentPVPlayer > 0;
    html += `
      <footer>
        <h3>Fin de la partie</h3>
        <figure class="game-end">
          <figcaption>${playerWon ? 'Bravo ! Vous avez terrassé le dragon !' : 'Vous avez été carbonisé...'}</figcaption>
          <img src="images/${playerWon ? imgMap[playerClass].winner : 'dragon-winner.png'}" alt="${playerWon ? playerClass : 'dragon'} vainqueur">
        </figure>
      </footer>
    `;

    container.innerHTML = headerHtml + html;

    // Animation des progress bars lors de leur apparition
    const progresses = container.querySelectorAll('progress[data-value]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const prog = entry.target;
          prog.value = prog.getAttribute('data-value');
          observer.unobserve(prog);
        }
      });
    }, { threshold: 0.5 });
    progresses.forEach(prog => observer.observe(prog));
  });
});
