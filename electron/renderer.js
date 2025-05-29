// 🚀 Funcionalidad de Tabs
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabPanels = document.querySelectorAll(".tab-panel")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab

      // Remover clase active de todos los botones y paneles
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabPanels.forEach((panel) => panel.classList.remove("active"))

      // Agregar clase active al botón y panel seleccionado
      button.classList.add("active")
      document.getElementById(`${targetTab}-panel`).classList.add("active")

      // Cargar contenido específico según el tab
      if (targetTab === "history") {
        loadPriceHistory()
      } else if (targetTab === "jobs") {
        loadActiveJobs()
      }
    })
  })
}

// 🚀 Funciones para cargar historial de precios
async function loadPriceHistory() {
  const container = document.getElementById("priceHistoryContainer")

  try {
    container.innerHTML = '<div class="loading">🔄 Cargando historial...</div>'

    const history = await window.electronAPI.getPriceHistory()
    const methods = await window.electronAPI.getMethods("ARS")

    if (!history || history.length === 0) {
      container.innerHTML = `
        <div class="no-history">
          <p>📊 No hay precios registrados aún</p>
          <p>Inicia un seguimiento en la pestaña de Configuración para comenzar a ver el historial.</p>
        </div>
      `
      return
    }

    container.innerHTML = history
      .map((item) =>{
          currentMethodsData = methods.responseFromBinance.data.tradeMethods
            .map((method) => {
              return method.tradeMethodName
            })
          return  `
      <div class="price-history-item">
        <div class="price-header">
          <div class="price-main">💸 ${item.price} ${item.asset}/${item.fiat}</div>
          <div class="price-timestamp">${formatTimestamp(item.timestamp)}</div>
        </div>
        <div class="price-details">
          <div class="price-detail">
            <strong>👤 Usuario:</strong> ${item.advertiser}
          </div>
          <div class="price-detail">
            <strong>💰 Cantidad:</strong> ${item.amount} ${item.asset}
          </div>
          <div class="price-detail">
            <strong>📊 Rango:</strong> ${item.minAmount} - ${item.maxAmount} ${item.fiat}
          </div>
          <div class="price-detail">
            <strong>📈 Tipo:</strong> ${item.tradeType === "BUY" ? "Compra" : "Venta"}
          </div>
        </div>
        <div class="price-methods">
          <strong>💳 Métodos de pago:</strong> ${currentMethodsData}
        </div>
      </div>
    `})
      .join("")
  } catch (error) {
    console.error("Error al cargar historial:", error)
    container.innerHTML = `
      <div class="no-history">
        <p>❌ Error al cargar el historial</p>
        <p>Verifica que el servidor esté funcionando correctamente.</p>
      </div>
    `
  }
}

// 🚀 Función COMPLETAMENTE CORREGIDA para parsear la key del job
function parseJobKey(jobKey) {

  // La key ahora usa | como separador principal
  const parts = jobKey.split("|")

  if (parts.length >= 6) {
    const fiat = parts[0]
    const tradeType = parts[1]
    const asset = parts[2]
    const payTypes = parts[3]
    const publisherType = parts[4]

    // Decodificar la expresión cron
    const cronExpressionEncoded = parts[5]
    const cronExpression = cronExpressionEncoded.replace(/_SPACE_/g, " ").replace(/_ASTERISK_/g, "*")


    return {
      fiat,
      tradeType,
      asset,
      payTypes,
      publisherType,
      cronExpression,
    }
  }

  // Fallback para formato anterior (usando _)
  const legacyParts = jobKey.split("_")

  return {
    fiat: legacyParts[0] || "N/A",
    tradeType: legacyParts[1] || "N/A",
    asset: legacyParts[2] || "N/A",
    payTypes: legacyParts[3] || "none",
    publisherType: legacyParts[4] || "none",
    cronExpression: legacyParts.slice(5).join(" ") || "N/A",
  }
}

