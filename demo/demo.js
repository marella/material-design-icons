(() => {
  const format =
    window.location.pathname.split('/').filter(Boolean).pop() === 'svg'
      ? 'svg'
      : 'font';

  const styles = ['', 'outlined', 'round', 'sharp', 'two-tone'];

  const create = (tag) => document.createElement(tag);

  const getId = (className) => (className ? className : 'filled');

  const getName = (className) => getId(className).replace('-', ' ');

  const render = (icons) => {
    const container = document.getElementById('demo-container');

    const heading = create('h1');
    heading.innerText = 'Available Icons';
    container.appendChild(heading);

    const nav = create('ul');
    nav.classList.add('text-capitalize');
    container.appendChild(nav);

    container.appendChild(renderSearch());

    styles.forEach((className) => {
      nav.appendChild(
        renderNavLink('#' + getId(className), getName(className))
      );
      container.appendChild(renderIcons(icons, className));
    });
  };

  const renderIcons = (icons, className = '') => {
    const div = create('div');
    div.classList.add('demo-icons');

    const heading = create('h2');
    heading.classList.add('text-capitalize');
    heading.setAttribute('id', getId(className));
    heading.innerText = getName(className);
    div.appendChild(heading);

    const styleName = getId(className);
    className = className ? `material-icons-${className}` : 'material-icons';
    Object.keys(icons).forEach((icon) => {
      div.appendChild(renderIcon(icon, className, styleName));
    });
    return div;
  };

  const renderIcon = (name, className, styleName) => {
    const icon = create('span');
    icon.classList.add(className);
    icon.innerText = name;

    const text = create('div');
    text.classList.add('text-ellipsis');
    text.innerText = name;

    const tooltip =
      format === 'svg'
        ? `@material-design-icons/svg/${styleName}/${name}.svg`
        : icon.outerHTML;

    const div = create('div');
    div.classList.add('demo-icon', 'tooltipped');
    div.setAttribute('aria-label', tooltip);
    div.setAttribute('data-icon', name);
    div.appendChild(icon);
    div.appendChild(create('br'));
    div.appendChild(text);
    return div;
  };

  const renderNavLink = (href, text) => {
    const li = create('li');
    const a = create('a');
    a.setAttribute('href', href);
    a.innerText = text;
    li.appendChild(a);
    return li;
  };

  const renderSearch = () => {
    const div = create('div');
    div.classList.add('demo-search');

    const icon = create('span');
    icon.classList.add('material-icons');
    icon.innerText = 'search';
    div.appendChild(icon);

    const input = create('input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Search');
    input.autofocus = true;
    input.addEventListener('keyup', (e) => {
      search(e.currentTarget.value);
    });
    div.appendChild(input);

    return div;
  };

  // see https://davidwalsh.name/javascript-debounce-function
  const debounce = (func, wait = 500) => {
    let timeout = null;
    return (...args) => {
      const later = () => {
        timeout = null;
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const search = debounce((q) => {
    q = (q || '')
      .toLowerCase()
      .replace(/[^a-z0-9_ -]+/g, '')
      .trim()
      .replace(/[ -]+/g, '_');
    document.getElementById('demo-search-style').innerText =
      q && `.demo-icon:not([data-icon*="${q}"]) { display: none; }`;
  });

  render(JSON.parse(ICONS));
})();
