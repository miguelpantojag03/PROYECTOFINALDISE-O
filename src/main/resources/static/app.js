const state = {
  token: localStorage.getItem("motofixToken") || "",
  user: null,
  view: "dashboard",
  query: "",
  cache: { users: [], motorcycles: [], orders: [], services: [], parts: [], payments: [], reports: {} }
};

const views = [
  ["dashboard", "DB", "Dashboard"],
  ["users", "US", "Usuarios"],
  ["motorcycles", "MT", "Motocicletas"],
  ["orders", "OR", "Ordenes"],
  ["services", "SV", "Servicios"],
  ["inventory", "IN", "Inventario"],
  ["payments", "PG", "Pagos"],
  ["notifications", "NT", "Notificaciones"],
  ["reports", "RP", "Reportes"]
];

const $ = (id) => document.getElementById(id);
const money = (v) => Number(v || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.remove("hidden");
  setTimeout(() => $("toast").classList.add("hidden"), 2600);
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch (_) {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function setStatus(text) {
  $("statusText").textContent = text;
}

function viewCount(id) {
  const c = state.cache;
  return {
    dashboard: c.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).length,
    users: c.users.length,
    motorcycles: c.motorcycles.length,
    orders: c.orders.length,
    services: c.services.length,
    inventory: c.parts.length,
    payments: c.payments.length,
    notifications: "",
    reports: ""
  }[id] ?? "";
}

function renderNav() {
  $("nav").innerHTML = views.map(([id, icon, label]) =>
    `<button type="button" class="${state.view === id ? "active" : ""}" data-view="${id}"><span class="navIcon">${icon}</span><span>${label}</span>${viewCount(id) !== "" ? `<b class="navCount">${viewCount(id)}</b>` : ""}</button>`
  ).join("");
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });
}

function showApp(logged) {
  $("loginView").classList.toggle("hidden", logged);
  $("appView").classList.toggle("hidden", !logged);
  $("refreshBtn").classList.toggle("hidden", !logged);
  $("searchInput").parentElement.classList.toggle("hidden", !logged);
  $("sessionName").textContent = logged && state.user ? `${state.user.name} - ${state.user.role}` : "Sin sesion";
}

async function login(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
    });
    state.token = result.token;
    localStorage.setItem("motofixToken", state.token);
    await bootstrap();
    toast("Sesion iniciada");
  } catch (error) {
    toast(error.message);
  }
}

async function bootstrap() {
  if (!state.token) {
    showApp(false);
    renderNav();
    return;
  }
  try {
    state.user = await api("/api/auth/me");
    showApp(true);
    await loadAll();
    render();
  } catch (error) {
    localStorage.removeItem("motofixToken");
    state.token = "";
    showApp(false);
    toast("Inicia sesion nuevamente");
  }
}

async function loadAll() {
  setStatus("Cargando...");
  const [users, motorcycles, orders, services, parts, payments] = await Promise.all([
    api("/api/users"),
    api("/api/motorcycles"),
    api("/api/service-orders"),
    api("/api/maintenance-services"),
    api("/api/spare-parts"),
    api("/api/payments")
  ]);
  state.cache = { ...state.cache, users, motorcycles, orders, services, parts, payments };
  setStatus("Actualizado");
}

function renderMetrics() {
  const c = state.cache;
  const open = c.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).length;
  const pendingPayments = c.payments.filter(p => p.status !== "CONFIRMED").length;
  $("metrics").innerHTML = [
    ["Ordenes abiertas", open, "En proceso", "#08766f"],
    ["Clientes", c.users.filter(u => u.role === "ROLE_CUSTOMER").length, "Registrados", "#2563eb"],
    ["Motos", c.motorcycles.length, "En historial", "#b45309"],
    ["Stock total", c.parts.reduce((sum, p) => sum + Number(p.stock || 0), 0), `${pendingPayments} pagos pendientes`, "#15803d"]
  ].map(([label, value, note, color]) => `<div class="metric" style="--metric-color:${color}"><strong>${value}</strong><span>${label}</span><small>${note}</small></div>`).join("");
}

function statusPill(value) {
  const status = String(value || "");
  let tone = "";
  if (["PENDING", "DIAGNOSIS", "IN_PROGRESS", "WAITING_FOR_PARTS"].includes(status)) tone = "pending";
  if (["CONFIRMED", "AVAILABLE"].includes(status)) tone = "active";
  if (["FINISHED"].includes(status)) tone = "done";
  if (["CANCELLED", "REJECTED"].includes(status)) tone = "cancelled";
  return `<span class="pill ${tone}">${status}</span>`;
}