// 🚀 Función para traducir el tipo de comerciante
function translatePublisherType(publisherType) {
  switch (publisherType) {
    case "merchant":
      return "Verificados"
    case "none":
    case null:
    case undefined:
      return "Todos"
    default:
      return "Todos"
  }
}

// 🚀 Funciones para cargar jobs activos - COMPLETAMENTE CORREGIDA
async function loadActiveJobs() {
  const container = document.getElementById("activeJobsContainer")

  try {
    container.innerHTML = '<div class="loading">🔄 Cargando jobs activos...</div>'

    const jobs = await window.electronAPI.getActiveJobs()
    const methods = await window.electronAPI.getMethods("ARS")

    // Mapear los datos para incluir tanto identifier como tradeMethodName


    if (!jobs || jobs.length === 0) {
      container.innerHTML = `
      <div class="no-jobs">
      <p>⚡ No hay jobs activos</p>
      <p>Configura un seguimiento en la pestaña de Configuración para ver los jobs activos aquí.</p>
      </div>
      `
      return
    }

    container.innerHTML = jobs
      .map((job) => {
        // 🚀 Usar la nueva función de parsing
        const jobData = parseJobKey(job.key)
        currentMethodsData = methods.responseFromBinance.data.tradeMethods
          .map((method) => {
            return method.tradeMethodName
          })

        return `
        <div class="job-item">
          <div class="job-header">
            <div class="job-title">📊 ${jobData.asset}/${jobData.fiat} - ${jobData.tradeType === "BUY" ? "Compra" : "Venta"}</div>
            <div class="job-status">🟢 ACTIVO</div>
          </div>
          <div class="job-details">
            <div class="job-detail">
              <strong>💰 Criptoactivo:</strong> ${jobData.asset}
            </div>
            <div class="job-detail">
              <strong>💵 Moneda:</strong> ${jobData.fiat}
            </div>
            <div class="job-detail">
              <strong>📈 Tipo:</strong> ${jobData.tradeType === "BUY" ? "Compra" : "Venta"}
            </div>
            <div class="job-detail">
              <strong>👨‍💼 Comerciantes:</strong> ${translatePublisherType(jobData.publisherType)}
            </div>
            <div class="job-detail">
              <strong>💳 Métodos de pago:</strong>${currentMethodsData}
            </div>
            <div class="job-detail">
              <strong>⏰ Frecuencia:</strong> ${formatCronExpression(jobData.cronExpression)}
            </div>
            ${job.price
            ? `
              <div class="job-detail">
                <strong>💸 Último precio:</strong> ${job.price} ${jobData.fiat}
              </div>
              <div class="job-detail">
                <strong>👤 Último usuario:</strong> ${job.advertiser}
              </div>
            `
            : ""
          }
          </div>
        </div>
      `
      })
      .join("")
  } catch (error) {
    console.error("Error al cargar jobs activos:", error)
    container.innerHTML = `
      <div class="no-jobs">
        <p>❌ Error al cargar los jobs activos</p>
        <p>Verifica que el servidor esté funcionando correctamente.</p>
      </div>
    `
  }
}

