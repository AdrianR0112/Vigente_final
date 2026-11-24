(() => {
  "use strict";

  const data = window.VIGENTE_DATA;
  const app = document.querySelector("#app");
  const dialog = document.querySelector("#document-dialog");
  const frame = document.querySelector("#document-frame");
  const toast = document.querySelector("#toast");
  const mobileNav = document.querySelector("#mobile-navigation");
  const navToggle = document.querySelector(".nav-toggle");
  const organizationUrl = "https://adrianr0112.github.io/remuneraciones/";
  const icons = {
    emprendimiento: "briefcase",
    tributarias: "receipt",
    remuneraciones: "people",
    liquidacion: "scale",
  };

  const money = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  const number = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 });
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  function brandMarkup() {
    return `<a class="brand-lockup" href="#inicio" aria-label="Vigente, ir al inicio">
      <span class="brand-bars" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="brand-copy"><strong>Vigente</strong><span>Dashboard integrador</span></span>
    </a>`;
  }

  function setupHeader() {
    const header = document.querySelector(".site-header");
    if (!header.querySelector(".brand-lockup")) header.insertAdjacentHTML("afterbegin", brandMarkup());
    mobileNav.innerHTML = document.querySelector(".top-nav").innerHTML;
    const setMenuOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.querySelector(".sr-only").textContent = open ? "Cerrar menú" : "Abrir menú";
      mobileNav.hidden = !open;
    };
    navToggle.addEventListener("click", () => setMenuOpen(mobileNav.hidden));
    mobileNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setMenuOpen(false);
        document.querySelector("#main-content").focus();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileNav.hidden && navToggle.offsetWidth) {
        setMenuOpen(false);
        navToggle.focus();
      }
    });

    document.querySelector(".skip-link").addEventListener("click", (event) => {
      event.preventDefault();
      setMenuOpen(false);
      const main = document.querySelector("#main-content");
      main.focus({ preventScroll: true });
      main.scrollIntoView();
    });
  }

  function organizationLink(style) {
    return `<a class="button ${style}" href="${organizationUrl}" target="_blank" rel="noopener noreferrer">Abrir organigrama funcional ${icon("external")}<span class="sr-only"> (abre en otra pestaña)</span></a>`;
  }

  function homeTemplate() {
    const moduleLinks = data.modules.map((module) => `
      <li><a class="module-link" href="#${module.id}">
        <span class="module-icon ${module.tone}">${icon(icons[module.id])}</span>
        <div><h3>${module.title}</h3><p>${module.description}</p></div>
        ${icon("arrow")}
      </a></li>`).join("");

    return `<section class="page" aria-labelledby="home-title">
      <header class="hero-grid">
        <div class="hero-copy">
          <h1 id="home-title">Proyecto integrador Vigente</h1>
          <p>Emprendimiento, obligaciones tributarias, nómina y liquidación laboral de una empresa ficticia de software para inventarios.</p>
          <p class="hero-authors">${data.meta.authors.join(" · ")}</p>
        </div>
        <aside class="hero-resource" aria-label="Estructura organizacional">
          <p>Consulta las áreas, los cargos y las líneas de reporte de la estructura proyectada.</p>
          ${organizationLink("on-dark")}
        </aside>
      </header>

      <section class="home-section" aria-labelledby="modules-title">
        <h2 id="modules-title">Módulos del proyecto</h2>
        <ul class="module-list">${moduleLinks}</ul>
      </section>
      <section class="home-section" aria-labelledby="indicators-title">
        <h2 id="indicators-title">Indicadores del proyecto</h2>
        ${metricRow([
          { label: "Comercios con pérdidas recientes", value: "94,1 %", note: "Según el sondeo de mercado" },
          { label: "Nómina operativa", value: "5", note: "Trabajadores con resultados calculados" },
          { label: "Costo devengado", value: "$10.933", note: "Incluye obligaciones y provisiones" },
          { label: "Documentos de respaldo", value: data.documents.length, note: "Disponibles en los módulos" },
        ])}
      </section>
    </section>`;
  }

  function pageHeading(title, description, simulated = false) {
    return `<header class="page-heading">
      <div><h1>${title}</h1><p>${description}</p></div>
      <div class="heading-meta"><span class="tag">${data.meta.period}</span>${simulated ? '<span class="tag simulated">Simulación</span>' : ""}</div>
    </header>`;
  }

  function tabs(moduleId, labels = ["Resumen", "Resultados", "Documentos"]) {
    return `<div class="module-tabs no-print" role="tablist" aria-label="Secciones del módulo">
      ${labels.map((label, index) => `<button type="button" role="tab" id="${moduleId}-tab-${index}" aria-controls="${moduleId}-panel-${index}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-tab="${index}">${label}</button>`).join("")}
    </div>`;
  }

  function metricRow(items) {
    return `<section class="metric-row">${items.map((item) => `<div><span>${item.label}</span><strong>${item.value}</strong>${item.note ? `<small>${item.note}</small>` : ""}</div>`).join("")}</section>`;
  }

  function barChart(items, formatter = (item) => `${number.format(item.value)}${item.suffix || ""}`) {
    const max = Math.max(...items.map((item) => Number(item.value)));
    return `<div class="bar-chart">${items.map((item) => `<div class="bar-row"><label>${item.label}</label><div class="bar-track"><span style="width:${Math.max(3, (Number(item.value) / max) * 100)}%"></span></div><strong>${formatter(item)}</strong></div>`).join("")}</div>`;
  }

  function documentCards(moduleId) {
    const docs = data.documents.filter((document) => document.module === moduleId);
    if (!docs.length) return `<div class="panel"><h2>Documentos del caso</h2><p>Este módulo contiene vistas imprimibles dentro del propio dashboard. No se generó un expediente oficial.</p></div>`;
    return `<div class="documents-grid">${docs.map((document) => `<article class="document-item"><div>${icon("doc")}<h3>${document.title}</h3><p>${document.description}</p></div><footer><span>${document.pages} ${document.pages === 1 ? "página" : "páginas"}</span><button class="button secondary" type="button" data-document="${document.id}">Consultar ${icon("external")}</button></footer></article>`).join("")}</div>`;
  }

  function resourceLinks(title, resources) {
    return `<section class="module-intro official-resources">
      <h2>${title}</h2>
      <ul class="resource-list">
        ${resources.map(([name, description, url]) => `<li>
          <a class="resource-link" href="${url}" target="_blank" rel="noopener noreferrer">
            <strong>${name}</strong>${icon("external")}
            <span class="resource-description">${description}</span>
            <span class="sr-only"> (abre en otra pestaña)</span>
          </a>
        </li>`).join("")}
      </ul>
    </section>`;
  }

  function entrepreneurshipTemplate() {
    const business = data.entrepreneurship;
    const metrics = business.metrics.map((item) => ({ label: item.label, value: `${number.format(item.value)}${item.suffix}` }));
    return `<section class="page module-page" data-module="emprendimiento">
      ${pageHeading("Emprendimiento", "La idea de negocio, el modelo de servicio y la evidencia que sustenta la viabilidad de Vigente.")}
      ${tabs("emprendimiento")}
      <div id="emprendimiento-panel-0" class="tab-panel" role="tabpanel" aria-labelledby="emprendimiento-tab-0">
        ${metricRow(metrics)}
        <div class="content-grid">
          <article class="panel dark"><h2>Una alerta antes de que la pérdida ocurra</h2><p>${business.proposition}</p><div class="evidence-list"><div><strong>Problema</strong><span>${business.problem}</span></div><div><strong>Misión</strong><span>${business.mission}</span></div><div><strong>Visión</strong><span>${business.vision}</span></div></div></article>
          <article class="panel"><h2>Señales del mercado</h2><p>La muestra de 17 negocios confirma tanto el dolor operativo como la disposición a probar una solución accesible.</p>${barChart(business.metrics.slice(0, 3))}</article>
        </div>
      </div>
      <div id="emprendimiento-panel-1" class="tab-panel" role="tabpanel" aria-labelledby="emprendimiento-tab-1" hidden>
        ${metricRow(business.economics.map((item) => ({ label: item.label, value: `${item.prefix || ""}${number.format(item.value)}${item.suffix || ""}` })))}
        <div class="module-intro"><div><h2>Modelo de negocio</h2><p>Los nueve bloques conectan la necesidad del comercio con un servicio recurrente, una operación ligera y acompañamiento directo.</p></div></div>
        <div class="canvas-grid">${business.canvas.map(([name, copy]) => `<article class="canvas-item"><strong>${name}</strong><p>${copy}</p></article>`).join("")}</div>
      </div>
      <div id="emprendimiento-panel-2" class="tab-panel" role="tabpanel" aria-labelledby="emprendimiento-tab-2" hidden>
        <section class="panel">
          <h2>Registro de marca ante el SENADI</h2>
          <p>El taller simula la solicitud de Vigente como marca mixta de servicios, compuesta por el nombre y el logotipo. Propone la clase 42 de Niza para su plataforma SaaS de gestión de inventarios y documenta una búsqueda exploratoria de signos similares.</p>
        </section>
        ${resourceLinks("Trámite de registro de marca", [
          ["Guía de registro de marca", "Proceso de solicitud de signos distintivos.", "https://www.derechosintelectuales.gob.ec/como-registro-una-marca/"],
          ["SENADI en Línea", "Casillero virtual, solicitudes y consulta de trámites.", "https://www.derechosintelectuales.gob.ec/senadi-en-linea/"],
        ])}
        <div class="module-intro"><h2>Documentos de respaldo</h2></div>
        ${documentCards("emprendimiento")}
      </div>
    </section>`;
  }

  function taxTemplate() {
    const tax = data.tax;
    return `<section class="page module-page" data-module="tributarias">
      ${pageHeading("Obligaciones tributarias", "Identificación simulada de la empresa y lectura demostrativa del IVA para una operación mensual.", true)}
      ${tabs("tributarias", ["Identificación", "Caso de IVA", "Documentos"])}
      <div id="tributarias-panel-0" class="tab-panel" role="tabpanel" aria-labelledby="tributarias-tab-0">
        <div class="content-grid equal">
          <article class="panel dark"><h2>${tax.legalName}</h2><p>RUC simulado</p><div class="calc-total"><span>${tax.ruc}</span><strong>Activo</strong></div><div class="evidence-list"><div><strong>Domicilio</strong><span>${tax.location}</span></div><div><strong>Obligación ilustrada</strong><span>Declaración de IVA sobre servicios gravados.</span></div></div></article>
          <article class="panel"><h2>Actividades económicas</h2><p>Los códigos describen el alcance tecnológico proyectado para Vigente.</p><div class="evidence-list">${tax.ciiu.map(([code, copy]) => `<div><strong>${code}</strong><span>${copy}</span></div>`).join("")}</div></article>
        </div>
        ${resourceLinks("Servicios del SRI", [
          ["SRI en Línea", "Declaraciones, consultas y trámites tributarios.", "https://srienlinea.sri.gob.ec/sri-en-linea/"],
          ["Facturador SRI", "Emisión de facturas y otros comprobantes electrónicos.", "https://facturadorsri.sri.gob.ec/portal-facturadorsri-internet/pages/inicio.html"],
          ["Consulta de RUC", "Consulta pública por RUC o razón social.", "https://srienlinea.sri.gob.ec/facturacion-internet/consultas/publico/ruc-datos1.jspa"],
        ])}
      </div>
      <div id="tributarias-panel-1" class="tab-panel" role="tabpanel" aria-labelledby="tributarias-tab-1" hidden>
        ${metricRow([
          { label: "Ventas gravadas", value: money.format(700), note: "10 suscripciones anuales" },
          { label: "IVA generado", value: money.format(91), note: "Tarifa académica aplicada: 13 %" },
          { label: "Crédito tributario", value: money.format(16.9), note: "Compras con comprobante" },
          { label: "Saldo ilustrativo", value: money.format(74.1), note: "IVA ventas menos IVA compras" },
        ])}
        <div class="content-grid">
          <article class="panel"><h2>Compras del período</h2><p>Servicios operativos utilizados como ejemplo de crédito tributario.</p><div class="table-wrap"><table><thead><tr><th>Concepto</th><th class="num">Base</th><th class="num">IVA</th></tr></thead><tbody>${data.tax.vat.purchases.map(([name, base, vat]) => `<tr><td>${name}</td><td class="num">${money.format(base)}</td><td class="num">${money.format(vat)}</td></tr>`).join("")}</tbody></table></div></article>
          <article class="calculation"><h2>Conciliación mensual</h2><p>Ejercicio estático basado en las cifras proyectadas del plan de negocio.</p><div class="calc-row"><span>IVA generado<small>USD 700,00 × 13 %</small></span><strong>${money.format(91)}</strong></div><div class="calc-row"><span>(-) Crédito tributario<small>USD 130,00 × 13 %</small></span><strong>${money.format(16.9)}</strong></div><div class="calc-total"><span>Saldo ilustrativo</span><strong>${money.format(74.1)}</strong></div></article>
        </div>
        <div class="table-toolbar"><span></span><button class="button secondary" type="button" data-print>${icon("print")}Imprimir caso</button></div>
      </div>
      <div id="tributarias-panel-2" class="tab-panel" role="tabpanel" aria-labelledby="tributarias-tab-2" hidden><div class="panel"><h2>Respaldo del módulo</h2><p>La identificación simulada, las actividades CIIU y la política de precios proceden del plan de negocio. El caso de IVA fue creado únicamente para visualizar el flujo base imponible, impuesto generado y crédito tributario.</p><a class="button secondary" href="assets/docs/plan-negocio-vigente.pdf" target="_blank" rel="noreferrer">Consultar plan de negocio ${icon("external")}</a></div></div>
    </section>`;
  }

  function workerRows(workers) {
    return workers.map((worker) => `<tr><td class="person-cell"><strong>${worker.name}</strong><small>${worker.role}</small></td><td class="num">${money.format(worker.salary)}</td><td class="num">${money.format(worker.overtime + worker.extra + worker.bonus)}</td><td class="num">${money.format(worker.gross)}</td><td class="num">${money.format(worker.discounts)}</td><td class="num"><strong>${money.format(worker.net)}</strong></td><td class="num">${money.format(worker.cost)}</td></tr>`).join("");
  }

  function payrollTemplate() {
    const payroll = data.payroll;
    const org = payroll.targetOrganization;
    return `<section class="page module-page" data-module="remuneraciones">
      ${pageHeading("Remuneraciones y nómina", "Cinco trabajadores, sus novedades y el costo empresarial consolidado del período.")}
      ${tabs("remuneraciones", ["Resumen", "Trabajadores", "Organización y documentos"])}
      <div id="remuneraciones-panel-0" class="tab-panel" role="tabpanel" aria-labelledby="remuneraciones-tab-0">
        ${metricRow([
          { label: "Remuneración bruta", value: money.format(payroll.totals.gross), note: "Ingresos y beneficios pagados" },
          { label: "Descuentos", value: money.format(payroll.totals.discounts), note: "Aportes y anticipos" },
          { label: "Neto provisional", value: money.format(payroll.totals.net), note: "Cinco trabajadores" },
          { label: "Costo devengado", value: money.format(payroll.totals.accruedCost), note: "Incluye obligaciones y provisiones" },
        ])}
        <div class="content-grid">
          <article class="panel"><h2>Costo por trabajador</h2><p>El costo devengado incorpora salario, beneficios, obligaciones patronales y provisiones del período.</p>${barChart(payroll.workers.map((worker) => ({ label: worker.name, value: worker.cost })), (item) => money.format(item.value))}</article>
          <article class="panel blue"><h2>Cómo leer los totales</h2><div class="evidence-list"><div><strong>Desembolso</strong><span>${money.format(payroll.totals.disbursement)} efectivamente asociado a pagos y obligaciones del período.</span></div><div><strong>Obligaciones patronales</strong><span>${money.format(payroll.totals.employer)} financiados por la empresa.</span></div><div><strong>Provisiones</strong><span>${money.format(payroll.totals.provisions)} reconocidos para beneficios futuros.</span></div><div><strong>Alcance</strong><span>Se excluye el sexto registro del sistema original para mantener la dotación solicitada.</span></div></div></article>
        </div>
        ${resourceLinks("Servicios de seguridad social", [
          ["IESS para empleadores", "Avisos de entrada y salida, comprobantes y obligaciones patronales.", "https://www.iess.gob.ec/empleadores/"],
        ])}
      </div>
      <div id="remuneraciones-panel-1" class="tab-panel" role="tabpanel" aria-labelledby="remuneraciones-tab-1" hidden>
        <div class="table-toolbar"><label class="search-box">${icon("search")}<span class="sr-only">Buscar trabajador</span><input id="worker-search" type="search" placeholder="Buscar por nombre o cargo" autocomplete="off" /></label><button class="button secondary" type="button" data-print>${icon("print")}Imprimir nómina</button></div>
        <div class="table-wrap" tabindex="0" role="region" aria-label="Tabla de nómina"><table><thead><tr><th>Trabajador y cargo</th><th class="num">Sueldo</th><th class="num">Novedades</th><th class="num">Bruta</th><th class="num">Descuentos</th><th class="num">Neto</th><th class="num">Costo</th></tr></thead><tbody id="worker-body">${workerRows(payroll.workers)}</tbody></table></div>
        <p id="worker-empty" class="empty-state" role="status" hidden>No hay trabajadores que coincidan con la búsqueda.</p>
      </div>
      <div id="remuneraciones-panel-2" class="tab-panel" role="tabpanel" aria-labelledby="remuneraciones-tab-2" hidden>
        <section class="panel">
          <div class="section-heading">
            <div><h2>Estructura objetivo: 22 personas</h2><p>Dotación proyectada para una etapa futura de crecimiento. La nómina operativa del período incluye cinco trabajadores.</p></div>
            ${organizationLink("primary")}
          </div>
          <dl class="org-chart">${org.map(([area, count, roles]) => `<div class="org-unit"><dt>${area}</dt><dd><strong>${count}</strong><small>${roles}</small></dd></div>`).join("")}</dl>
        </section>
        <div class="module-intro"><div><h2>Documentos de respaldo</h2><p>La estructura y las escalas muestran el modelo empresarial completo; la tabla de nómina conserva resultados de la aplicación existente.</p></div></div>
        ${documentCards("remuneraciones")}
      </div>
    </section>`;
  }

  function liquidationTemplate() {
    const liquidation = data.liquidation;
    return `<section class="page module-page" data-module="liquidacion">
      ${pageHeading("Liquidación laboral", "Un caso académico de despido intempestivo, sus rubros y el control documental de salida.", true)}
      ${tabs("liquidacion", ["Formas de terminación", "Caso y paz y salvo", "Evidencias"])}
      <div id="liquidacion-panel-0" class="tab-panel" role="tabpanel" aria-labelledby="liquidacion-tab-0">
        <div class="content-grid equal">${liquidation.terminationTypes.map(([name, copy]) => `<article class="panel"><h2>${name}</h2><p>${copy}</p></article>`).join("")}</div>
      </div>
      <div id="liquidacion-panel-1" class="tab-panel" role="tabpanel" aria-labelledby="liquidacion-tab-1" hidden>
        <div class="content-grid">
          <article class="calculation"><h2>Despido intempestivo simulado</h2><p>Mateo Salazar · sueldo fijo USD 1.300,00 · ingreso 1 de mayo de 2026 · salida 31 de octubre de 2026.</p>${liquidation.rows.map(([name, formula, value]) => `<div class="calc-row"><span>${name}<small>${formula}</small></span><strong>${money.format(value)}</strong></div>`).join("")}<div class="calc-total"><span>Total ilustrativo</span><strong>${money.format(liquidation.total)}</strong></div></article>
          <article class="panel"><h2>Paz y salvo interno</h2><p>Control de activos, accesos y evidencias. No constituye renuncia de derechos ni reemplaza el acta de finiquito.</p><div class="checklist">${liquidation.checklist.map(([name, state, note]) => `<div class="check-row"><span class="check-icon ${state === "Pendiente" ? "pending" : ""}">${state === "Pendiente" ? icon("info") : icon("check")}</span><div><strong>${name}</strong><small>${note}</small></div><span class="tag ${state === "Pendiente" ? "pending" : "complete"}">${state}</span></div>`).join("")}</div></article>
        </div>
        <div class="table-toolbar"><a class="button primary" href="https://adrianr0112.github.io/Paz-y-Salvo/" target="_blank" rel="noopener noreferrer">Abrir paz y salvo ${icon("external")}<span class="sr-only"> (abre en otra pestaña)</span></a><button class="button secondary" type="button" data-print>${icon("print")}Imprimir caso</button></div>
      </div>
      <div id="liquidacion-panel-2" class="tab-panel" role="tabpanel" aria-labelledby="liquidacion-tab-2" hidden>
        ${documentCards("liquidacion")}
        <div class="panel" style="margin-top:14px"><h2>Cierre documental</h2><p>El acta debe registrarse mediante el SUT y acompañarse del comprobante de pago. La matriz comparativa aporta criterios sobre jornada, vacaciones, seguridad social e irrenunciabilidad de derechos.</p></div>
        ${resourceLinks("Servicios del Ministerio del Trabajo", [
          ["Sistema Único de Trabajo (SUT)", "Portal para trámites laborales y registro de actas de finiquito.", "https://sut.trabajo.gob.ec/"],
          ["Calculadora de liquidaciones", "Acceso directo a la herramienta oficial de liquidación laboral.", "https://calculadoras.trabajo.gob.ec/liquidaciones"],
        ])}
      </div>
    </section>`;
  }

  function routeName() {
    const route = location.hash.replace(/^#/, "").split("/")[0];
    return ["emprendimiento", "tributarias", "remuneraciones", "liquidacion"].includes(route) ? route : "inicio";
  }

  function render() {
    const route = routeName();
    const templates = { inicio: homeTemplate, emprendimiento: entrepreneurshipTemplate, tributarias: taxTemplate, remuneraciones: payrollTemplate, liquidacion: liquidationTemplate };
    app.innerHTML = templates[route]();
    document.querySelectorAll("[data-route]").forEach((link) => {
      if (link.dataset.route === route) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    document.title = route === "inicio" ? "Vigente | Dashboard integrador" : `${data.modules.find((module) => module.id === route)?.title || "Vigente"} | Vigente`;
    bindTabs();
    bindDocuments();
    bindActions();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function bindTabs() {
    document.querySelectorAll(".module-tabs").forEach((tabList) => {
      const buttons = [...tabList.querySelectorAll('[role="tab"]')];
      const activate = (button) => {
        buttons.forEach((candidate) => {
          const selected = candidate === button;
          candidate.setAttribute("aria-selected", String(selected));
          candidate.tabIndex = selected ? 0 : -1;
          document.getElementById(candidate.getAttribute("aria-controls")).hidden = !selected;
        });
      };
      buttons.forEach((button, index) => {
        button.addEventListener("click", () => activate(button));
        button.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
          activate(buttons[nextIndex]);
          buttons[nextIndex].focus();
        });
      });
    });
  }

  function bindDocuments() {
    document.querySelectorAll("[data-document]").forEach((button) => button.addEventListener("click", () => openDocument(button.dataset.document)));
  }

  function openDocument(documentId) {
    const documentData = data.documents.find((document) => document.id === documentId);
    if (!documentData) return;
    document.querySelector("#document-title").textContent = documentData.title;
    document.querySelector("#document-description").textContent = documentData.description;
    document.querySelector("#document-open").href = documentData.file;
    frame.src = documentData.file;
    dialog.showModal();
  }

  function closeDocument() {
    dialog.close();
    frame.src = "about:blank";
  }

  function bindActions() {
    document.querySelectorAll("[data-print]").forEach((button) => button.addEventListener("click", () => window.print()));
    const search = document.querySelector("#worker-search");
    if (search) search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase("es");
      const matches = data.payroll.workers.filter((worker) => `${worker.name} ${worker.role}`.toLocaleLowerCase("es").includes(query));
      document.querySelector("#worker-body").innerHTML = workerRows(matches);
      document.querySelector("#worker-empty").hidden = matches.length > 0;
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", closeDocument));
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDocument(); });
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDocument(); });
  window.addEventListener("hashchange", render);
  window.addEventListener("error", () => showToast("Ocurrió un error al cargar la vista."));

  setupHeader();
  render();
})();