function table(columns, rows) {
  const filtered = filterRows(rows);
  if (!filtered.length) return `<div class="empty">${state.query ? "No hay coincidencias para la busqueda." : "No hay registros todavia."}</div>`;
  return `<div class="tableWrap"><table><thead><tr>${columns.map(c => `<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${
    filtered.map(row => `<tr>${columns.map(c => `<td>${c[1](row)}</td>`).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}

function filterRows(rows) {
  const query = state.query.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter(row => JSON.stringify(row).toLowerCase().includes(query));
}

function entity(primary, secondary) {
  return `<div class="entityTitle"><strong>${primary || "-"}</strong><span>${secondary || ""}</span></div>`;
}

function optionList(rows, labelFn, empty = "Sin datos") {
  if (!rows.length) return `<option value="">${empty}</option>`;
  return rows.map(row => `<option value="${row.id}">${labelFn(row)}</option>`).join("");
}

function formSelect(name, label, optionsHtml) {
  return `<label>${label}<select name="${name}">${optionsHtml}</select></label>`;
}

function viewToolbar(items) {
  return `<div class="toolbar"><div class="toolbarGroup">${items.map(item => `<span class="chip">${item}</span>`).join("")}</div></div>`;
}

function emptyToNull(value) {
  return value === "" ? null : value;
}

function toPayload(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach((key) => {
    data[key] = emptyToNull(data[key]);
    if (["id", "customerId", "motorcycleId", "orderId", "userId", "year", "mileage", "estimatedTime", "initialStock", "checklistItems", "partId", "quantity"].includes(key) && data[key] !== null) data[key] = Number(data[key]);
    if (["basePrice", "unitPrice", "oilQuantity", "filterCost", "padsCost", "laborCost"].includes(key) && data[key] !== null) data[key] = Number(data[key]);
  });
  return data;
}

async function refresh(message = "Actualizado") {
  await loadAll();
  render();
  toast(message);
}

function form(title, fields, submitText, onsubmit) {
  $("actionPanel").innerHTML = `<form id="sideForm" class="formGrid"><h2>${title}</h2>${fields.join("")}<button type="submit">${submitText}</button></form>`;
  $("sideForm").addEventListener("submit", onsubmit);
}

const input = (name, label, type = "text", value = "", extra = "") =>
  `<label>${label}<input name="${name}" type="${type}" value="${value}" ${extra}></label>`;
const select = (name, label, options) =>
  `<label>${label}<select name="${name}">${options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join("")}</select></label>`;
const area = (name, label) => `<label>${label}<textarea name="${name}"></textarea></label>`;

function render() {
  renderNav();
  renderMetrics();
  const label = views.find(v => v[0] === state.view)?.[2] || "Dashboard";
  const subtitles = {
    dashboard: "Resumen operativo del taller y ordenes recientes.",
    users: "Clientes, mecanicos y administradores del sistema.",
    motorcycles: "Historial de motocicletas asociadas a clientes.",
    orders: "Recepcion, diagnostico, asignacion, servicios y cierre de ordenes.",
    services: "Catalogo polimorfico de servicios de mantenimiento.",
    inventory: "Repuestos, stock interno y consulta de proveedor.",
    payments: "Registro y confirmacion de pagos por orden.",
    notifications: "Envio y consulta de comunicaciones por usuario.",
    reports: "Agregados de ordenes, pagos, inventario y servicios."
  };
  $("viewTitle").textContent = label;
  $("panelTitle").textContent = label;
  $("viewSubtitle").textContent = subtitles[state.view] || "Interfaz operativa alineada con los modulos del backend MotoFix.";
  const renderers = { dashboard, users, motorcycles, orders, services, inventory, payments, notifications, reports };
  renderers[state.view]();
}

function dashboard() {
  const latest = [...state.cache.orders].reverse().slice(0, 6);
  const activeOrders = state.cache.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).length;
  const lowStock = state.cache.parts.filter(p => Number(p.stock || 0) <= 3).length;
  const revenue = state.cache.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const lowParts = state.cache.parts.filter(p => Number(p.stock || 0) <= 3).slice(0, 4);
  const waitingOrders = state.cache.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).slice(0, 4);
  $("dataView").innerHTML = `
    <div class="dashboardGrid">
      <div class="dashCard"><strong>${activeOrders}</strong><span>Ordenes que requieren seguimiento</span></div>
      <div class="dashCard"><strong>${lowStock}</strong><span>Repuestos con stock bajo</span></div>
      <div class="dashCard"><strong>${money(revenue)}</strong><span>Pagos registrados</span></div>
    </div>
    ${table([
    ["ID", o => o.id],
    ["Cliente", o => o.customerName],
    ["Moto", o => o.motorcycle],
    ["Estado", o => statusPill(o.status)],
    ["Total", o => money(o.total)]
  ], latest)}`;
  $("actionPanel").innerHTML = `
    <h2>Proceso principal</h2>
    <div class="flow"><span>Registrar cliente</span><span>Crear moto</span><span>Abrir orden</span><span>Asignar tecnico</span><span>Agregar servicio</span><span>Confirmar pago</span></div>
    <hr>
    <h2>Ordenes activas</h2>
    <div class="miniList">${waitingOrders.length ? waitingOrders.map(o => `<div class="miniItem"><strong>#${o.id} ${o.customerName || ""}</strong>${statusPill(o.status)}</div>`).join("") : `<div class="empty">Sin ordenes activas.</div>`}</div>
    <hr>
    <h2>Stock bajo</h2>
    <div class="miniList">${lowParts.length ? lowParts.map(p => `<div class="miniItem"><strong>${p.name}</strong><span>${p.stock || 0} und.</span></div>`).join("") : `<div class="empty">Stock saludable.</div>`}</div>`;
}

function users() {
  const mechanics = state.cache.users.filter(u => u.role === "ROLE_MECHANIC").length;
  const customers = state.cache.users.filter(u => u.role === "ROLE_CUSTOMER").length;
  $("dataView").innerHTML = `${viewToolbar([`${customers} clientes`, `${mechanics} mecanicos`, `${state.cache.users.length} usuarios`])}${table([
    ["ID", u => u.id],
    ["Usuario", u => entity(u.name, u.email)],
    ["Email", u => u.email],
    ["Rol", u => statusPill(u.role)],
    ["Tipo", u => u.userType || ""],
    ["Acciones", u => `<div class="actions">
      <button data-user-edit="${u.id}">Editar</button>
      <button class="secondary" data-user-role="${u.id}">Rol</button>
      <button class="danger" data-user-delete="${u.id}">Eliminar</button>
    </div>`]
  ], state.cache.users)}`;
  $("actionPanel").innerHTML = `
    <form id="userCreateForm" class="formGrid">
      <h2>Nuevo usuario</h2>
      ${input("name", "Nombre", "text", "", "required")}
      ${input("email", "Email", "email", "", "required")}
      ${input("password", "Clave", "password", "User12345", "required")}
      ${select("role", "Rol", [["ROLE_CUSTOMER", "Cliente"], ["ROLE_MECHANIC", "Mecanico"], ["ROLE_ADMINISTRATOR", "Administrador"]])}
      ${input("phone", "Telefono")}
      ${input("address", "Direccion")}
      ${input("specialty", "Especialidad")}
      <button type="submit">Registrar</button>
    </form>
    <hr>
    <form id="userEditForm" class="formGrid">
      <h2>Editar usuario</h2>
      ${formSelect("id", "Usuario", optionList(state.cache.users, u => `${u.name} - #${u.id}`))}
      ${input("name", "Nombre")}
      ${input("email", "Email", "email")}
      ${input("phone", "Telefono")}
      ${input("address", "Direccion")}
      ${input("specialty", "Especialidad")}
      ${select("role", "Nuevo rol", [["ROLE_CUSTOMER", "Cliente"], ["ROLE_MECHANIC", "Mecanico"], ["ROLE_ADMINISTRATOR", "Administrador"]])}
      <div class="actions">
        <button type="submit">Guardar</button>
        <button type="button" class="secondary" id="assignRoleBtn">Asignar rol</button>
      </div>
    </form>`;
  $("userCreateForm").addEventListener("submit", async (e) => submitJson(e, "/api/auth/register", "POST"));
  $("userEditForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = toPayload(e.currentTarget);
    const id = data.id;
    delete data.id;
    delete data.role;
    Object.keys(data).forEach(key => data[key] === null && delete data[key]);
    await api(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
    await refresh("Usuario actualizado");
  });
  $("assignRoleBtn").addEventListener("click", async () => {
    const data = toPayload($("userEditForm"));
    await api(`/api/users/${data.id}/role?role=${data.role}`, { method: "PATCH" });
    await refresh("Rol actualizado");
  });
  bindUserActions();
}

function motorcycles() {
  $("dataView").innerHTML = `${viewToolbar([`${state.cache.motorcycles.length} motos`, `${state.cache.users.filter(u => u.role === "ROLE_CUSTOMER").length} clientes disponibles`])}${table([
    ["ID", m => m.id],
    ["Moto", m => entity(`${m.brand} ${m.model}`, m.vin || "Sin VIN")],
    ["Placa", m => m.plate || ""],
    ["Ano", m => m.year || ""],
    ["Km", m => m.mileage || 0],
    ["Cliente", m => m.customerName || m.customerId],
    ["Acciones", m => `<div class="actions">
      <button data-moto-mileage="${m.id}">Km</button>
      <button class="danger" data-moto-delete="${m.id}">Eliminar</button>
    </div>`]
  ], state.cache.motorcycles)}`;
  $("actionPanel").innerHTML = `
    <form id="motoForm" class="formGrid">
      <h2>Nueva motocicleta</h2>
      ${input("brand", "Marca", "text", "", "required")}
      ${input("model", "Modelo", "text", "", "required")}
      ${input("year", "Ano", "number", new Date().getFullYear())}
      ${input("mileage", "Kilometraje", "number", "0")}
      ${input("plate", "Placa")}
      ${input("vin", "VIN")}
      ${formSelect("customerId", "Cliente", optionList(state.cache.users.filter(u => u.role === "ROLE_CUSTOMER"), u => `${u.name} - #${u.id}`))}
      <button type="submit">Crear moto</button>
    </form>
    <hr>
    <form id="mileageForm" class="formGrid">
      <h2>Actualizar kilometraje</h2>
      ${formSelect("id", "Motocicleta", optionList(state.cache.motorcycles, m => `${m.brand} ${m.model} ${m.plate || ""} - #${m.id}`))}
      ${input("mileage", "Nuevo kilometraje", "number", "0", "required")}
      <button type="submit">Actualizar km</button>
    </form>`;
  $("motoForm").addEventListener("submit", async (e) => submitJson(e, "/api/motorcycles", "POST"));
  $("mileageForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = toPayload(e.currentTarget);
    await api(`/api/motorcycles/${data.id}/mileage?mileage=${data.mileage}`, { method: "PATCH" });
    await refresh("Kilometraje actualizado");
  });
  bindMotorcycleActions();
}

function orders() {
  const open = state.cache.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).length;
  const finished = state.cache.orders.filter(o => o.status === "FINISHED").length;
  $("dataView").innerHTML = `${viewToolbar([`${open} abiertas`, `${finished} finalizadas`, `${money(state.cache.orders.reduce((s, o) => s + Number(o.total || 0), 0))} en ordenes`])}${table([
    ["ID", o => o.id],
    ["Cliente", o => entity(o.customerName, `#${o.customerId}`)],
    ["Moto", o => entity(o.motorcycle, `Moto #${o.motorcycleId}`)],
    ["Mecanico", o => o.mechanicName || "Sin asignar"],
    ["Estado", o => statusPill(o.status)],
    ["Total", o => money(o.total)],
    ["Acciones", o => `<div class="actions">
      <button data-action="total" data-id="${o.id}">Total</button>
      <button data-action="progress" data-id="${o.id}">En progreso</button>
      <button data-action="parts" data-id="${o.id}">Esperando</button>
      <button data-action="finish" data-id="${o.id}">Finalizar</button>
      <button class="secondary" data-action="cancel" data-id="${o.id}">Cancelar</button>
    </div>`]
  ], state.cache.orders)}`;
  bindOrderActions();
  $("actionPanel").innerHTML = `
    <form id="createOrderForm" class="formGrid">
      <h2>Nueva orden</h2>
      ${formSelect("customerId", "Cliente", optionList(state.cache.users.filter(u => u.role === "ROLE_CUSTOMER"), u => `${u.name} - #${u.id}`))}
      ${formSelect("motorcycleId", "Motocicleta", optionList(state.cache.motorcycles, m => `${m.brand} ${m.model} ${m.plate || ""} - #${m.id}`))}
      ${area("diagnostic", "Diagnostico inicial")}
      <button type="submit">Crear orden</button>
    </form>
    <hr>
    <form id="orderToolsForm" class="formGrid">
      <h2>Trabajo de orden</h2>
      ${formSelect("orderId", "Orden", optionList(state.cache.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)), o => `#${o.id} - ${o.customerName} / ${o.status}`))}
      ${formSelect("mechanicId", "Mecanico", optionList(state.cache.users.filter(u => u.role === "ROLE_MECHANIC"), u => `${u.name} - #${u.id}`, "Crea un mecanico primero"))}
      ${formSelect("serviceId", "Servicio", optionList(state.cache.services, s => `${s.name} - #${s.id}`))}
      ${formSelect("sparePartId", "Repuesto", optionList(state.cache.parts, p => `${p.name} (${p.stock || 0}) - #${p.id}`))}
      ${area("diagnostic", "Diagnostico")}
      <div class="actions">
        <button type="button" data-tool="mechanic">Asignar</button>
        <button type="button" data-tool="diagnostic">Diagnostico</button>
        <button type="button" data-tool="service">Servicio</button>
        <button type="button" data-tool="part">Repuesto</button>
      </div>
    </form>`;
  $("createOrderForm").addEventListener("submit", async (e) => submitJson(e, "/api/service-orders", "POST"));
  bindOrderToolActions();
}

function services() {
  $("dataView").innerHTML = `${viewToolbar([`${state.cache.services.length} servicios`, `${money(state.cache.services.reduce((s, item) => s + Number(item.calculatedCost || 0), 0))} costo catalogo`])}${table([
    ["ID", s => s.id],
    ["Servicio", s => entity(s.name, s.description)],
    ["Tipo", s => statusPill(s.type)],
    ["Base", s => money(s.basePrice)],
    ["Calculado", s => money(s.calculatedCost)],
    ["Tiempo", s => `${s.estimatedTime || 0} min`],
    ["Acciones", s => `<div class="actions">
      <button data-service-edit="${s.id}">Editar</button>
      <button class="danger" data-service-delete="${s.id}">Eliminar</button>
    </div>`]
  ], state.cache.services)}`;
  const serviceFields = `
    ${input("name", "Nombre", "text", "", "required")}
    ${input("basePrice", "Precio base", "number", "0", "required step='0.01'")}
    ${input("estimatedTime", "Tiempo estimado", "number", "60")}
    ${select("type", "Tipo", [["OIL_CHANGE", "Cambio de aceite"], ["BRAKE_REPAIR", "Reparacion de frenos"], ["GENERAL_INSPECTION", "Inspeccion general"]])}
    ${input("oilType", "Tipo de aceite")}
    ${input("oilQuantity", "Cantidad aceite", "number", "0", "step='0.01'")}
    ${input("filterCost", "Costo filtro", "number", "0", "step='0.01'")}
    ${input("brakeType", "Tipo de freno")}
    ${input("padsCost", "Costo pastillas", "number", "0", "step='0.01'")}
    ${input("laborCost", "Mano de obra", "number", "0", "step='0.01'")}
    ${input("inspectionLevel", "Nivel inspeccion")}
    ${input("checklistItems", "Items checklist", "number", "0")}`;
  $("actionPanel").innerHTML = `
    <form id="serviceCreateForm" class="formGrid"><h2>Nuevo servicio</h2>${serviceFields}<button type="submit">Crear servicio</button></form>
    <hr>
    <form id="serviceEditForm" class="formGrid">
      <h2>Editar servicio</h2>
      ${formSelect("id", "Servicio", optionList(state.cache.services, s => `${s.name} - #${s.id}`))}
      ${serviceFields}
      <button type="submit">Guardar cambios</button>
    </form>`;
  $("serviceCreateForm").addEventListener("submit", async (e) => submitJson(e, "/api/maintenance-services", "POST"));
  $("serviceEditForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = toPayload(e.currentTarget);
    const id = data.id;
    delete data.id;
    await api(`/api/maintenance-services/${id}`, { method: "PUT", body: JSON.stringify(data) });
    await refresh("Servicio actualizado");
  });
  bindServiceActions();
}

function inventory() {
  const low = state.cache.parts.filter(p => Number(p.stock || 0) <= 3).length;
  $("dataView").innerHTML = `${viewToolbar([`${state.cache.parts.length} repuestos`, `${low} stock bajo`, `${state.cache.parts.reduce((s, p) => s + Number(p.stock || 0), 0)} unidades`])}${table([
    ["ID", p => p.id],
    ["Repuesto", p => entity(p.name, p.sku || "Sin SKU")],
    ["Marca", p => p.brand || ""],
    ["SKU", p => p.sku || ""],
    ["Precio", p => money(p.unitPrice)],
    ["Stock", p => `<span class="pill ${Number(p.stock || 0) <= 3 ? "cancelled" : "active"}">${p.stock || 0}</span>`],
    ["Acciones", p => `<div class="actions">
      <button data-part-provider="${p.sku || ""}">Proveedor</button>
      <button data-part-edit="${p.id}">Editar</button>
      <button class="danger" data-part-delete="${p.id}">Eliminar</button>
    </div>`]
  ], state.cache.parts)}`;
  $("actionPanel").innerHTML = `
    <form id="partForm" class="formGrid">
      <h2>Nuevo repuesto</h2>
      ${input("name", "Nombre", "text", "", "required")}
      ${input("brand", "Marca")}
      ${input("sku", "SKU")}
      ${input("unitPrice", "Precio", "number", "0", "required step='0.01'")}
      ${input("initialStock", "Stock inicial", "number", "0", "required")}
      <button type="submit">Guardar repuesto</button>
    </form>
    <hr>
    <form id="partEditForm" class="formGrid">
      <h2>Editar repuesto</h2>
      ${formSelect("id", "Repuesto", optionList(state.cache.parts, p => `${p.name} - #${p.id}`))}
      ${input("name", "Nombre", "text", "", "required")}
      ${input("brand", "Marca")}
      ${input("sku", "SKU")}
      ${input("unitPrice", "Precio", "number", "0", "required step='0.01'")}
      ${input("initialStock", "Stock", "number", "0", "required")}
      <button type="submit">Guardar cambios</button>
    </form>
    <hr>
    <form id="stockForm" class="formGrid">
      <h2>Stock</h2>
      ${formSelect("partId", "Repuesto", optionList(state.cache.parts, p => `${p.name} - #${p.id}`))}
      ${input("quantity", "Cantidad", "number", "1", "required")}
      ${input("sku", "SKU proveedor")}
      <div class="actions">
        <button type="button" data-stock="increase">Aumentar</button>
        <button type="button" class="secondary" data-stock="decrease">Disminuir</button>
        <button type="button" data-stock="provider">Proveedor</button>
      </div>
    </form>`;
  $("partForm").addEventListener("submit", async (e) => submitJson(e, "/api/spare-parts", "POST"));
  $("partEditForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = toPayload(e.currentTarget);
    const id = data.id;
    delete data.id;
    await api(`/api/spare-parts/${id}`, { method: "PUT", body: JSON.stringify(data) });
    await refresh("Repuesto actualizado");
  });
  bindStockActions();
  bindPartActions();
}

function payments() {
  const confirmed = state.cache.payments.filter(p => p.status === "CONFIRMED").length;
  $("dataView").innerHTML = `${viewToolbar([`${confirmed} confirmados`, `${state.cache.payments.length - confirmed} pendientes`, `${money(state.cache.payments.reduce((s, p) => s + Number(p.amount || 0), 0))} total`])}${table([
    ["ID", p => p.id],
    ["Orden", p => p.orderId],
    ["Monto", p => money(p.amount)],
    ["Tipo", p => p.type],
    ["Estado", p => statusPill(p.status)],
    ["Acciones", p => `<div class="actions"><button data-pay="${p.id}">Confirmar</button></div>`]
  ], state.cache.payments)}`;
  document.querySelectorAll("[data-pay]").forEach(btn => btn.addEventListener("click", async () => {
    await api(`/api/payments/${btn.dataset.pay}/confirm`, { method: "PATCH" });
    await loadAll(); render(); toast("Pago confirmado");
  }));
  form("Registrar pago", [
    formSelect("orderId", "Orden", optionList(state.cache.orders, o => `#${o.id} - ${o.customerName} - ${money(o.total)}`)),
    select("type", "Tipo", [["CASH", "Efectivo"], ["CARD", "Tarjeta"], ["TRANSFER", "Transferencia"]])
  ], "Registrar", async (e) => submitJson(e, "/api/payments", "POST"));
}