// 🚀 Funciones auxiliares
function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// 🚀 Función MEJORADA para formatear expresiones cron
function formatCronExpression(cronExpr) {
  if (!cronExpr || cronExpr === "N/A") {
    return "Frecuencia desconocida"
  }

  // Limpiar la expresión cron de posibles caracteres extra
  const cleanCronExpr = cronExpr.trim()

  const cronMap = {
    "*/5 * * * * *": "Cada 5 segundos",
    "*/10 * * * * *": "Cada 10 segundos",
    "*/30 * * * * *": "Cada 30 segundos",
    "0 * * * * *": "Cada minuto",
    "0 */2 * * * *": "Cada 2 minutos",
    "0 */5 * * * *": "Cada 5 minutos",
    "0 */10 * * * *": "Cada 10 minutos",
    "0 */15 * * * *": "Cada 15 minutos",
    "0 */30 * * * *": "Cada 30 minutos",
    "0 0 * * * *": "Cada hora",
  }

  // Buscar coincidencia exacta primero
  if (cronMap[cleanCronExpr]) {
    return cronMap[cleanCronExpr]
  }

  // Si no encuentra coincidencia exacta, intentar parsear manualmente
  const parts = cleanCronExpr.split(" ")

  if (parts.length === 6) {
    const [seconds, minutes, hours, dayOfMonth, month, dayOfWeek] = parts

    // Casos comunes de segundos
    if (seconds.startsWith("*/") && minutes === "*" && hours === "*") {
      const interval = seconds.substring(2)
      return `Cada ${interval} segundos`
    }

    // Casos comunes de minutos
    if (seconds === "0" && minutes.startsWith("*/") && hours === "*") {
      const interval = minutes.substring(2)
      return `Cada ${interval} minutos`
    }

    // Casos comunes de horas
    if (seconds === "0" && minutes === "0" && hours.startsWith("*/")) {
      const interval = hours.substring(2)
      return `Cada ${interval} horas`
    }
  }

  // Si no puede parsear, devolver la expresión original
  return cleanCronExpr
}

// 🚀 Event listeners para los botones de control
function setupControlButtons() {
  // Botón para limpiar historial
  const clearHistoryButton = document.getElementById("clearHistoryButton")
  if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", async () => {
      if (confirm("¿Estás seguro de que quieres limpiar todo el historial de precios?")) {
        try {
          await window.electronAPI.clearPriceHistory()
          await loadPriceHistory()
          alert("Historial limpiado exitosamente")
        } catch (error) {
          console.error("Error al limpiar historial:", error)
          alert("Error al limpiar el historial")
        }
      }
    })
  }

  // Botón para actualizar historial
  const refreshHistoryButton = document.getElementById("refreshHistoryButton")
  if (refreshHistoryButton) {
    refreshHistoryButton.addEventListener("click", () => {
      loadPriceHistory()
    })
  }

  // Botón para actualizar jobs
  const refreshJobsButton = document.getElementById("refreshJobsButton")
  if (refreshJobsButton) {
    refreshJobsButton.addEventListener("click", () => {
      loadActiveJobs()
    })
  }
}

// 🚀 Modificar el DOMContentLoaded para incluir las nuevas funcionalidades
// Agregar al final del DOMContentLoaded existente:
window.addEventListener("DOMContentLoaded", async () => {
  // Inicializar sistema de tabs PRIMERO
  initializeTabs()

  // Configurar botones de control
  setupControlButtons()

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
        cronSelected.classList.remove("active")
        userSelections.cronExpression = config.expression
      })
      cronOptionsList.appendChild(li)
    })

    // Event listener para dropdown de cron
    cronSelected.addEventListener("click", () => {
      const isVisible = cronOptionsList.style.display === "block"
      if (isVisible) {
        cronOptionsList.style.display = "none"
        cronSelected.classList.remove("active")
      } else {
        cronOptionsList.style.display = "block"
        cronSelected.classList.add("active")
      }
    })

    document.addEventListener("click", (e) => {
      if (!cronDropdown.contains(e.target)) {
        cronOptionsList.style.display = "none"
        cronSelected.classList.remove("active")
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
  })

  onlyVerifiedCheckbox.addEventListener("change", (e) => {
    userSelections.onlyVerified = e.target.checked
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


      // Deshabilitar botón mientras se procesa
      generateButton.disabled = true
      generateButton.textContent = "Generando..."

      // Llamar al método getAlerts
      const result = await window.electronAPI.generateTracking(params)

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
}

// 🚀 Función para limpiar todas las selecciones
function clearAllMethods() {
  userSelections.paymentMethods = []
  updateSelectedMethodsDisplay()
  updateCheckboxStates()
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

          // 🚀 Cargar métodos de pago cuando cambie el fiat
          loadPaymentMethods(userSelections.fiat)
        } else if (containerId === "config-dropdown") {
          userSelections.crypto = item[valueKey]
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
