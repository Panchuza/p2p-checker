// 🚀 Objeto para almacenar las selecciones del usuario
const userSelections = {
  fiat: "ARS", // 🚀 Default ARS
  crypto: null,
  paymentMethods: [], // 🚀 Ahora es un array para múltiples métodos
  orderType: "Compra", // valor por defecto
  onlyVerified: false,
  cronExpression: "*/5 * * * * *", // valor por defecto: cada 5 segundos
}

// 🚀 Variable global para almacenar los métodos de pago
let currentMethodsData = []

// 🚀 Función para actualizar la visualización de métodos seleccionados
function updateSelectedMethodsDisplay() {
  const methodsSelected = document.getElementById("selected-methods")

  if (userSelections.paymentMethods.length === 0) {
    methodsSelected.innerHTML = `<span>Seleccionar métodos de pago (opcional)</span>`
  } else if (userSelections.paymentMethods.length === 1) {
    const method = currentMethodsData.find((m) => m.identifier === userSelections.paymentMethods[0])
    methodsSelected.innerHTML = `
      <span>${method ? method.tradeMethodName : userSelections.paymentMethods[0]}</span>
      <span class="methods-counter">1</span>
    `
  } else {
    methodsSelected.innerHTML = `
      <span>${userSelections.paymentMethods.length} métodos seleccionados</span>
      <span class="methods-counter">${userSelections.paymentMethods.length}</span>
    `
  }
}

// 🚀 Función para seleccionar todos los métodos
function selectAllMethods() {
  userSelections.paymentMethods = [...currentMethodsData.map((method) => method.identifier)]
  updateSelectedMethodsDisplay()
  updateCheckboxStates()
  console.log("Todos los métodos seleccionados:", userSelections.paymentMethods)
}

// 🚀 Función para limpiar todas las selecciones
function clearAllMethods() {
  userSelections.paymentMethods = []
  updateSelectedMethodsDisplay()
  updateCheckboxStates()
  console.log("Métodos limpiados:", userSelections.paymentMethods)
}

// 🚀 Función para actualizar el estado de los checkboxes
function updateCheckboxStates() {
  const checkboxes = document.querySelectorAll(".method-checkbox")
  checkboxes.forEach((checkbox) => {
    const identifier = checkbox.dataset.identifier
    checkbox.checked = userSelections.paymentMethods.includes(identifier)
  })
}

// 🚀 Función para crear botones de control
function createControlButtons() {
  const controlDiv = document.createElement("li")
  controlDiv.className = "control-buttons"
  controlDiv.innerHTML = `
    <button class="control-button" id="select-all-btn">Seleccionar todos</button>
    <button class="control-button clear" id="clear-all-btn">Limpiar</button>
  `

  // Event listeners para los botones
  const selectAllBtn = controlDiv.querySelector("#select-all-btn")
  const clearAllBtn = controlDiv.querySelector("#clear-all-btn")

  selectAllBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    selectAllMethods()
  })

  clearAllBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    clearAllMethods()
  })

  return controlDiv
}

// 🚀 Función COMPLETAMENTE NUEVA para crear opciones de métodos
function createMethodOption(method, isChecked = false) {
  const li = document.createElement("li")
  li.className = "method-option"

  // 🚀 Crear estructura simple sin flexbox complicado
  li.innerHTML = `
    <div class="method-row">
      <input type="checkbox" class="method-checkbox" data-identifier="${method.identifier}" ${isChecked ? "checked" : ""}>
      <span class="method-text">${method.tradeMethodName}</span>
    </div>
  `

  const checkbox = li.querySelector(".method-checkbox")
  const methodRow = li.querySelector(".method-row")

  // Event listener para el checkbox
  checkbox.addEventListener("change", (e) => {
    e.stopPropagation()
    const identifier = e.target.dataset.identifier

    if (e.target.checked) {
      if (!userSelections.paymentMethods.includes(identifier)) {
        userSelections.paymentMethods.push(identifier)
      }
    } else {
      userSelections.paymentMethods = userSelections.paymentMethods.filter((id) => id !== identifier)
    }

    updateSelectedMethodsDisplay()
    console.log("Métodos de pago seleccionados:", userSelections.paymentMethods)
  })

  // Event listener para toda la fila (para hacer clic en cualquier parte)
  methodRow.addEventListener("click", (e) => {
    if (e.target !== checkbox) {
      checkbox.checked = !checkbox.checked
      checkbox.dispatchEvent(new Event("change"))
    }
  })

  return li
}

// 🚀 Función para mostrar mensaje cuando no hay resultados
function showNoResults(container) {
  container.innerHTML = `
    <li class="no-results">
      No se encontraron métodos de pago
    </li>
  `
}