function notifications() {
  $("dataView").innerHTML = `<div id="notificationResults" class="empty">Busca notificaciones por usuario desde el panel lateral.</div>`;
  form("Enviar notificacion", [
    formSelect("userId", "Usuario", optionList(state.cache.users, u => `${u.name} - #${u.id}`)),
    select("channel", "Canal", [["EMAIL", "Email"], ["SMS", "SMS"], ["PUSH", "Push"]]),
    area("message", "Mensaje"),
    formSelect("lookupUserId", "Buscar por usuario", optionList(state.cache.users, u => `${u.name} - #${u.id}`))
  ], "Enviar", async (e) => submitJson(e, "/api/notifications", "POST"));
  const lookup = document.createElement("button");
  lookup.type = "button";
  lookup.textContent = "Buscar notificaciones";
  lookup.addEventListener("click", async () => {
    const id = new FormData($("sideForm")).get("lookupUserId");
    const rows = await api(`/api/notifications/user/${id}`);
    $("notificationResults").innerHTML = table([
      ["ID", n => n.id],
      ["Mensaje", n => n.message],
      ["Canal", n => n.channel],
      ["Leida", n => n.readFlag ? statusPill("CONFIRMED") : statusPill("PENDING")],
      ["Fecha", n => n.sentAt || ""],
      ["Acciones", n => `<div class="actions"><button data-notification-read="${n.id}">Marcar leida</button></div>`]
    ], rows);
    bindNotificationActions();
  });
  $("sideForm").appendChild(lookup);
}

