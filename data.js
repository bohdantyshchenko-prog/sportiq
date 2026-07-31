(() => {
  'use strict';
  const N = window.NOVIQ;
  N.matches = [
    { id:'mci-rma', date:'today', groups:['for-you','favorites','thesis'], tournament:'Champions League', time:'21:45', status:'UPCOMING', home:'Manchester City', away:'Real Madrid', hc:'MCI', ac:'RMA', homeStyle:'Control & overloads', awayStyle:'Transitions & depth', intelligence:94, signals:[['68%','territorial control'],['HIGH','transition risk'],['OPEN','lineup uncertainty']] },
    { id:'ars-bar', date:'today', groups:['for-you','live'], tournament:'Champions League', time:"67′", status:'LIVE', score:'1–1', home:'Arsenal', away:'Barcelona', hc:'ARS', ac:'BAR', homeStyle:'Half-space pressure', awayStyle:'Rest defence', intelligence:88, signals:[['72%','thesis holds'],['RISING','counter risk'],['2/3','arguments confirmed']] },
    { id:'int-bay', date:'yesterday', groups:['for-you','replay'], tournament:'Champions League', time:'FT', status:'REPLAY', score:'2–1', home:'Inter', away:'Bayern', hc:'INT', ac:'BAY', homeStyle:'Vertical exits', awayStyle:'Wide occupation', intelligence:91, signals:[['82','decision score'],['91','tactical IQ'],['69','calibration']] },
    { id:'pol-dyn', date:'tomorrow', groups:['for-you','favorites','thesis'], tournament:'Ukraine', time:'17:00', status:'UPCOMING', home:'Polissya', away:'Dynamo Kyiv', hc:'POL', ac:'DKY', homeStyle:'Direct pressure', awayStyle:'Possession build-up', intelligence:86, signals:[['BEST','growth match'],['MED','data depth'],['HIGH','local relevance']] },
    { id:'psg-liv', date:'week', groups:['favorites'], tournament:'Club World Cup', time:'19:00', status:'UPCOMING', home:'PSG', away:'Liverpool', hc:'PSG', ac:'LIV', homeStyle:'Individual creation', awayStyle:'Counterpress', intelligence:84, signals:[['FAST','tempo'],['HIGH','pressing risk'],['OPEN','lineups']] }
  ];
  N.recommendations = [
    { id:'rec-match', type:'MATCH', title:'Polissya — Dynamo Kyiv', copy:'Проверит твою склонность переоценивать фаворита и даст локальный контекст.', action:'open-match-card', target:'pol-dyn', score:96 },
    { id:'rec-memory', type:'MEMORY', title:'Вернись к Inter — Bayern', copy:'Похожий сценарий: сильная тактика, но завышенная уверенность.', action:'open-replay', target:'int-bay', score:91 },
    { id:'rec-lesson', type:'LESSON', title:'Неизвестность состава', copy:'Короткий урок о том, как снижать уверенность до публикации составов.', action:'open-lesson', target:'uncertainty', score:88 }
  ];
  N.diagnosticQuestions = [
    { skill:'tactical', q:'Команда владеет мячом 68%, но почти не входит в штрафную. Какой вывод сильнее?', a:['Она полностью контролирует матч','Владение без продвижения ещё не означает контроль','Соперник точно устал'], correct:1 },
    { skill:'context', q:'Фаворит играет третий матч за семь дней. Как использовать этот факт?', a:['Автоматически прогнозировать поражение','Учесть вместе с ротацией, стилем и глубиной состава','Игнорировать'], correct:1 },
    { skill:'data', q:'xG вырос из-за одного пенальти. Что делать?', a:['Считать это доказательством доминирования','Отделить пенальти и проверить остальные моменты','Не использовать xG'], correct:1 },
    { skill:'decision', q:'Ключевые составы неизвестны, но ты уверен на 82%.', a:['Оставить 82%','Повысить до 90%','Снизить уверенность из-за неизвестности'], correct:2 },
    { skill:'learning', q:'Исход угадан, но аргументы не подтвердились.', a:['Решение отличное','Результат верный, логика требует пересмотра','Анализ больше не нужен'], correct:1 },
    { skill:'tactical', q:'Соперник отдал территорию и защищает центр низким блоком.', a:['Он всегда проигрывает контроль','Это может быть сознательный выгодный сценарий','Нужно смотреть только владение'], correct:1 },
    { skill:'context', q:'В дерби форма команд часто менее устойчива. Лучшее действие?', a:['Удалить форму из анализа','Снизить вес формы и усилить контекст','Всегда выбирать хозяев'], correct:1 },
    { skill:'data', q:'Показатель основан на трёх матчах.', a:['Считать устойчивым трендом','Отметить малую выборку и искать подтверждение','Не использовать данные вообще'], correct:1 },
    { skill:'decision', q:'Новый факт разрушает ключевое предположение Thesis.', a:['Игнорировать','Сохранить исходный Thesis и отдельно зафиксировать изменение','Удалить старый Thesis'], correct:1 },
    { skill:'learning', q:'После Replay обнаружен повторяющийся bias.', a:['Скрыть ошибку','Создать правило и проверить его в следующем матче','Снизить Sports IQ вручную'], correct:1 }
  ];
})();
