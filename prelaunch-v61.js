(() => {
  'use strict';

  const N = window.NOVIQ = window.NOVIQ || {};
  const runtime = window.NOVIQ_RUNTIME_CONFIG || {};
  const PREVIEW_KEY = 'noviq-local-preview-v1';
  let cloudMemory = [];
  let busy = false;
  let profileRenderQueued = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const escape = value => N.util?.escape?.(value) ?? String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const configured = () => Boolean(N.auth?.configured?.());
  const cloudReady = () => configured() && Boolean(N.api?.configured?.());
  const localPreview = () => localStorage.getItem(PREVIEW_KEY) === '1';
  const currentUser = () => N.auth?.user?.() || null;

  const copy = {
    ru: {
      welcome: 'Добро пожаловать в NOVIQ',
      sub: 'Твой спортивный интеллект, решения и память — в одном профиле.',
      signIn: 'Войти', signUp: 'Создать аккаунт', email: 'Email', password: 'Пароль', name: 'Имя',
      forgot: 'Забыли пароль?', recoverySent: 'Ссылка восстановления отправлена.',
      local: 'Продолжить локальную beta', localNote: 'Без аккаунта данные остаются только на этом устройстве.',
      cloudOff: 'Cloud login станет доступен после настройки Supabase.', confirm: 'Проверь email и подтверди аккаунт.',
      invalid: 'Проверь введённые данные.', profile: 'Профиль аналитика', cloud: 'Cloud account', preview: 'Local preview',
      synced: 'Синхронизировано', deviceOnly: 'Только на устройстве', edit: 'Редактировать профиль',
      favorite: 'Любимая команда', save: 'Сохранить', memory: 'Sports Memory',
      memoryEmpty: 'Заверши Replay — здесь появятся проверенные уроки.', signOut: 'Выйти', sync: 'Синхронизировать',
      deleteCloud: 'Удалить cloud-данные', deleteTitle: 'Удалить данные аккаунта?',
      deleteBody: 'Профиль, Thesis, Replay и Memory в NOVIQ будут удалены. Сам Supabase-логин останется активным.',
      cancel: 'Отмена', remove: 'Удалить', resetTitle: 'Задай новый пароль', newPassword: 'Новый пароль',
      resetDone: 'Пароль обновлён.', authExpired: 'Сессия завершилась. Войди снова.', syncFailed: 'Cloud sync временно недоступен. Локальные данные сохранены.',
      dataDeleted: 'Cloud-данные удалены.', decisionHistory: 'ИСТОРИЯ РЕШЕНИЙ', confidence: 'уверенность'
    },
    uk: {
      welcome: 'Ласкаво просимо до NOVIQ',
      sub: 'Твій спортивний інтелект, рішення та памʼять — в одному профілі.',
      signIn: 'Увійти', signUp: 'Створити акаунт', email: 'Email', password: 'Пароль', name: 'Імʼя',
      forgot: 'Забули пароль?', recoverySent: 'Посилання відновлення надіслано.',
      local: 'Продовжити локальну beta', localNote: 'Без акаунта дані залишаються лише на цьому пристрої.',
      cloudOff: 'Cloud login стане доступним після налаштування Supabase.', confirm: 'Перевір email і підтвердь акаунт.',
      invalid: 'Перевір введені дані.', profile: 'Профіль аналітика', cloud: 'Cloud account', preview: 'Local preview',
      synced: 'Синхронізовано', deviceOnly: 'Лише на пристрої', edit: 'Редагувати профіль',
      favorite: 'Улюблена команда', save: 'Зберегти', memory: 'Sports Memory',
      memoryEmpty: 'Заверши Replay — тут зʼявляться перевірені уроки.', signOut: 'Вийти', sync: 'Синхронізувати',
      deleteCloud: 'Видалити cloud-дані', deleteTitle: 'Видалити дані акаунта?',
      deleteBody: 'Профіль, Thesis, Replay і Memory у NOVIQ буде видалено. Сам Supabase-логін залишиться активним.',
      cancel: 'Скасувати', remove: 'Видалити', resetTitle: 'Задай новий пароль', newPassword: 'Новий пароль',
      resetDone: 'Пароль оновлено.', authExpired: 'Сесію завершено. Увійди знову.', syncFailed: 'Cloud sync тимчасово недоступний. Локальні дані збережено.',
      dataDeleted: 'Cloud-дані видалено.', decisionHistory: 'ІСТОРІЯ РІШЕНЬ', confidence: 'впевненість'
    },
    en: {
      welcome: 'Welcome to NOVIQ',
      sub: 'Your sports intelligence, decisions and memory in one profile.',
      signIn: 'Sign in', signUp: 'Create account', email: 'Email', password: 'Password', name: 'Name',
      forgot: 'Forgot password?', recoverySent: 'Recovery link sent.',
      local: 'Continue local beta', localNote: 'Without an account, data stays on this device only.',
      cloudOff: 'Cloud login becomes available after Supabase is configured.', confirm: 'Check your email to confirm the account.',
      invalid: 'Check the information you entered.', profile: 'Analyst profile', cloud: 'Cloud account', preview: 'Local preview',
      synced: 'Synced', deviceOnly: 'On this device', edit: 'Edit profile',
      favorite: 'Favorite team', save: 'Save', memory: 'Sports Memory',
      memoryEmpty: 'Complete a Replay to build verified memory.', signOut: 'Sign out', sync: 'Sync now',
      deleteCloud: 'Delete cloud data', deleteTitle: 'Delete account data?',
      deleteBody: 'Your NOVIQ profile, Thesis, Replay and Memory will be deleted. The Supabase login itself stays active.',
      cancel: 'Cancel', remove: 'Delete', resetTitle: 'Set a new password', newPassword: 'New password',
      resetDone: 'Password updated.', authExpired: 'Your session ended. Sign in again.', syncFailed: 'Cloud sync is temporarily unavailable. Local data is safe.',
      dataDeleted: 'Cloud data deleted.', decisionHistory: 'DECISION HISTORY', confidence: 'confidence'
    }
  };

  const t = key => (copy[N.state?.language] || copy.ru)[key] || key;

  const metadataName = () => {
    const metadata = currentUser()?.user_metadata || currentUser()?.userMetadata || {};
    return String(metadata.display_name || metadata.full_name || '').trim();
  };

  const displayName = () => {
    const local = String(N.state?.account?.displayName || '').trim();
    if (local && local !== 'Богдан Тищенко') return local;
    return metadataName() || 'Sports Analyst';
  };

  const initials = name => String(name || 'Sports Analyst')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'SA';

  function gateMarkup() {
    const cloud = configured();
    return `<section class="identity-gate" role="dialog" aria-modal="true" aria-labelledby="identityTitle">
      <div class="identity-panel">
        <div class="identity-brand"><span class="identity-mark">N</span><div><b>NOVIQ</b><small>SPORTS DECISION INTELLIGENCE</small></div></div>
        <div class="identity-copy"><span class="identity-kicker">CLOSED BETA</span><h1 id="identityTitle">${escape(t('welcome'))}</h1><p>${escape(t('sub'))}</p></div>
        ${cloud ? `<div class="identity-tabs" role="tablist" aria-label="Account">
          <button class="active" type="button" role="tab" aria-selected="true" data-auth-tab="signin">${escape(t('signIn'))}</button>
          <button type="button" role="tab" aria-selected="false" data-auth-tab="signup">${escape(t('signUp'))}</button>
        </div>
        <form id="identityForm" data-mode="signin" novalidate>
          <label class="identity-name" hidden>${escape(t('name'))}<input name="name" autocomplete="name" maxlength="80"></label>
          <label>${escape(t('email'))}<input name="email" type="email" autocomplete="email" inputmode="email" required></label>
          <label>${escape(t('password'))}<input name="password" type="password" autocomplete="current-password" minlength="8" required></label>
          <button class="identity-primary" type="submit">${escape(t('signIn'))}</button>
          <button class="identity-link" type="button" data-auth-recover>${escape(t('forgot'))}</button>
          <p class="identity-status" role="status" aria-live="polite"></p>
        </form>` : `<div class="identity-offline"><b>${escape(t('cloudOff'))}</b><p>${escape(t('localNote'))}</p></div>`}
        ${runtime.allowLocalPreview !== false ? `<button class="identity-local" type="button" data-auth-local>${escape(t('local'))}</button>` : ''}
        <div class="identity-trust"><a href="privacy.html">Privacy</a><span>·</span><a href="terms.html">Beta Terms</a></div>
      </div>
    </section>`;
  }

  function openGate(force = false, message = '') {
    if ($('#identityGate')) return;
    if (!force && (N.session || localPreview())) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'identityGate';
    wrapper.innerHTML = gateMarkup();
    document.body.append(wrapper);
    document.body.classList.add('identity-locked');
    if (message) $('.identity-status', wrapper)?.replaceChildren(document.createTextNode(message));
    setTimeout(() => $('#identityGate input, #identityGate [data-auth-local]')?.focus(), 0);
  }

  function closeGate() {
    document.body.classList.remove('identity-locked');
    $('#identityGate')?.remove();
  }

  function setAuthMode(mode) {
    const form = $('#identityForm');
    if (!form || !['signin', 'signup'].includes(mode)) return;
    form.dataset.mode = mode;
    const signup = mode === 'signup';
    const nameLabel = $('.identity-name', form);
    if (nameLabel) nameLabel.hidden = !signup;
    const password = $('[name="password"]', form);
    if (password) password.autocomplete = signup ? 'new-password' : 'current-password';
    const submit = $('button[type="submit"]', form);
    if (submit) submit.textContent = t(signup ? 'signUp' : 'signIn');
    document.querySelectorAll('[data-auth-tab]').forEach(button => {
      const active = button.dataset.authTab === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const status = $('.identity-status', form);
    if (status) status.textContent = '';
  }

  function syncPayload() {
    const account = N.state.account || {};
    return {
      profile: {
        displayName: displayName(),
        favoriteTeam: account.favoriteTeam || null,
        locale: N.state.language,
        theme: N.state.theme,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        sportsIQ: Number(N.state.sportsIQ || 0)
      },
      theses: (N.state.theses || []).map(item => ({
        clientId: item.id,
        matchId: item.matchId,
        scenario: item.scenario,
        reason: item.reason,
        risk: item.risk,
        alternative: item.alternative || undefined,
        confidence: Number(item.confidence || 65),
        createdAt: item.createdAt || undefined
      })),
      replays: (N.state.replays || []).map(item => ({
        clientId: item.id,
        thesisClientId: item.thesisId,
        reflection: item.reflection || 'Reviewed decision quality.',
        delta: Number(item.delta || 0),
        evidence: item.score || {},
        createdAt: item.completedAt || item.createdAt || undefined
      }))
    };
  }

  async function syncCloud({ quiet = false } = {}) {
    if (!N.session || !cloudReady()) return false;
    try {
      const result = await N.api.sync(syncPayload());
      const bootstrap = await N.api.bootstrap();
      cloudMemory = Array.isArray(bootstrap.memories) ? bootstrap.memories : [];
      N.state.account = {
        ...(N.state.account || {}),
        mode: 'cloud',
        displayName: bootstrap.profile?.displayName || displayName(),
        favoriteTeam: bootstrap.profile?.favoriteTeam || N.state.account?.favoriteTeam || null,
        email: currentUser()?.email || bootstrap.profile?.email || null,
        userId: currentUser()?.id || bootstrap.profile?.id || null,
        synced: true,
        cloudLastSyncAt: new Date().toISOString()
      };
      N.storage.save();
      N.platform?.track?.('cloud_sync', {
        theses: result.synced?.theses || 0,
        replays: result.synced?.replays || 0
      });
      queueProfileRender();
      return true;
    } catch (error) {
      N.state.account = {
        ...(N.state.account || {}),
        mode: 'cloud',
        email: currentUser()?.email || null,
        synced: false
      };
      N.storage.save({ backup: false });
      N.platform?.capture?.(error, { area: 'cloud-sync' });
      if (!quiet) N.platform?.track?.('cloud_sync_failed', { code: error?.code || 'unknown' });
      queueProfileRender();
      return false;
    }
  }

  function memoryRows() {
    const local = (N.state.replays || []).slice(-8).reverse().map(replay => ({
      sourceReplayId: replay.id,
      title: 'Decision Replay',
      summary: replay.reflection || 'Decision reviewed.',
      confidence: Math.max(0, Math.min(100, 50 + Number(replay.delta || 0))),
      createdAt: replay.completedAt || replay.createdAt
    }));
    const localIds = new Set(local.map(item => item.sourceReplayId));
    return [...cloudMemory.filter(item => !localIds.has(item.sourceReplayId)), ...local].slice(0, 8);
  }

  function renderProfile() {
    const screen = $('[data-screen="profile"]');
    if (!screen) return;
    const oldCard = $('.profile-card', screen);
    if (!oldCard) return;

    $('.prelaunch-profile', screen)?.remove();
    $('.prelaunch-memory', screen)?.remove();
    oldCard.hidden = true;

    const account = N.state.account || {};
    const cloud = Boolean(N.session);
    const name = displayName();
    const profile = document.createElement('section');
    profile.className = 'prelaunch-profile';
    profile.innerHTML = `<div class="profile-identity">
      <div class="profile-avatar" aria-hidden="true">${escape(initials(name))}</div>
      <div><span class="account-pill ${cloud ? 'cloud' : 'local'}">${escape(cloud ? t('cloud') : t('preview'))}</span><h2>${escape(name)}</h2><p>${escape(cloud ? (currentUser()?.email || account.email || '') : t('localNote'))}</p></div>
    </div>
    <div class="profile-score"><small>SPORTS IQ</small><strong>${escape(N.util.format(N.state.sportsIQ))}</strong><span>${escape(cloud && account.synced ? t('synced') : t('deviceOnly'))}</span></div>
    <div class="profile-actions">
      <button type="button" data-prelaunch-edit>${escape(t('edit'))}</button>
      ${cloud ? `<button type="button" data-prelaunch-sync>${escape(t('sync'))}</button><button type="button" data-prelaunch-signout>${escape(t('signOut'))}</button><button class="danger-link" type="button" data-prelaunch-delete>${escape(t('deleteCloud'))}</button>` : configured() ? `<button type="button" data-prelaunch-signin>${escape(t('signIn'))}</button>` : ''}
    </div>`;
    oldCard.insertAdjacentElement('beforebegin', profile);

    const rows = memoryRows();
    const memory = document.createElement('section');
    memory.className = 'prelaunch-memory';
    memory.innerHTML = `<div class="prelaunch-head"><div><small>${escape(t('decisionHistory'))}</small><h3>${escape(t('memory'))}</h3></div><span>${rows.length}</span></div>
      ${rows.length ? `<div class="memory-list">${rows.map(item => `<article><div><b>${escape(item.title || 'Decision Replay')}</b><time>${escape(item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '')}</time></div><p>${escape(item.summary)}</p><span>${escape(item.confidence)}% ${escape(t('confidence'))}</span></article>`).join('')}</div>` : `<p class="memory-empty">${escape(t('memoryEmpty'))}</p>`}`;
    profile.insertAdjacentElement('afterend', memory);
  }

  function queueProfileRender() {
    if (profileRenderQueued) return;
    profileRenderQueued = true;
    requestAnimationFrame(() => {
      profileRenderQueued = false;
      renderProfile();
    });
  }

  function profileDialog() {
    let dialog = $('#prelaunchProfileDialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'prelaunchProfileDialog';
    dialog.className = 'prelaunch-dialog';
    dialog.innerHTML = `<form>
      <header><h2>${escape(t('edit'))}</h2><button type="button" data-close aria-label="${escape(N.t?.('close') || 'Close')}">×</button></header>
      <label>${escape(t('name'))}<input name="displayName" maxlength="80" autocomplete="name" required></label>
      <label>${escape(t('favorite'))}<input name="favoriteTeam" maxlength="100"></label>
      <button class="identity-primary" type="submit">${escape(t('save'))}</button>
      <p role="status" aria-live="polite"></p>
    </form>`;
    document.body.append(dialog);
    $('[data-close]', dialog).addEventListener('click', () => dialog.close());
    $('form', dialog).addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      const name = String(data.get('displayName') || '').trim();
      const favoriteTeam = String(data.get('favoriteTeam') || '').trim();
      if (!name || busy) return;
      busy = true;
      try {
        N.state.account = { ...(N.state.account || {}), displayName: name, favoriteTeam };
        N.storage.save();
        if (N.session && N.api?.configured?.()) {
          await N.api.updateProfile({
            displayName: name,
            favoriteTeam: favoriteTeam || null,
            locale: N.state.language,
            theme: N.state.theme,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            sportsIQ: Number(N.state.sportsIQ || 0)
          });
          N.state.account.synced = true;
          N.state.account.cloudLastSyncAt = new Date().toISOString();
          N.storage.save({ backup: false });
        }
        dialog.close();
        queueProfileRender();
      } catch (error) {
        $('[role="status"]', form).textContent = t('syncFailed');
        N.platform?.capture?.(error, { area: 'profile-save' });
      } finally {
        busy = false;
      }
    });
    return dialog;
  }

  function editProfile() {
    const dialog = profileDialog();
    $('[name="displayName"]', dialog).value = displayName();
    $('[name="favoriteTeam"]', dialog).value = N.state.account?.favoriteTeam || '';
    $('[role="status"]', dialog).textContent = '';
    dialog.showModal();
    setTimeout(() => $('[name="displayName"]', dialog)?.focus(), 0);
  }

  function confirmDeleteCloud() {
    let dialog = $('#prelaunchDeleteDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'prelaunchDeleteDialog';
      dialog.className = 'prelaunch-dialog';
      dialog.innerHTML = `<div class="delete-copy"><h2>${escape(t('deleteTitle'))}</h2><p>${escape(t('deleteBody'))}</p><div><button type="button" data-cancel>${escape(t('cancel'))}</button><button class="danger" type="button" data-delete>${escape(t('remove'))}</button></div><p role="status" aria-live="polite"></p></div>`;
      document.body.append(dialog);
      $('[data-cancel]', dialog).addEventListener('click', () => dialog.close());
      $('[data-delete]', dialog).addEventListener('click', async () => {
        if (busy || !N.session || !N.api?.configured?.()) return;
        busy = true;
        try {
          await N.api.deleteMyData();
          cloudMemory = [];
          N.state.account = {
            mode: 'cloud',
            displayName: displayName(),
            email: currentUser()?.email || null,
            synced: false
          };
          N.storage.save();
          $('[role="status"]', dialog).textContent = t('dataDeleted');
          setTimeout(() => {
            dialog.close();
            queueProfileRender();
          }, 500);
        } catch (error) {
          $('[role="status"]', dialog).textContent = t('syncFailed');
          N.platform?.capture?.(error, { area: 'delete-cloud' });
        } finally {
          busy = false;
        }
      });
    }
    $('[role="status"]', dialog).textContent = '';
    dialog.showModal();
  }

  function showRecoveryDialog() {
    if (N.authRedirect?.type !== 'recovery' || !N.session || $('#prelaunchRecoveryDialog')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'prelaunchRecoveryDialog';
    dialog.className = 'prelaunch-dialog';
    dialog.innerHTML = `<form><header><h2>${escape(t('resetTitle'))}</h2></header><label>${escape(t('newPassword'))}<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><button class="identity-primary" type="submit">${escape(t('save'))}</button><p role="status" aria-live="polite"></p></form>`;
    document.body.append(dialog);
    $('form', dialog).addEventListener('submit', async event => {
      event.preventDefault();
      if (busy) return;
      busy = true;
      const status = $('[role="status"]', dialog);
      try {
        await N.auth.updatePassword(new FormData(event.currentTarget).get('password'));
        N.authRedirect = null;
        status.textContent = t('resetDone');
        setTimeout(() => {
          dialog.close();
          dialog.remove();
        }, 650);
      } catch (error) {
        status.textContent = t('invalid');
        N.platform?.capture?.(error, { area: 'password-recovery' });
      } finally {
        busy = false;
      }
    });
    dialog.showModal();
    setTimeout(() => $('[name="password"]', dialog)?.focus(), 0);
  }

  async function afterIdentity({ sync = true } = {}) {
    if (N.session) {
      N.state.account = {
        ...(N.state.account || {}),
        mode: 'cloud',
        displayName: displayName(),
        email: currentUser()?.email || null,
        userId: currentUser()?.id || null
      };
      N.storage.save({ backup: false });
      if (sync) await syncCloud({ quiet: true });
    } else {
      N.state.account = {
        ...(N.state.account || {}),
        mode: 'local',
        displayName: displayName(),
        synced: false
      };
      N.storage.save({ backup: false });
    }
    queueProfileRender();
    showRecoveryDialog();
  }

  async function submitAuth(form) {
    if (busy) return;
    busy = true;
    const status = $('.identity-status', form);
    status.textContent = '';
    try {
      const data = new FormData(form);
      const mode = form.dataset.mode;
      if (mode === 'signup') {
        const result = await N.auth.signUp(data.get('email'), data.get('password'), data.get('name'));
        if (result.pendingConfirmation) {
          status.textContent = t('confirm');
          return;
        }
      } else {
        await N.auth.signIn(data.get('email'), data.get('password'));
      }
      localStorage.removeItem(PREVIEW_KEY);
      closeGate();
      await afterIdentity({ sync: true });
    } catch (error) {
      status.textContent = t('invalid');
      N.platform?.capture?.(error, { area: 'auth-submit', code: error?.code || 'unknown' });
    } finally {
      busy = false;
    }
  }

  async function sendRecovery(form) {
    if (busy) return;
    busy = true;
    const status = $('.identity-status', form);
    try {
      const email = new FormData(form).get('email');
      await N.auth.recover(email);
      status.textContent = t('recoverySent');
    } catch (error) {
      status.textContent = t('invalid');
      N.platform?.capture?.(error, { area: 'auth-recovery', code: error?.code || 'unknown' });
    } finally {
      busy = false;
    }
  }

  document.addEventListener('submit', event => {
    if (event.target?.id !== 'identityForm') return;
    event.preventDefault();
    void submitAuth(event.target);
  });

  document.addEventListener('click', event => {
    const tab = event.target.closest?.('[data-auth-tab]');
    if (tab) {
      setAuthMode(tab.dataset.authTab);
      return;
    }
    if (event.target.closest?.('[data-auth-local]')) {
      localStorage.setItem(PREVIEW_KEY, '1');
      closeGate();
      void afterIdentity({ sync: false });
      return;
    }
    if (event.target.closest?.('[data-auth-recover]')) {
      const form = $('#identityForm');
      if (form) void sendRecovery(form);
      return;
    }
    if (event.target.closest?.('[data-prelaunch-edit]')) {
      editProfile();
      return;
    }
    if (event.target.closest?.('[data-prelaunch-sync]')) {
      void syncCloud();
      return;
    }
    if (event.target.closest?.('[data-prelaunch-signout]')) {
      void (async () => {
        await N.auth.signOut();
        N.state.account = { ...(N.state.account || {}), mode: 'local', synced: false, email: null, userId: null };
        N.storage.save({ backup: false });
        openGate(true);
        queueProfileRender();
      })();
      return;
    }
    if (event.target.closest?.('[data-prelaunch-signin]')) {
      openGate(true);
      return;
    }
    if (event.target.closest?.('[data-prelaunch-delete]')) {
      confirmDeleteCloud();
      return;
    }
    if (event.target.closest?.('[data-nav="profile"], [data-action="profile"]')) {
      setTimeout(queueProfileRender, 0);
    }
  }, { capture: true });

  window.addEventListener('noviq:auth', event => {
    const reason = event.detail?.reason || '';
    if (reason === 'refresh') {
      queueProfileRender();
      return;
    }
    if (reason === 'expired') {
      N.state.account = { ...(N.state.account || {}), mode: 'local', synced: false, email: null, userId: null };
      N.storage.save({ backup: false });
      openGate(true, t('authExpired'));
      queueProfileRender();
      return;
    }
    if (reason === 'signout') {
      queueProfileRender();
    }
  });

  window.addEventListener('noviq:auth-redirect', () => {
    if (N.session) {
      closeGate();
      void afterIdentity({ sync: true });
    } else if (N.authRedirect?.error) {
      openGate(true, t('invalid'));
    }
  });

  const observer = new MutationObserver(() => {
    const screen = $('[data-screen="profile"]');
    if (screen && !$('.prelaunch-profile', screen)) queueProfileRender();
  });

  window.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    if (N.authRedirect?.error) openGate(true, t('invalid'));
    else if (!N.session && !localPreview()) openGate();
    void afterIdentity({ sync: Boolean(N.session) });
  });
})();