async function reports() {
  const reports = await Promise.all([
    api("/api/reports/orders"),
    api("/api/reports/payments"),
    api("/api/reports/inventory"),
    api("/api/reports/services")
  ]);
  const names = ["Ordenes", "Pagos", "Inventario", "Servicios"];
  $("dataView").innerHTML = reports.map((rows, index) => `<h2>${names[index]}</h2>${table([
    ["Categoria", r => r.label || r.name || r.category || Object.values(r)[0]],
    ["Cantidad", r => r.count || Object.values(r)[1] || 0],
    ["Valor", r => money(r.amount || Object.values(r)[2] || 0)]
  ], rows)}`).join("");
  $("actionPanel").innerHTML = `<h2>Reportes</h2><p>Datos agregados desde los servicios del backend.</p>`;
}

async function submitJson(event, path, method) {
  event.preventDefault();
  const data = toPayload(event.currentTarget);
  if (data.requiresReplacement === undefined && path.includes("maintenance-services")) data.requiresReplacement = false;
  await api(path, { method, body: JSON.stringify(data) });
  await loadAll();
  render();
  toast("Guardado");
}

function bindOrderActions() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      if (button.dataset.action === "total") {
        const result = await api(`/api/service-orders/${id}/total`);
        toast(`Total orden #${id}: ${money(result.total)}`);
        return;
      }
      if (button.dataset.action === "progress") {
        await api(`/api/service-orders/${id}/status?status=IN_PROGRESS`, { method: "PATCH" });
      } else if (button.dataset.action === "parts") {
        await api(`/api/service-orders/${id}/status?status=WAITING_FOR_PARTS`, { method: "PATCH" });
      } else {
        await api(`/api/service-orders/${id}/${button.dataset.action}`, { method: "PATCH" });
      }
      await refresh("Orden actualizada");
    });
  });
}

