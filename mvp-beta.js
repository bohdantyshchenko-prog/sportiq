(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const KEY = 'noviq-mvp-feedback';
  const copy = {
    ru: { beta:'Закрытая beta', mission:'Цель на сегодня', missionText:'Заверши один полный цикл Briefing → Thesis → Replay.', feedback:'Оставить отзыв', about:'О NOVIQ', privacy:'Конфиденциальность', terms:'Условия', title:'Помоги улучшить NOVIQ', value:'Насколько понятна ценность приложения?', return:'Открыл бы ты NOVIQ завтра?', problem:'Что было непонятно или раздражало?', send:'Сохранить отзыв', thanks:'Отзыв сохранён на этом устройстве.', close:'Закрыть', yes:'Да', maybe:'Возможно', no:'Нет' },
    uk: { beta:'Закрита beta', mission:'Ціль на сьогодні', missionText:'Заверши один повний цикл Briefing → Thesis → Replay.', feedback:'Залишити відгук', about:'Про NOVIQ', privacy:'Конфіденційність', terms:'Умови', title:'Допоможи покращити NOVIQ', value:'Наскільки зрозуміла цінність застосунку?', return:'Чи відкрив би ти NOVIQ завтра?', problem:'Що було незрозумілим або дратувало?', send:'Зберегти відгук', thanks:'Відгук збережено на цьому пристрої.', close:'Закрити', yes:'Так', maybe:'Можливо', no:'Ні' },
    en: { beta:'Closed beta', mission:"Today's goal", missionText:'Complete one full Briefing → Thesis → Replay loop.', feedback:'Leave feedback', about:'About NOVIQ', privacy:'Privacy', terms:'Terms', title:'Help improve NOVIQ', value:'How clear is the product value?', return:'Would you open NOVIQ tomorrow?', problem:'What felt unclear or frustrating?', send:'Save feedback', thanks:'Feedback saved on this device.', close:'Close', yes:'Yes', maybe:'Maybe', no:'No' }
  };
  const lang = () => N.state?.language || 'ru';
  const t = key => (copy[lang()] || copy.ru)[key] || key;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const existing = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const saveFeedback = item => { const rows = existing(); rows.push(item); localStorage.setItem(KEY, JSON.stringify(rows.slice(-50))); };

  function addMission() {
    const home = document.querySelector('[data-screen="home"]');
    if (!home || home.querySelector('.mvp-mission')) return;
    const hero = home.querySelector('.hero');
    const card = document.createElement('section');
    card.className = 'mvp-mission';
    card.innerHTML = `<div><span class="mvp-badge">${escapeHtml(t('beta'))}</span><h2>${escapeHtml(t('mission'))}</h2><p>${escapeHtml(t('missionText'))}</p></div><div class="mvp-progress" aria-label="MVP loop progress"><span class="done"></span><span class="${N.state?.diagnostic?.completed ? 'done' : ''}"></span><span class="${N.state?.theses?.length ? 'done' : ''}"></span><span class="${N.state?.replays?.length ? 'done' : ''}"></span></div>`;
    hero?.insertAdjacentElement('afterend', card);
  }

  function addProfileLinks() {
    const settings = document.querySelector('[data-screen="profile"] .settings');
    if (!settings || settings.querySelector('[data-mvp-feedback]')) return;
    const feedback = document.createElement('button');
    feedback.dataset.mvpFeedback = 'true';
    feedback.innerHTML = `${escapeHtml(t('feedback'))}<b>↗</b>`;
    feedback.addEventListener('click', openFeedback);
    settings.append(feedback);
    for (const [label, href] of [[t('about'),'about.html'],[t('privacy'),'privacy.html'],[t('terms'),'terms.html']]) {
      const a = document.createElement('a');
      a.className = 'mvp-setting-link';
      a.href = href;
      a.textContent = label;
      a.setAttribute('target','_blank');
      a.setAttribute('rel','noopener');
      settings.append(a);
    }
  }

  function openFeedback() {
    let dialog = document.getElementById('mvpFeedbackDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'mvpFeedbackDialog';
      dialog.className = 'mvp-dialog';
      dialog.innerHTML = `<form method="dialog" id="mvpFeedbackForm"><header><h2>${escapeHtml(t('title'))}</h2><button value="cancel" aria-label="${escapeHtml(t('close'))}">×</button></header><label>${escapeHtml(t('value'))}<input name="value" type="range" min="1" max="5" value="4"><output>4/5</output></label><fieldset><legend>${escapeHtml(t('return'))}</legend>${[['yes',t('yes')],['maybe',t('maybe')],['no',t('no')]].map(([v,l])=>`<label class="choice"><input type="radio" name="returnIntent" value="${v}" ${v==='yes'?'checked':''}>${escapeHtml(l)}</label>`).join('')}</fieldset><label>${escapeHtml(t('problem'))}<textarea name="problem" maxlength="700"></textarea></label><button class="primary wide" value="submit">${escapeHtml(t('send'))}</button><p id="mvpFeedbackStatus" role="status" aria-live="polite"></p></form>`;
      document.body.append(dialog);
      const range = dialog.querySelector('input[type="range"]');
      range.addEventListener('input', () => dialog.querySelector('output').textContent = `${range.value}/5`);
      dialog.addEventListener('close', () => {
        if (dialog.returnValue !== 'submit') return;
        const form = dialog.querySelector('form');
        const data = new FormData(form);
        saveFeedback({ value:Number(data.get('value')), returnIntent:data.get('returnIntent'), problem:String(data.get('problem') || '').trim(), at:new Date().toISOString(), release:N.platform?.release?.version || '6.0.0' });
        N.platform?.track?.('beta_feedback_saved',{score:Number(data.get('value')),returnIntent:data.get('returnIntent')});
        const status = dialog.querySelector('#mvpFeedbackStatus');
        status.textContent = t('thanks');
        setTimeout(() => { status.textContent=''; form.reset(); }, 1800);
      });
    }
    dialog.showModal();
  }

  function refresh() { addMission(); addProfileLinks(); }
  window.addEventListener('DOMContentLoaded', () => setTimeout(refresh, 0));
  document.addEventListener('click', () => setTimeout(refresh, 0), true);
  window.addEventListener('noviq:language-changed', refresh);
  N.beta = { feedback: existing, refresh };
})();