// 🚀 Función para cargar métodos de pago basado en fiat seleccionado
async function loadPaymentMethods(fiat = "ARS") {
  try {
    console.log("Cargando métodos de pago para:", fiat)
    const methods = await window.electronAPI.getMethods(fiat)

    // Mapear los datos para incluir tanto identifier como tradeMethodName
    currentMethodsData = methods.responseFromBinance.data.tradeMethods
      .map((method) => ({
        identifier: method.identifier,
        tradeMethodName: method.tradeMethodName,
        iconUrlColor: method.iconUrlColor,
      }))
      .sort((a, b) => a.tradeMethodName.localeCompare(b.tradeMethodName)) // 🚀 Ordenar alfabéticamente

    // Recrear el dropdown de métodos con los nuevos datos
    const methodsOptionsList = document.getElementById("methods-options")

    // Limpiar opciones existentes
    methodsOptionsList.innerHTML = ""

    // Reset selección de métodos
    userSelections.paymentMethods = []

    // 🚀 Agregar botones de control primero
    const controlButtons = createControlButtons()
    methodsOptionsList.appendChild(controlButtons)

    // 🚀 Crear opciones ordenadas
    currentMethodsData.forEach((method) => {
      const li = createMethodOption(method)
      methodsOptionsList.appendChild(li)
    })

    console.log("Métodos de pago cargados:", currentMethodsData.length)
  } catch (error) {
    console.error("Error al cargar métodos de pago:", error)
    const methodsOptionsList = document.getElementById("methods-options")
    showNoResults(methodsOptionsList)
  }
}

// 🚀 Función para crear dropdown con búsqueda (actualizada)
function createSearchableDropdown(containerId, selectedId, optionsId, data, displayKey, valueKey, iconKey = null) {
  const container = document.getElementById(containerId)
  const selected = document.getElementById(selectedId)
  const optionsList = document.getElementById(optionsId)

  // Crear input de búsqueda
  const searchInput = document.createElement("input")
  searchInput.type = "text"
  searchInput.placeholder = "Buscar..."
  searchInput.className = "dropdown-search"
  searchInput.style.display = "none"

  // Insertar el input después del elemento selected
  selected.parentNode.insertBefore(searchInput, selected.nextSibling)

  let allOptions = []

  // Función para renderizar opciones
  function renderOptions(filteredData) {
    optionsList.innerHTML = ""

    if (filteredData.length === 0) {
      showNoResults(optionsList)
      return
    }

    filteredData.forEach((item) => {
      const li = document.createElement("li")
      if (iconKey && item[iconKey]) {
        li.innerHTML = `
          <img src="${item[iconKey]}" alt="${item[displayKey]}">
          <span>${item[displayKey]}</span>
        `
      } else {
        li.innerHTML = `<span>${item[displayKey]}</span>`
      }

      li.addEventListener("click", () => {
        if (iconKey && item[iconKey]) {
          selected.innerHTML = `
            <img src="${item[iconKey]}" alt="${item[displayKey]}">
            <span>${item[displayKey]}</span>
          `
        } else {
          selected.innerHTML = `<span>${item[displayKey]}</span>`
        }

        optionsList.style.display = "none"
        searchInput.style.display = "none"
        searchInput.value = ""
        selected.dataset.value = item[valueKey]
        selected.classList.remove("active")

        // Guardar selección según el tipo de dropdown
        if (containerId === "fiat-dropdown") {
          userSelections.fiat = item[valueKey]
          console.log("Fiat seleccionado:", userSelections.fiat)

          // 🚀 Cargar métodos de pago cuando cambie el fiat
          loadPaymentMethods(userSelections.fiat)
        } else if (containerId === "config-dropdown") {
          userSelections.crypto = item[valueKey]
          console.log("Crypto seleccionado:", userSelections.crypto)
        }
      })
      optionsList.appendChild(li)
    })
  }

  // Inicializar con todos los datos
  allOptions = data
  renderOptions(data)

  // Event listener para búsqueda
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const filteredData = allOptions.filter((item) => item[displayKey].toLowerCase().includes(searchTerm))
    renderOptions(filteredData)
  })

  // Mostrar/Ocultar dropdown
  selected.addEventListener("click", () => {
    const isVisible = optionsList.style.display === "block"
    if (isVisible) {
      optionsList.style.display = "none"
      searchInput.style.display = "none"
      selected.classList.remove("active")
    } else {
      optionsList.style.display = "block"
      searchInput.style.display = "block"
      searchInput.focus()
      selected.classList.add("active")
    }
  })

  // Cerrar dropdown si se hace clic fuera
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      optionsList.style.display = "none"
      searchInput.style.display = "none"
      searchInput.value = ""
      selected.classList.remove("active")
      renderOptions(allOptions)
    }
  })
}