function bindOrderToolActions() {
  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", async () => {
      const data = Object.fromEntries(new FormData($("orderToolsForm")).entries());
      const orderId = Number(data.orderId);
      if (button.dataset.tool === "mechanic") {
        await api(`/api/service-orders/${orderId}/mechanic/${Number(data.mechanicId)}`, { method: "PATCH" });
      }
      if (button.dataset.tool === "diagnostic") {
        await api(`/api/service-orders/${orderId}/diagnostic`, { method: "PATCH", body: JSON.stringify({ diagnostic: data.diagnostic }) });
      }
      if (button.dataset.tool === "service") {
        await api(`/api/service-orders/${orderId}/services/${Number(data.serviceId)}`, { method: "POST" });
      }
      if (button.dataset.tool === "part") {
        await api(`/api/service-orders/${orderId}/spare-parts/${Number(data.sparePartId)}`, { method: "POST" });
      }
      await loadAll();
      render();
      toast("Orden actualizada");
    });
  });
}

function bindStockActions() {
  document.querySelectorAll("[data-stock]").forEach((button) => {
    button.addEventListener("click", async () => {
      const data = Object.fromEntries(new FormData($("stockForm")).entries());
      if (button.dataset.stock === "provider") {
        const result = await api(`/api/spare-parts/provider/${data.sku}/availability`);
        toast(`${result.providerName}: ${result.available ? "disponible" : "no disponible"} (${result.stock})`);
        return;
      }
      await api(`/api/spare-parts/${Number(data.partId)}/stock/${button.dataset.stock}?quantity=${Number(data.quantity)}`, { method: "PATCH" });
      await refresh("Stock actualizado");
    });
  });
}

