(() => {
  const quiz = document.querySelector('#catalog-quiz');
  const content = quiz.querySelector('[data-quiz-content]');
  const marker = quiz.querySelector('.quiz__step');
  const progress = quiz.querySelector('progress');
  const form = document.querySelector('#quote-form');

  const questions = {
    type: ['Какой подарок вы ищете?', ['Готовые наборы', 'Свой набор с логотипом', 'Пока выбираю']],
    ready: ['Кому нужны подарки?', ['Сотрудникам', 'Клиентам', 'Партнёрам', 'Для нескольких групп']],
    custom: ['Что хотите персонализировать?', ['Вышивку на текстиле', 'Упаковку или открытку', 'Текстиль и упаковку', 'Нужна помощь с выбором']],
    explore: ['Для какого повода нужен подарок?', ['Праздник', 'Юбилей компании', 'Встреча или мероприятие', 'Повод пока уточняем']],
    quantity: ['Сколько подарков нужно?', ['До 30', '31–100', '101–300', 'Больше 300', 'Пока не знаю']],
    date: ['Когда нужны подарки?', ['В ближайшие 2 недели', 'В течение месяца', 'Позже чем через месяц', 'Дата пока неизвестна']],
  };
  const secondStep = ['ready', 'custom', 'explore'];
  const answers = new Map();
  let step = 0;
  let sentSummary;

  function make(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function button(text, className, onClick) {
    const element = make('button', text, className);
    element.type = 'button';
    element.addEventListener('click', onClick);
    return element;
  }

  function sendToContact(route) {
    const comment = form.elements.namedItem('comment');
    const summary = ['Запрос каталога 2026–2027', ...route.map(key =>
      questions[key][0] + ' ' + questions[key][1][answers.get(key)]
    )].join('\n');
    const existing = sentSummary && comment.value.startsWith(sentSummary)
      ? comment.value.slice(sentSummary.length).trimStart()
      : comment.value.trim();
    comment.value = [summary, existing].filter(Boolean).join('\n\n');
    sentSummary = summary;
    window.location.hash = 'contact';
    form.elements.namedItem('name').focus({ preventScroll: true });
  }

  function render(focus = true) {
    const route = ['type', secondStep[answers.get('type')], 'quantity', 'date'];
    const key = route[step];
    const done = step === route.length;
    marker.textContent = done ? 'Все вопросы пройдены' : `Вопрос ${step + 1} из ${route.length}`;
    progress.value = step;

    const screen = make('div', '', 'quiz__screen');
    const heading = make('h3', done ? 'Куда отправить каталог?' : questions[key][0]);
    heading.tabIndex = -1;
    screen.append(heading);
    const actions = make('div', '', 'quiz__actions');
    if (step > 0) actions.append(button('Назад', 'button alt', () => {
      step--;
      render();
    }));

    if (done) {
      screen.append(make('p', 'Укажите имя и удобный способ связи. Ответы перенесём в форму.'));
      actions.append(button('Оставить контакт', 'button', () => sendToContact(route)));
    } else {
      const options = make('div', '', 'quiz__answers');
      const next = button(step === 3 ? 'Продолжить' : 'Далее', 'button', () => {
        step++;
        render();
      });
      next.disabled = !answers.has(key);
      questions[key][1].forEach((label, index) => {
        const option = button(label, 'quiz__answer', () => {
          if (key === 'type' && answers.has(key) && answers.get(key) !== index) {
            answers.delete(secondStep[answers.get(key)]);
          }
          answers.set(key, index);
          for (const item of options.children) item.setAttribute('aria-pressed', String(item === option));
          next.disabled = false;
        });
        option.setAttribute('aria-pressed', String(answers.get(key) === index));
        options.append(option);
      });
      screen.append(options);
      actions.append(next);
    }

    screen.append(actions);
    content.replaceChildren(screen);
    if (focus) heading.focus({ preventScroll: true });
  }

  render(false);
})();