// 🚀 Configuraciones de cron predefinidas
const cronConfigs = [
  { expression: "*/5 * * * * *", description: "Cada 5 segundos" },
  { expression: "*/10 * * * * *", description: "Cada 10 segundos" },
  { expression: "*/30 * * * * *", description: "Cada 30 segundos" },
  { expression: "0 * * * * *", description: "Cada minuto" },
  { expression: "0 */2 * * * *", description: "Cada 2 minutos" },
  { expression: "0 */5 * * * *", description: "Cada 5 minutos" },
  { expression: "0 */10 * * * *", description: "Cada 10 minutos" },
  { expression: "0 */15 * * * *", description: "Cada 15 minutos" },
  { expression: "0 */30 * * * *", description: "Cada 30 minutos" },
  { expression: "0 0 * * * *", description: "Cada hora" },
]

window.addEventListener("DOMContentLoaded", async () => {
  const dropdown = document.getElementById("fiat-dropdown")
  const selected = document.getElementById("selected-fiat")
  const optionsList = document.getElementById("fiat-options")

  const cryptoDropdown = document.getElementById("config-dropdown")
  const cryptoSelected = document.getElementById("selected-crypto")
  const cryptoOptionsList = document.getElementById("crypto-options")

  const methodsDropdown = document.getElementById("methods-dropdown")
  const methodsSelected = document.getElementById("selected-methods")
  const methodsOptionsList = document.getElementById("methods-options")

  // 🚀 Referencias a los elementos de cron
  const cronDropdown = document.getElementById("cron-dropdown")
  const cronSelected = document.getElementById("selected-cron")
  const cronOptionsList = document.getElementById("cron-options")

  // 🚀 Referencias a los otros elementos
  const orderTypeSelect = document.getElementById("orderType")
  const onlyVerifiedCheckbox = document.getElementById("onlyVerified")
  const generateButton = document.getElementById("generateButton")

  try {
    // 🚀 Configurar dropdown de cron
    cronConfigs.forEach((config) => {
      const li = document.createElement("li")
      li.innerHTML = `<span>${config.description}</span>`
      li.addEventListener("click", () => {
        cronSelected.innerHTML = `<span>${config.description}</span>`
        cronOptionsList.style.display = "none"
        cronSelected.dataset.value = config.expression
        userSelections.cronExpression = config.expression
        console.log("Cron seleccionado:", config.description, "->", config.expression)
      })
      cronOptionsList.appendChild(li)
    })

    // Event listener para dropdown de cron
    cronSelected.addEventListener("click", () => {
      const isVisible = cronOptionsList.style.display === "block"
      cronOptionsList.style.display = isVisible ? "none" : "block"
    })

    document.addEventListener("click", (e) => {
      if (!cronDropdown.contains(e.target)) {
        cronOptionsList.style.display = "none"
      }
    })

    // Establecer valor por defecto de cron
    cronSelected.innerHTML = `<span>${cronConfigs[0].description}</span>`
    cronSelected.dataset.value = cronConfigs[0].expression

    // 🚀 Cargar datos y configurar dropdowns con búsqueda
    const fiats = await window.electronAPI.getFiats()
    const fiatData = fiats.responseFromBinance.data
      .sort((a, b) => a.currencyCode.localeCompare(b.currencyCode))
      .map((fiat) => ({
        currencyCode: fiat.currencyCode,
        iconUrl: fiat.iconUrl,
      }))

    createSearchableDropdown(
      "fiat-dropdown",
      "selected-fiat",
      "fiat-options",
      fiatData,
      "currencyCode",
      "currencyCode",
      "iconUrl",
    )

    // 🚀 Establecer ARS como default en el dropdown de fiat
    const arsData = fiatData.find((fiat) => fiat.currencyCode === "ARS")
    if (arsData) {
      selected.innerHTML = `
        <img src="${arsData.iconUrl}" alt="ARS">
        <span>ARS</span>
      `
      selected.dataset.value = "ARS"
    }

    const configs = await window.electronAPI.getConfig()
    const cryptoData = configs.responseFromBinance.data.areas[0].tradeSides[0].assets.map((config) => ({
      asset: config.asset,
      iconUrl: config.iconUrl,
    }))

    createSearchableDropdown(
      "config-dropdown",
      "selected-crypto",
      "crypto-options",
      cryptoData,
      "asset",
      "asset",
      "iconUrl",
    )

    // 🚀 Cargar métodos de pago por defecto (ARS)
    await loadPaymentMethods("ARS")

    // 🚀 Configurar dropdown de métodos con búsqueda
    const searchInput = document.createElement("input")
    searchInput.type = "text"
    searchInput.placeholder = "Buscar métodos de pago..."
    searchInput.className = "dropdown-search"
    searchInput.style.display = "none"
    methodsSelected.parentNode.insertBefore(searchInput, methodsSelected.nextSibling)

    // Event listener para búsqueda en métodos
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase()
      const filteredMethods = currentMethodsData.filter((method) =>
        method.tradeMethodName.toLowerCase().includes(searchTerm),
      )

      // Recrear opciones filtradas manteniendo el estado de los checkboxes
      methodsOptionsList.innerHTML = ""

      // Agregar botones de control
      const controlButtons = createControlButtons()
      methodsOptionsList.appendChild(controlButtons)

      if (filteredMethods.length === 0) {
        const noResults = document.createElement("li")
        noResults.className = "no-results"
        noResults.innerHTML = "No se encontraron métodos de pago"
        methodsOptionsList.appendChild(noResults)
        return
      }

      filteredMethods.forEach((method) => {
        const isChecked = userSelections.paymentMethods.includes(method.identifier)
        const li = createMethodOption(method, isChecked)
        methodsOptionsList.appendChild(li)
      })
    })

    // Event listeners para dropdown de métodos
    methodsSelected.addEventListener("click", () => {
      const isVisible = methodsOptionsList.style.display === "block"
      if (isVisible) {
        methodsOptionsList.style.display = "none"
        searchInput.style.display = "none"
        methodsSelected.classList.remove("active")
      } else {
        methodsOptionsList.style.display = "block"
        searchInput.style.display = "block"
        searchInput.focus()
        methodsSelected.classList.add("active")
      }
    })

    document.addEventListener("click", (e) => {
      if (!methodsDropdown.contains(e.target)) {
        methodsOptionsList.style.display = "none"
        searchInput.style.display = "none"
        searchInput.value = ""
        methodsSelected.classList.remove("active")

        // Restaurar todas las opciones manteniendo el estado
        if (currentMethodsData.length > 0) {
          methodsOptionsList.innerHTML = ""

          // Agregar botones de control
          const controlButtons = createControlButtons()
          methodsOptionsList.appendChild(controlButtons)

          currentMethodsData.forEach((method) => {
            const isChecked = userSelections.paymentMethods.includes(method.identifier)
            const li = createMethodOption(method, isChecked)
            methodsOptionsList.appendChild(li)
          })
        }
      }
    })
  } catch (error) {
    console.error("Error al obtener datos:", error)
  }

  // 🚀 Event listeners para capturar cambios en los inputs
  orderTypeSelect.addEventListener("change", (e) => {
    userSelections.orderType = e.target.value
    console.log("Tipo de orden seleccionado:", userSelections.orderType)
  })

  onlyVerifiedCheckbox.addEventListener("change", (e) => {
    userSelections.onlyVerified = e.target.checked
    console.log("Solo verificados:", userSelections.onlyVerified)
  })

  // 🚀 Event listener para el botón "Generar seguimiento"
  generateButton.addEventListener("click", async () => {
    try {
      // Validar que se hayan seleccionado los campos requeridos
      if (!userSelections.fiat) {
        alert("Por favor selecciona una moneda")
        return
      }
      if (!userSelections.crypto) {
        alert("Por favor selecciona un criptoactivo")
        return
      }

      // Preparar parámetros para enviar al backend
      const params = {
        fiat: userSelections.fiat,
        asset: userSelections.crypto,
        tradeType: userSelections.orderType === "Compra" ? "BUY" : "SELL",
        payTypes: userSelections.paymentMethods.length > 0 ? userSelections.paymentMethods : null,
        publisherType: userSelections.onlyVerified ? "merchant" : null,
        cronExpression: userSelections.cronExpression,
      }

      console.log("Enviando parámetros:", params)

      // Deshabilitar botón mientras se procesa
      generateButton.disabled = true
      generateButton.textContent = "Generando..."

      // Llamar al método getAlerts
      const result = await window.electronAPI.generateTracking(params)

      console.log("Resultado del seguimiento:", result)
      alert("Seguimiento generado exitosamente!")
    } catch (error) {
      console.error("Error al generar seguimiento:", error)
      alert("Error al generar seguimiento: " + error.message)
    } finally {
      // Rehabilitar botón
      generateButton.disabled = false
      generateButton.textContent = "Generar seguimiento"
    }
  })
})