function bindUserActions() {
  document.querySelectorAll("[data-user-edit]").forEach(button => button.addEventListener("click", () => {
    const user = state.cache.users.find(item => item.id === Number(button.dataset.userEdit));
    if (!user) return;
    const formEl = $("userEditForm");
    formEl.elements.id.value = user.id;
    formEl.elements.name.value = user.name || "";
    formEl.elements.email.value = user.email || "";
    formEl.elements.role.value = user.role || "ROLE_CUSTOMER";
    toast(`Editando ${user.name}`);
  }));
  document.querySelectorAll("[data-user-role]").forEach(button => button.addEventListener("click", async () => {
    const role = prompt("Nuevo rol: ROLE_CUSTOMER, ROLE_MECHANIC o ROLE_ADMINISTRATOR", "ROLE_CUSTOMER");
    if (!role) return;
    await api(`/api/users/${button.dataset.userRole}/role?role=${role}`, { method: "PATCH" });
    await refresh("Rol actualizado");
  }));
  document.querySelectorAll("[data-user-delete]").forEach(button => button.addEventListener("click", async () => {
    if (!confirm("Eliminar este usuario?")) return;
    await api(`/api/users/${button.dataset.userDelete}`, { method: "DELETE" });
    await refresh("Usuario eliminado");
  }));
}

