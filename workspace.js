/* Interações visuais, sem alterar a estrutura dos dados do caderno. */
(() => {
  const paths = {
    book: '<path d="M4 4h6a3 3 0 0 1 2 2 3 3 0 0 1 2-2h6v15h-6a3 3 0 0 0-2 2 3 3 0 0 0-2-2H4Z"/><path d="M12 6v15"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    up: '<path d="m6 10 6-6 6 6M12 4v16"/>',
    down: '<path d="m6 14 6 6 6-6M12 4v16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    trash: '<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    code: '<path d="m7 6-6 6 6 6M17 6l6 6-6 6M14 3l-4 18"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    play: '<path d="m8 4 12 8-12 8Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  const icon = name => `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  const collapsed = new Set();
  let reading = false;
  const mobile = matchMedia('(max-width: 760px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let topicTransition;
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) topicTransition?.cancel(); });
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('.main');
  const ambientLight = document.createElement('div');
  ambientLight.className = 'ambient-light';
  ambientLight.setAttribute('aria-hidden', 'true');
  main.prepend(ambientLight);
  const syncAmbientVisibility = () => ambientLight.classList.toggle('is-paused', document.hidden);
  document.addEventListener('visibilitychange', syncAmbientVisibility);
  syncAmbientVisibility();
  const mobileBar = document.querySelector('.mobile-bar');
  const backdrop = document.getElementById('navigationBackdrop');
  const menuButton = document.getElementById('navigationToggle');
  let navigationTrigger;

  function navigation(open, restoreFocus = true) {
    open = open && mobile.matches;
    document.body.classList.toggle('navigation-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    sidebar.inert = mobile.matches && !open;
    main.inert = open;
    mobileBar.inert = open;
    if (open) {
      navigationTrigger = document.activeElement;
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
      sidebar.querySelector('.sidebar-close').focus();
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      if (restoreFocus && navigationTrigger?.isConnected) navigationTrigger.focus();
    }
  }
  menuButton.addEventListener('click', () => navigation(true));
  sidebar.querySelector('.sidebar-close').addEventListener('click', () => navigation(false));
  backdrop.addEventListener('click', () => navigation(false));
  mobile.addEventListener('change', () => navigation(false, false));
  navigation(false, false);

  const dialog = document.getElementById('studyDialog');
  const dialogForm = dialog.querySelector('form');
  const dialogInput = document.getElementById('dialogInput');
  const dialogConfirm = document.getElementById('dialogConfirm');
  let resolveDialog;
  let dialogTrigger;
  function finishDialog(value) {
    const resolve = resolveDialog;
    resolveDialog = null;
    dialog.close();
    const focusTarget = dialogTrigger?.closest('.action-menu')?.querySelector('summary') || dialogTrigger;
    if (focusTarget?.isConnected && focusTarget.getClientRects().length) focusTarget.focus();
    resolve?.(value);
  }
  dialogForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!dialogInput.hidden && !dialogInput.value.trim()) { dialogInput.focus(); return; }
    finishDialog(dialogInput.hidden ? true : dialogInput.value.trim());
  });
  document.getElementById('dialogCancel').addEventListener('click', () => finishDialog(null));
  dialog.addEventListener('cancel', event => { event.preventDefault(); finishDialog(null); });
  function requestDialog({ title, description, value, confirmLabel = 'Criar', destructive = false }) {
    if (resolveDialog) return Promise.resolve(null);
    dialogTrigger = document.activeElement;
    document.getElementById('dialogTitle').textContent = title;
    document.getElementById('dialogDescription').textContent = description;
    dialogInput.hidden = value === undefined;
    dialogInput.required = value !== undefined;
    dialogInput.value = value || '';
    dialogConfirm.textContent = confirmLabel;
    dialogConfirm.classList.toggle('destructive', destructive);
    const result = new Promise(resolve => { resolveDialog = resolve; });
    dialog.showModal();
    (dialogInput.hidden ? document.getElementById('dialogCancel') : dialogInput).focus();
    if (!dialogInput.hidden) dialogInput.select();
    return result;
  }

  function actionMenu(group) {
    if (!group || group.dataset.menuReady) return;
    group.dataset.menuReady = 'true';
    const menu = document.createElement('details');
    menu.className = 'action-menu';
    const summary = document.createElement('summary');
    summary.setAttribute('aria-label', 'Opções do item');
    summary.setAttribute('role', 'button');
    summary.setAttribute('aria-expanded', 'false');
    summary.title = 'Opções';
    summary.innerHTML = icon('more');
    const popover = document.createElement('div');
    popover.className = 'action-popover';
    [...group.children].forEach(button => {
      const label = button.title || 'Opção';
      const symbol = button.classList.contains('danger') ? 'trash' : /acima|cima/.test(label) ? 'up' : 'down';
      button.innerHTML = icon(symbol);
      const text = document.createElement('span');
      text.textContent = label;
      button.append(text);
      popover.append(button);
    });
    menu.append(summary, popover);
    group.append(menu);
    menu.addEventListener('toggle', () => {
      summary.setAttribute('aria-expanded', String(menu.open));
      if (menu.open) document.querySelectorAll('.action-menu[open]').forEach(other => { if (other !== menu) other.open = false; });
      if (menu.open) menu.classList.toggle('opens-up', summary.getBoundingClientRect().bottom + popover.offsetHeight + 12 > innerHeight);
    });
  }
  function updateReading() {
    document.body.classList.toggle('reading-mode', reading);
    main.querySelectorAll('select').forEach(select => { select.disabled = reading; });
    main.querySelectorAll('textarea, input').forEach(input => {
      input.readOnly = reading;
      if (reading && input.tagName === 'TEXTAREA' && !input.classList.contains('code-textarea')) {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
      } else if (!reading && !input.classList.contains('input-title')) input.style.height = '';
    });
    const toggle = document.getElementById('readingToggle');
    toggle.setAttribute('aria-pressed', String(reading));
    toggle.innerHTML = icon(reading ? 'edit' : 'eye') + (reading ? 'Editar aula' : 'Modo leitura');
  }
  document.getElementById('readingToggle').addEventListener('click', () => { reading = !reading; updateReading(); });

  function refresh(root = document) {
    root.querySelectorAll('.disc-toggle').forEach(el => { el.innerHTML = icon('chevron'); });
    root.querySelectorAll('.item-actions, .func-card-actions').forEach(actionMenu);
    root.querySelectorAll('.code-toolbar-right').forEach(toolbar => {
      if (toolbar.querySelector('.action-menu')) return;
      const actions = document.createElement('div');
      actions.className = 'func-card-actions';
      toolbar.querySelectorAll('.btn-action-icon').forEach(el => actions.append(el));
      toolbar.append(actions);
      actionMenu(actions);
    });
    root.querySelectorAll('.func-card').forEach(card => {
      if (card.dataset.enhanced) return;
      card.dataset.enhanced = 'true';
      const header = card.querySelector('.func-card-header');
      const tag = header.querySelector('.func-card-tag');
      const nameInput = card.querySelector('[data-arg2="nome"]');
      const id = nameInput.dataset.arg1;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'command-toggle';
      const name = document.createElement('span');
      name.className = 'command-name';
      name.textContent = nameInput.value || 'Novo comando';
      toggle.innerHTML = icon('chevron');
      toggle.append(name);
      header.prepend(toggle);
      const body = document.createElement('div');
      body.className = 'command-body';
      body.id = 'command_body_' + id;
      [...card.children].filter(el => el !== header).forEach(el => body.append(el));
      card.append(body);
      const setExpanded = expanded => {
        body.hidden = !expanded;
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.setAttribute('aria-controls', body.id);
        if (expanded) collapsed.delete(id); else collapsed.add(id);
      };
      setExpanded(!collapsed.has(id));
      toggle.addEventListener('click', () => setExpanded(body.hidden));
      nameInput.addEventListener('input', () => { name.textContent = nameInput.value || 'Novo comando'; });
      tag.textContent = tag.textContent.replace('COMANDO #', '#');
    });
    const title = main.querySelector('.input-title');
    document.getElementById('readingToggle').hidden = !title;
    if (title) {
      const fitTitle = () => { title.style.height = 'auto'; title.style.height = title.scrollHeight + 'px'; };
      fitTitle();
      if (!title.dataset.fitBound) { title.addEventListener('input', fitTitle); title.dataset.fitBound = 'true'; }
    }
    updateReading();
  }
  window.addEventListener('resize', () => {
    const title = main.querySelector('.input-title');
    if (title) { title.style.height = 'auto'; title.style.height = title.scrollHeight + 'px'; }
  });
  document.addEventListener('click', event => {
    document.querySelectorAll('.action-menu[open]').forEach(menu => {
      if (!menu.contains(event.target)) menu.open = false;
      else if (event.target.closest('button')) { menu.open = false; menu.querySelector('summary').focus(); }
    });
  });
  document.addEventListener('keydown', event => {
    if (dialog.open) return;
    if (event.key === 'Escape') {
      document.querySelectorAll('.action-menu[open]').forEach(menu => { menu.open = false; menu.querySelector('summary').focus(); });
      if (document.body.classList.contains('navigation-open')) navigation(false);
    }
    if (event.key === 'Tab' && document.body.classList.contains('navigation-open')) {
      const focusable = [...sidebar.querySelectorAll('button, input, summary')].filter(el => !el.disabled && el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.cadernoUI = { icon, refresh, dialog: requestDialog };
  document.addEventListener('DOMContentLoaded', () => {
    const original = window.cadernoAcao;
    window.cadernoAcao = async (action, ...args) => {
      const previous = main.scrollTop;
      const result = await original(action, ...args);
      if (['selecionarTopico', 'novoTopico'].includes(action)) {
        navigation(false, false);
        main.scrollTop = 0;
        main.querySelector('.input-title')?.focus({ preventScroll: true });
        topicTransition?.cancel();
        if (!reducedMotion.matches) {
          topicTransition = document.getElementById('topicContainer').animate([{ opacity: .35, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 160, easing: 'ease-out' });
        }
      } else if (['adicionarFuncao', 'adicionarBloco'].includes(action)) {
        const newElement = action === 'adicionarFuncao'
          ? main.querySelector('.func-card:last-child')
          : [...main.querySelectorAll('[data-arg2="nome"]')].find(input => input.dataset.arg1 === args[1])?.closest('.func-card').querySelector('.code-block-wrapper:last-child');
        newElement?.scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
        newElement?.querySelector('input, textarea')?.focus({ preventScroll: true });
      } else if (action === 'moverFuncao') main.scrollTop = previous;
      return result;
    };
  });
})();
