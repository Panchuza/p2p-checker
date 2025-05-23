window.addEventListener('DOMContentLoaded', async () => {
  const dropdown = document.getElementById('fiat-dropdown');
  const selected = document.getElementById('selected-fiat');
  const optionsList = document.getElementById('fiat-options');

  const cryptoDropdown = document.getElementById('config-dropdown');
  const cryptoSelected = document.getElementById('selected-crypto');
  const cryptoOptionsList = document.getElementById('crypto-options');

  const methodsDropdown = document.getElementById('methods-dropdown');
  const methodsSelected = document.getElementById('selected-methods');
  const methodsOptionsList = document.getElementById('methods-options');

  try {
    const fiats = await window.electronAPI.getFiats();

    // Ordenar alfabéticamente por currencyCode
    fiats.responseFromBinance.data
      .sort((a, b) => a.currencyCode.localeCompare(b.currencyCode))
      .forEach(fiat => {
        const li = document.createElement('li');
        li.innerHTML = `
          <img src="${fiat.iconUrl}" alt="${fiat.currencyCode}">
          <span>${fiat.currencyCode}</span>
        `;
        li.addEventListener('click', () => {
          selected.innerHTML = `
            <img src="${fiat.iconUrl}" alt="${fiat.currencyCode}">
            <span>${fiat.currencyCode}</span>
          `;
          optionsList.style.display = 'none';
          // Aquí podrías guardar el valor seleccionado si lo necesitás:
          selected.dataset.value = fiat.currencyCode;
        });
        optionsList.appendChild(li);
      });

    // Mostrar/Ocultar dropdown
    selected.addEventListener('click', () => {
      const isVisible = optionsList.style.display === 'block';
      optionsList.style.display = isVisible ? 'none' : 'block';
    });

    // Cerrar dropdown si se hace clic fuera
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        optionsList.style.display = 'none';
      }
    });

    const configs = await window.electronAPI.getConfig();
    configs.responseFromBinance.data.areas[0].tradeSides[0].assets
      .forEach(config => {
        const li = document.createElement('li');
        li.innerHTML = `
          <img src="${config.iconUrl}" alt="${config.asset}">
          <span>${config.asset}</span>
        `;
        li.addEventListener('click', () => {
          cryptoSelected.innerHTML = `
            <img src="${config.iconUrl}" alt="${config.asset}">
            <span>${config.asset}</span>
          `;
          cryptoOptionsList.style.display = 'none';
          cryptoSelected.dataset.value = config.asset;
        });
        cryptoOptionsList.appendChild(li);
      });

    cryptoSelected.addEventListener('click', () => {
      const isVisible = cryptoOptionsList.style.display === 'block';
      cryptoOptionsList.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!cryptoDropdown.contains(e.target)) {
        cryptoOptionsList.style.display = 'none';
      }
    });

    const methods = await window.electronAPI.getMethods();
    methods.responseFromBinance.data.tradeMethods
      .forEach(method => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${method.tradeMethodName}</span>
        `;
        li.addEventListener('click', () => {
          methodsSelected.innerHTML = `
            <span>${method.tradeMethodName}</span>
          `;
          methodsOptionsList.style.display = 'none';
          methodsSelected.dataset.value = method.tradeMethodName;
        });
        methodsOptionsList.appendChild(li);
      });

    methodsSelected.addEventListener('click', () => {
      const isVisible = methodsOptionsList.style.display === 'block';
      methodsOptionsList.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!methodsDropdown.contains(e.target)) {
        methodsOptionsList.style.display = 'none';
      }
    });

  } catch (error) {
    console.error('Error al obtener fiats:', error);
  }

  try {
    
  } catch (error) {
    console.error('Error al obtener config:', error);
  }
});