function bindMotorcycleActions() {
  document.querySelectorAll("[data-moto-mileage]").forEach(button => button.addEventListener("click", () => {
    $("mileageForm").elements.id.value = button.dataset.motoMileage;
    toast("Motocicleta seleccionada");
  }));
  document.querySelectorAll("[data-moto-delete]").forEach(button => button.addEventListener("click", async () => {
    if (!confirm("Eliminar esta motocicleta?")) return;
    await api(`/api/motorcycles/${button.dataset.motoDelete}`, { method: "DELETE" });
    await refresh("Motocicleta eliminada");
  }));
}

function bindServiceActions() {
  document.querySelectorAll("[data-service-edit]").forEach(button => button.addEventListener("click", () => {
    const service = state.cache.services.find(item => item.id === Number(button.dataset.serviceEdit));
    if (!service) return;
    const formEl = $("serviceEditForm");
    formEl.elements.id.value = service.id;
    formEl.elements.name.value = service.name || "";
    formEl.elements.basePrice.value = service.basePrice || 0;
    formEl.elements.estimatedTime.value = service.estimatedTime || 0;
    formEl.elements.type.value = service.type || "OIL_CHANGE";
    toast(`Editando ${service.name}`);
  }));
  document.querySelectorAll("[data-service-delete]").forEach(button => button.addEventListener("click", async () => {
    if (!confirm("Eliminar este servicio?")) return;
    await api(`/api/maintenance-services/${button.dataset.serviceDelete}`, { method: "DELETE" });
    await refresh("Servicio eliminado");
  }));
}

function bindPartActions() {
  document.querySelectorAll("[data-part-provider]").forEach(button => button.addEventListener("click", async () => {
    if (!button.dataset.partProvider) {
      toast("Este repuesto no tiene SKU");
      return;
    }
    const result = await api(`/api/spare-parts/provider/${button.dataset.partProvider}/availability`);
    toast(`${result.providerName}: ${result.available ? "disponible" : "no disponible"} (${result.stock})`);
  }));
  document.querySelectorAll("[data-part-edit]").forEach(button => button.addEventListener("click", () => {
    const part = state.cache.parts.find(item => item.id === Number(button.dataset.partEdit));
    if (!part) return;
    const formEl = $("partEditForm");
    formEl.elements.id.value = part.id;
    formEl.elements.name.value = part.name || "";
    formEl.elements.brand.value = part.brand || "";
    formEl.elements.sku.value = part.sku || "";
    formEl.elements.unitPrice.value = part.unitPrice || 0;
    formEl.elements.initialStock.value = part.stock || 0;
    toast(`Editando ${part.name}`);
  }));
  document.querySelectorAll("[data-part-delete]").forEach(button => button.addEventListener("click", async () => {
    if (!confirm("Eliminar este repuesto?")) return;
    await api(`/api/spare-parts/${button.dataset.partDelete}`, { method: "DELETE" });
    await refresh("Repuesto eliminado");
  }));
}

function bindNotificationActions() {
  document.querySelectorAll("[data-notification-read]").forEach(button => button.addEventListener("click", async () => {
    await api(`/api/notifications/${button.dataset.notificationRead}/read`, { method: "PATCH" });
    toast("Notificacion marcada como leida");
    const lookupButton = [...$("sideForm").querySelectorAll("button")].find(btn => btn.textContent === "Buscar notificaciones");
    lookupButton?.click();
  }));
}

$("loginForm").addEventListener("submit", login);
$("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("motofixToken");
  state.token = "";
  state.user = null;
  showApp(false);
});
$("refreshBtn").addEventListener("click", async () => {
  await loadAll();
  render();
  toast("Actualizado");
});
$("searchInput").addEventListener("input", (event) => {
  state.query = event.target.value;
  if (state.token) render();
});

bootstrap();
