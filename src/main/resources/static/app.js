const state = {
  token: localStorage.getItem("motofixToken") || "",
  user: null,
  view: "dashboard",
  query: "",
  filters: {},
  cache: { users: [], motorcycles: [], appointments: [], orders: [], services: [], parts: [], payments: [], auditLogs: [], reports: {} }
};

const views = [
  ["dashboard", "DB", "Dashboard"],
  ["users", "US", "Usuarios"],
  ["motorcycles", "MT", "Motocicletas"],
  ["appointments", "AG", "Agenda"],
  ["orders", "OR", "Ordenes"],
  ["services", "SV", "Servicios"],
  ["inventory", "IN", "Inventario"],
  ["payments", "PG", "Pagos"],
  ["notifications", "NT", "Notificaciones"],
  ["audit", "AU", "Auditoria"],
  ["architecture", "AR", "Arquitectura"],
  ["reports", "RP", "Reportes"]
];

const $ = (id) => document.getElementById(id);
const API_BASE = (window.MOTOFIX_API_BASE_URL || "").replace(/\/$/, "");
const LOCAL_HOSTS = ["localhost", "127.0.0.1", ""];
const DEMO_MODE = !API_BASE && !LOCAL_HOSTS.includes(window.location.hostname);
const money = (v) => Number(v || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });

const demoDb = createDemoDb();

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.remove("hidden");
  setTimeout(() => $("toast").classList.add("hidden"), 2600);
}

async function api(path, options = {}) {
  if (DEMO_MODE) return demoApi(path, options);
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
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

function createDemoDb() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const later = new Date(now.getTime() + 172800000);
  return {
    ids: { users: 6, motorcycles: 4, appointments: 3, orders: 2, services: 3, parts: 2, payments: 2, notifications: 3, auditLogs: 5 },
    users: [
      { id: 1, name: "Miguel Pantoja", email: "admin@motofix.com", role: "ROLE_ADMINISTRATOR", userType: "Administrator" },
      { id: 2, name: "Laura Gomez", email: "laura@demo.com", role: "ROLE_CUSTOMER", userType: "Customer" },
      { id: 3, name: "Carlos Rojas", email: "carlos@demo.com", role: "ROLE_CUSTOMER", userType: "Customer" },
      { id: 4, name: "Andres Mecanico", email: "andres@motofix.com", role: "ROLE_MECHANIC", userType: "Mechanic" },
      { id: 5, name: "Sofia Tecnica", email: "sofia@motofix.com", role: "ROLE_MECHANIC", userType: "Mechanic" }
    ],
    motorcycles: [
      { id: 1, brand: "Yamaha", model: "FZ 2.0", year: 2021, mileage: 18400, plate: "ABC12D", vin: "YAMFZ2021", customerId: 2, customerName: "Laura Gomez" },
      { id: 2, brand: "Honda", model: "CB 190R", year: 2020, mileage: 22650, plate: "XYZ98F", vin: "HONCB190", customerId: 3, customerName: "Carlos Rojas" },
      { id: 3, brand: "Suzuki", model: "Gixxer", year: 2022, mileage: 9100, plate: "JKL45G", vin: "SUZGIX22", customerId: 2, customerName: "Laura Gomez" }
    ],
    appointments: [
      { id: 1, customerId: 2, customerName: "Laura Gomez", motorcycleId: 1, motorcycle: "Yamaha FZ 2.0 ABC12D", scheduledAt: tomorrow.toISOString(), status: "SCHEDULED", reason: "Cambio de aceite", notes: "Cliente espera entrega el mismo dia", createdAt: now.toISOString() },
      { id: 2, customerId: 3, customerName: "Carlos Rojas", motorcycleId: 2, motorcycle: "Honda CB 190R XYZ98F", scheduledAt: later.toISOString(), status: "CHECKED_IN", reason: "Revision de frenos", notes: "Ruido al frenar", createdAt: now.toISOString() }
    ],
    services: [
      { id: 1, name: "Cambio de aceite premium", type: "OIL_CHANGE", basePrice: 55000, estimatedTime: 45, calculatedCost: 76000, description: "Aceite sintetico, filtro y revision rapida" },
      { id: 2, name: "Reparacion de frenos", type: "BRAKE_REPAIR", basePrice: 85000, estimatedTime: 90, calculatedCost: 135000, description: "Pastillas, ajuste y prueba de ruta" },
      { id: 3, name: "Inspeccion general", type: "GENERAL_INSPECTION", basePrice: 45000, estimatedTime: 60, calculatedCost: 60000, description: "Checklist completo de seguridad" }
    ],
    parts: [
      { id: 1, name: "Filtro aceite universal", brand: "MotoPro", sku: "FLT-001", unitPrice: 21000, stock: 20 },
      { id: 2, name: "Pastillas freno disco", brand: "BrakeMax", sku: "BRK-220", unitPrice: 48000, stock: 6 }
    ],
    orders: [],
    payments: [],
    notifications: [
      { id: 1, userId: 2, message: "Tu moto fue recibida en taller.", channel: "EMAIL", readFlag: false, sentAt: now.toISOString() },
      { id: 2, userId: 3, message: "Diagnostico listo para aprobacion.", channel: "SMS", readFlag: false, sentAt: now.toISOString() }
    ],
    auditLogs: [
      { id: 1, action: "SYSTEM_READY", detail: "Modo demo Vercel iniciado", createdAt: now.toISOString() },
      { id: 2, action: "ORDER_CREATED", detail: "Orden demo creada para validar flujo", createdAt: now.toISOString() },
      { id: 3, action: "PAYMENT_CONFIRMED", detail: "Pago demo confirmado", createdAt: now.toISOString() },
      { id: 4, action: "STOCK_CHECKED", detail: "Proveedor local demo activo", createdAt: now.toISOString() }
    ]
  };
}

demoDb.orders.push({
  id: 1,
  customerId: 2,
  customerName: "Laura Gomez",
  motorcycleId: 1,
  motorcycle: "Yamaha FZ 2.0",
  mechanicId: 4,
  mechanicName: "Andres Mecanico",
  status: "IN_PROGRESS",
  diagnostic: "Aceite degradado y filtro obstruido.",
  createdAt: new Date().toISOString(),
  finishedAt: null,
  services: [demoDb.services[0]],
  spareParts: [demoDb.parts[0]],
  total: 97000
});
demoDb.payments.push({ id: 1, orderId: 1, amount: 97000, type: "CARD", status: "CONFIRMED", paidAt: new Date().toISOString() });

async function demoApi(path, options = {}) {
  await new Promise(resolve => setTimeout(resolve, 120));
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const [urlPath, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  const parts = urlPath.split("/").filter(Boolean);

  if (urlPath === "/api/auth/login" && method === "POST") {
    return { token: "demo-token", user: demoDb.users[0] };
  }
  if (urlPath === "/api/auth/me") return demoDb.users[0];
  if (urlPath === "/api/auth/register" && method === "POST") {
    const user = addRow("users", { name: body.name, email: body.email, role: body.role, userType: userType(body.role) });
    log("USER_CREATED", `${user.name} registrado`);
    return { token: "demo-token", user };
  }
  if (urlPath === "/api/auth/validate") return { valid: true };
  if (urlPath === "/api/health") return { status: "UP", service: "motofix-system-demo", checkedAt: new Date().toISOString() };

  if (urlPath === "/api/users" && method === "GET") return demoDb.users;
  if (parts[1] === "users") return handleUsers(parts, method, body, params);
  if (urlPath === "/api/motorcycles" && method === "GET") return demoDb.motorcycles;
  if (parts[1] === "motorcycles") return handleMotorcycles(parts, method, body, params);
  if (urlPath === "/api/appointments" && method === "GET") return demoDb.appointments;
  if (parts[1] === "appointments") return handleAppointments(parts, method, body, params);
  if (urlPath === "/api/service-orders" && method === "GET") return demoDb.orders;
  if (parts[1] === "service-orders") return handleOrders(parts, method, body, params);
  if (urlPath === "/api/maintenance-services" && method === "GET") return demoDb.services;
  if (parts[1] === "maintenance-services") return handleServices(parts, method, body);
  if (urlPath === "/api/spare-parts" && method === "GET") return demoDb.parts;
  if (parts[1] === "spare-parts") return handleParts(parts, method, body, params);
  if (urlPath === "/api/payments" && method === "GET") return demoDb.payments;
  if (parts[1] === "payments") return handlePayments(parts, method, body);
  if (parts[1] === "notifications") return handleNotifications(parts, method, body);
  if (urlPath === "/api/audit-logs") return [...demoDb.auditLogs].reverse();
  if (parts[1] === "reports") return reportFor(parts[2]);
  throw new Error("Ruta demo no implementada");
}

function addRow(collection, row) {
  const next = { id: demoDb.ids[collection]++, ...row };
  demoDb[collection].push(next);
  return next;
}

function findRow(collection, id) {
  const row = demoDb[collection].find(item => item.id === Number(id));
  if (!row) throw new Error("Registro no encontrado");
  return row;
}

function deleteRow(collection, id) {
  demoDb[collection] = demoDb[collection].filter(item => item.id !== Number(id));
}

function log(action, detail) {
  addRow("auditLogs", { action, detail, createdAt: new Date().toISOString() });
}

function userType(role) {
  return ({ ROLE_CUSTOMER: "Customer", ROLE_MECHANIC: "Mechanic", ROLE_ADMINISTRATOR: "Administrator" })[role] || "User";
}

function handleUsers(parts, method, body, params) {
  const id = parts[2];
  if (method === "GET") return findRow("users", id);
  if (method === "PUT") {
    const user = findRow("users", id);
    Object.assign(user, clean(body));
    log("USER_UPDATED", `${user.name} actualizado`);
    return user;
  }
  if (method === "PATCH" && parts[3] === "role") {
    const user = findRow("users", id);
    user.role = params.get("role") || user.role;
    user.userType = userType(user.role);
    log("USER_ROLE_CHANGED", `${user.name} ahora es ${user.role}`);
    return user;
  }
  if (method === "DELETE") {
    deleteRow("users", id);
    log("USER_DELETED", `Usuario #${id} eliminado`);
    return null;
  }
}

function handleMotorcycles(parts, method, body, params) {
  if (method === "POST") {
    const customer = findRow("users", body.customerId);
    const moto = addRow("motorcycles", { ...body, customerName: customer.name });
    log("MOTORCYCLE_CREATED", `${moto.brand} ${moto.model} registrada`);
    return moto;
  }
  const id = parts[2];
  if (method === "GET" && parts[2] === "customer") return demoDb.motorcycles.filter(m => m.customerId === Number(parts[3]));
  if (method === "GET") return findRow("motorcycles", id);
  if (method === "PATCH" && parts[3] === "mileage") {
    const moto = findRow("motorcycles", id);
    moto.mileage = Number(params.get("mileage"));
    log("MOTORCYCLE_MILEAGE_UPDATED", `${moto.plate || moto.id} actualizada`);
    return moto;
  }
  if (method === "DELETE") {
    deleteRow("motorcycles", id);
    log("MOTORCYCLE_DELETED", `Moto #${id} eliminada`);
    return null;
  }
}

function handleAppointments(parts, method, body, params) {
  if (method === "POST") {
    const customer = findRow("users", body.customerId);
    const moto = findRow("motorcycles", body.motorcycleId);
    const appointment = addRow("appointments", {
      ...body,
      customerName: customer.name,
      motorcycle: `${moto.brand} ${moto.model} ${moto.plate || ""}`.trim(),
      status: "SCHEDULED",
      createdAt: new Date().toISOString()
    });
    log("APPOINTMENT_CREATED", `Cita #${appointment.id} creada`);
    return appointment;
  }
  const id = parts[2];
  if (method === "PATCH") {
    const appointment = findRow("appointments", id);
    appointment.status = params.get("status") || appointment.status;
    log("APPOINTMENT_STATUS_CHANGED", `Cita #${id} a ${appointment.status}`);
    return appointment;
  }
  if (method === "DELETE") {
    deleteRow("appointments", id);
    log("APPOINTMENT_DELETED", `Cita #${id} eliminada`);
    return null;
  }
}

function handleOrders(parts, method, body, params) {
  if (method === "POST") {
    const customer = findRow("users", body.customerId);
    const moto = findRow("motorcycles", body.motorcycleId);
    const order = addRow("orders", {
      customerId: customer.id,
      customerName: customer.name,
      motorcycleId: moto.id,
      motorcycle: `${moto.brand} ${moto.model}`,
      mechanicId: null,
      mechanicName: null,
      status: "PENDING",
      diagnostic: body.diagnostic || "",
      createdAt: new Date().toISOString(),
      finishedAt: null,
      services: [],
      spareParts: [],
      total: 0
    });
    log("ORDER_CREATED", `Orden #${order.id} creada`);
    return order;
  }
  const id = parts[2];
  const order = findRow("orders", id);
  if (method === "GET") return parts[3] === "total" ? { total: order.total } : order;
  if (method === "PATCH" && parts[3] === "status") order.status = params.get("status") || order.status;
  if (method === "PATCH" && parts[3] === "mechanic") {
    const mechanic = findRow("users", parts[4]);
    order.mechanicId = mechanic.id;
    order.mechanicName = mechanic.name;
    order.status = "DIAGNOSIS";
  }
  if (method === "PATCH" && parts[3] === "diagnostic") {
    order.diagnostic = body.diagnostic;
    order.status = "DIAGNOSIS";
  }
  if (method === "PATCH" && parts[3] === "finish") {
    order.status = "FINISHED";
    order.finishedAt = new Date().toISOString();
  }
  if (method === "PATCH" && parts[3] === "cancel") order.status = "CANCELLED";
  if (method === "POST" && parts[3] === "services") order.services.push(findRow("services", parts[4]));
  if (method === "POST" && parts[3] === "spare-parts") {
    const part = findRow("parts", parts[4]);
    if (part.stock > 0) part.stock -= 1;
    order.spareParts.push(part);
  }
  recalcOrder(order);
  log("ORDER_UPDATED", `Orden #${id} actualizada`);
  return order;
}

function handleServices(parts, method, body) {
  if (method === "POST") {
    const service = addRow("services", servicePayload(body));
    log("SERVICE_CREATED", `${service.name} creado`);
    return service;
  }
  const service = findRow("services", parts[2]);
  if (method === "PUT") {
    Object.assign(service, servicePayload(body));
    log("SERVICE_UPDATED", `${service.name} actualizado`);
    return service;
  }
  if (method === "DELETE") {
    deleteRow("services", parts[2]);
    log("SERVICE_DELETED", `Servicio #${parts[2]} eliminado`);
    return null;
  }
  return service;
}

function handleParts(parts, method, body, params) {
  if (parts[2] === "provider") {
    const sku = parts[3];
    const part = demoDb.parts.find(item => item.sku === sku);
    return { sku, available: Boolean(part?.stock), stock: part?.stock || 0, providerName: "MotoFix Local Provider" };
  }
  if (method === "POST") {
    const part = addRow("parts", partPayload(body));
    log("SPARE_PART_CREATED", `${part.name} creado`);
    return part;
  }
  const part = findRow("parts", parts[2]);
  if (method === "GET" && parts[3] === "stock") return { stock: part.stock };
  if (method === "PATCH" && parts[3] === "stock") {
    const quantity = Number(params.get("quantity") || 0);
    part.stock += parts[4] === "increase" ? quantity : -quantity;
    if (part.stock < 0) part.stock = 0;
    log("STOCK_UPDATED", `${part.name}: ${part.stock}`);
    return part;
  }
  if (method === "PUT") {
    Object.assign(part, partPayload(body));
    log("SPARE_PART_UPDATED", `${part.name} actualizado`);
    return part;
  }
  if (method === "DELETE") {
    deleteRow("parts", parts[2]);
    log("SPARE_PART_DELETED", `Repuesto #${parts[2]} eliminado`);
    return null;
  }
}

function handlePayments(parts, method, body) {
  if (method === "POST") {
    const order = findRow("orders", body.orderId);
    const payment = addRow("payments", { orderId: order.id, amount: order.total, type: body.type, status: "PENDING", paidAt: null });
    log("PAYMENT_CREATED", `Pago #${payment.id} registrado`);
    return payment;
  }
  if (method === "GET" && parts[2] === "order") return demoDb.payments.find(p => p.orderId === Number(parts[3]));
  if (method === "PATCH" && parts[3] === "confirm") {
    const payment = findRow("payments", parts[2]);
    payment.status = "CONFIRMED";
    payment.paidAt = new Date().toISOString();
    log("PAYMENT_CONFIRMED", `Pago #${payment.id} confirmado`);
    return payment;
  }
}

function handleNotifications(parts, method, body) {
  if (method === "POST") {
    const notification = addRow("notifications", { ...body, readFlag: false, sentAt: new Date().toISOString() });
    log("NOTIFICATION_SENT", `Notificacion #${notification.id} enviada`);
    return notification;
  }
  if (method === "GET" && parts[2] === "user") return demoDb.notifications.filter(n => n.userId === Number(parts[3]));
  if (method === "PATCH" && parts[3] === "read") {
    const notification = findRow("notifications", parts[2]);
    notification.readFlag = true;
    return notification;
  }
}

function servicePayload(body) {
  const calculatedCost = Number(body.basePrice || 0) + Number(body.filterCost || 0) + Number(body.padsCost || 0) + Number(body.laborCost || 0) + Number(body.checklistItems || 0) * 1500;
  return {
    name: body.name,
    type: body.type,
    basePrice: Number(body.basePrice || 0),
    estimatedTime: Number(body.estimatedTime || 0),
    calculatedCost: calculatedCost || Number(body.basePrice || 0),
    description: `${body.type || "Servicio"} operativo`
  };
}

function partPayload(body) {
  return {
    name: body.name,
    brand: body.brand,
    sku: body.sku,
    unitPrice: Number(body.unitPrice || 0),
    stock: Number(body.initialStock || body.stock || 0)
  };
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null && value !== ""));
}

function recalcOrder(order) {
  order.total = [...(order.services || []), ...(order.spareParts || [])]
    .reduce((sum, item) => sum + Number(item.calculatedCost || item.unitPrice || 0), 0);
}

function reportFor(type) {
  if (type === "orders") return groupCount(demoDb.orders, "status");
  if (type === "payments") return groupAmount(demoDb.payments, "status", "amount");
  if (type === "inventory") return demoDb.parts.map(part => ({ name: part.name, count: part.stock, amount: Number(part.unitPrice || 0) * Number(part.stock || 0) }));
  if (type === "services") return groupCount(demoDb.services, "type");
  return [];
}

function groupCount(rows, key) {
  return Object.entries(rows.reduce((acc, row) => ({ ...acc, [row[key]]: (acc[row[key]] || 0) + 1 }), {}))
    .map(([name, count]) => ({ name, count, amount: 0 }));
}

function groupAmount(rows, key, amountKey) {
  return Object.values(rows.reduce((acc, row) => {
    const name = row[key];
    acc[name] ||= { name, count: 0, amount: 0 };
    acc[name].count += 1;
    acc[name].amount += Number(row[amountKey] || 0);
    return acc;
  }, {}));
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
    appointments: c.appointments.filter(a => !["COMPLETED", "CANCELLED"].includes(a.status)).length,
    orders: c.orders.length,
    services: c.services.length,
    inventory: c.parts.length,
    payments: c.payments.length,
    notifications: "",
    audit: c.auditLogs.length,
    architecture: "",
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
  const [users, motorcycles, appointments, orders, services, parts, payments, auditLogs] = await Promise.all([
    api("/api/users"),
    api("/api/motorcycles"),
    api("/api/appointments"),
    api("/api/service-orders"),
    api("/api/maintenance-services"),
    api("/api/spare-parts"),
    api("/api/payments"),
    api("/api/audit-logs")
  ]);
  state.cache = { ...state.cache, users, motorcycles, appointments, orders, services, parts, payments, auditLogs };
  setStatus("Actualizado");
}

function renderMetrics() {
  const c = state.cache;
  const open = c.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).length;
  const scheduled = c.appointments.filter(a => a.status === "SCHEDULED").length;
  const pendingPayments = c.payments.filter(p => p.status !== "CONFIRMED").length;
  $("metrics").innerHTML = [
    ["OR", "Ordenes abiertas", open, "En proceso", "#08766f"],
    ["AG", "Citas programadas", scheduled, "Proximas visitas", "#2563eb"],
    ["MT", "Motos", c.motorcycles.length, "En historial", "#b45309"],
    ["ST", "Stock total", c.parts.reduce((sum, p) => sum + Number(p.stock || 0), 0), `${pendingPayments} pagos pendientes`, "#15803d"]
  ].map(([icon, label, value, note, color]) => `<div class="metric" style="--metric-color:${color}"><i>${icon}</i><div><strong>${value}</strong><span>${label}</span><small>${note}</small></div></div>`).join("");
}

function statusPill(value) {
  const status = String(value || "");
  let tone = "";
  if (["PENDING", "DIAGNOSIS", "IN_PROGRESS", "WAITING_FOR_PARTS", "SCHEDULED"].includes(status)) tone = "pending";
  if (["CONFIRMED", "AVAILABLE", "CHECKED_IN"].includes(status)) tone = "active";
  if (["FINISHED", "COMPLETED"].includes(status)) tone = "done";
  if (["CANCELLED", "REJECTED"].includes(status)) tone = "cancelled";
  return `<span class="pill ${tone}">${status}</span>`;
}

function orderTimeline(status) {
  const steps = ["PENDING", "DIAGNOSIS", "IN_PROGRESS", "WAITING_FOR_PARTS", "FINISHED"];
  const current = steps.indexOf(status);
  const cancelled = status === "CANCELLED";
  return `<div class="statusRail ${cancelled ? "cancelled" : ""}">${steps.map((step, index) => {
    const active = !cancelled && current >= index;
    const currentStep = !cancelled && status === step;
    return `<div class="statusStep ${active ? "active" : ""} ${currentStep ? "current" : ""}"><b>${index + 1}</b><span>${step}</span></div>`;
  }).join("")}${cancelled ? `<div class="statusStep active current"><b>!</b><span>CANCELLED</span></div>` : ""}</div>`;
}

function table(columns, rows) {
  const filtered = filterRows(rows);
  if (!filtered.length) return `<div class="empty">${state.query ? "No hay coincidencias para la busqueda." : "No hay registros todavia."}</div>`;
  return `<div class="tableWrap"><table><thead><tr>${columns.map(c => `<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${
    filtered.map(row => `<tr>${columns.map(c => `<td>${c[1](row)}</td>`).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}

function escapeCsv(value) {
  const text = String(value ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return `"${text.replace(/"/g, '""')}"`;
}

function exportCsv(name, columns, rows) {
  const filtered = filterRows(rows);
  const header = columns.map(column => escapeCsv(column[0])).join(",");
  const body = filtered.map(row => columns.map(column => escapeCsv(column[1](row))).join(",")).join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function filterRows(rows) {
  const query = state.query.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter(row => JSON.stringify(row).toLowerCase().includes(query));
}

function entity(primary, secondary) {
  return `<div class="entityTitle"><strong>${primary || "-"}</strong><span>${secondary || ""}</span></div>`;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function nextAppointmentSlot() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date.toISOString().slice(0, 16);
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

function filterButtons(name, options) {
  const active = state.filters[state.view] || "ALL";
  return `<div class="toolbarGroup">${options.map(([value, label]) =>
    `<button type="button" class="filterBtn ${active === value ? "selected" : ""}" data-filter-name="${name}" data-filter-value="${value}">${label}</button>`
  ).join("")}</div>`;
}

function bindFilterButtons() {
  document.querySelectorAll("[data-filter-value]").forEach(button => button.addEventListener("click", () => {
    state.filters[state.view] = button.dataset.filterValue;
    render();
  }));
}

function activeFilter() {
  return state.filters[state.view] || "ALL";
}

function filteredBy(rows, predicate) {
  const filter = activeFilter();
  return filter === "ALL" ? rows : rows.filter(row => predicate(row, filter));
}

function jumpTo(view) {
  state.view = view;
  render();
}

function bindDashboardActions() {
  document.querySelectorAll("[data-jump-view]").forEach(button => {
    button.addEventListener("click", () => jumpTo(button.dataset.jumpView));
  });
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
    appointments: "Agenda realista para programar recepcion de motos.",
    orders: "Recepcion, diagnostico, asignacion, servicios y cierre de ordenes.",
    services: "Catalogo polimorfico de servicios de mantenimiento.",
    inventory: "Repuestos, stock interno y consulta de proveedor.",
    payments: "Registro y confirmacion de pagos por orden.",
    notifications: "Envio y consulta de comunicaciones por usuario.",
    audit: "Historial de acciones criticas del sistema.",
    architecture: "Vista fiel a la idea de los diagramas: capas, herencia, estrategias y flujo operativo.",
    reports: "Agregados de ordenes, pagos, inventario y servicios."
  };
  $("viewTitle").textContent = label;
  $("panelTitle").textContent = label;
  $("viewSubtitle").textContent = subtitles[state.view] || "Interfaz operativa alineada con los modulos del backend MotoFix.";
  const renderers = { dashboard, users, motorcycles, appointments, orders, services, inventory, payments, notifications, audit, architecture, reports };
  renderers[state.view]();
}

function dashboard() {
  const latest = [...state.cache.orders].reverse().slice(0, 6);
  const activeOrders = state.cache.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).length;
  const lowStock = state.cache.parts.filter(p => Number(p.stock || 0) <= 3).length;
  const revenue = state.cache.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const lowParts = state.cache.parts.filter(p => Number(p.stock || 0) <= 3).slice(0, 4);
  const waitingOrders = state.cache.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).slice(0, 4);
  const nextAppointments = [...state.cache.appointments].filter(a => ["SCHEDULED", "CHECKED_IN"].includes(a.status)).slice(0, 4);
  const finishedOrders = state.cache.orders.filter(o => o.status === "FINISHED").length;
  const completion = state.cache.orders.length ? Math.round((finishedOrders / state.cache.orders.length) * 100) : 0;
  $("dataView").innerHTML = `
    <section class="commandCenter">
      <div>
        <span class="eyebrow">Centro de control</span>
        <h2>${activeOrders} ordenes necesitan seguimiento</h2>
        <p>Recepcion, diagnostico, repuestos, pagos y cierre conectados en una sola operacion.</p>
        <div class="quickActions">
          <button type="button" data-jump-view="orders">Nueva orden</button>
          <button type="button" data-jump-view="appointments">Agendar cita</button>
          <button type="button" data-jump-view="motorcycles">Registrar moto</button>
          <button type="button" data-jump-view="inventory">Mover stock</button>
          <button type="button" data-jump-view="payments">Registrar pago</button>
        </div>
      </div>
      <div class="completionGauge" style="--completion:${completion}%">
        <strong>${completion}%</strong>
        <span>Cierre operativo</span>
      </div>
    </section>
    <div class="dashboardGrid">
      <div class="dashCard"><strong>${activeOrders}</strong><span>Ordenes que requieren seguimiento</span></div>
      <div class="dashCard"><strong>${lowStock}</strong><span>Repuestos con stock bajo</span></div>
      <div class="dashCard"><strong>${money(revenue)}</strong><span>Pagos registrados</span></div>
    </div>
    <div class="opsTimeline">
      ${["Agenda", "Recepcion", "Diagnostico", "Servicio", "Pago", "Entrega"].map((step, index) => `<span><b>${index + 1}</b>${step}</span>`).join("")}
    </div>
    ${table([
    ["ID", o => o.id],
    ["Cliente", o => o.customerName],
    ["Moto", o => o.motorcycle],
    ["Estado", o => statusPill(o.status)],
    ["Total", o => money(o.total)]
  ], latest)}`;
  $("actionPanel").innerHTML = `
    <div class="sideHero">
      <span>Operacion en vivo</span>
      <strong>${activeOrders}</strong>
      <small>ordenes abiertas</small>
    </div>
    <h2>Proceso principal</h2>
    <div class="flow"><span>Registrar cliente</span><span>Crear moto</span><span>Abrir orden</span><span>Asignar tecnico</span><span>Agregar servicio</span><span>Confirmar pago</span></div>
    <hr>
    <h2>Proximas citas</h2>
    <div class="miniList">${nextAppointments.length ? nextAppointments.map(a => `<div class="miniItem"><strong>${a.customerName || ""}</strong><span>${formatDateTime(a.scheduledAt)}</span></div>`).join("") : `<div class="empty">Sin citas pendientes.</div>`}</div>
    <hr>
    <h2>Ordenes activas</h2>
    <div class="miniList">${waitingOrders.length ? waitingOrders.map(o => `<div class="miniItem"><strong>#${o.id} ${o.customerName || ""}</strong>${statusPill(o.status)}</div>`).join("") : `<div class="empty">Sin ordenes activas.</div>`}</div>
    <hr>
    <h2>Stock bajo</h2>
    <div class="miniList">${lowParts.length ? lowParts.map(p => `<div class="miniItem"><strong>${p.name}</strong><span>${p.stock || 0} und.</span></div>`).join("") : `<div class="empty">Stock saludable.</div>`}</div>`;
  bindDashboardActions();
}

function users() {
  const mechanics = state.cache.users.filter(u => u.role === "ROLE_MECHANIC").length;
  const customers = state.cache.users.filter(u => u.role === "ROLE_CUSTOMER").length;
  const rows = filteredBy(state.cache.users, (user, filter) => user.role === filter);
  const columns = [
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
  ];
  $("dataView").innerHTML = `
    ${viewToolbar([`${customers} clientes`, `${mechanics} mecanicos`, `${state.cache.users.length} usuarios`])}
    <div class="toolbar">${filterButtons("role", [["ALL", "Todos"], ["ROLE_CUSTOMER", "Clientes"], ["ROLE_MECHANIC", "Mecanicos"], ["ROLE_ADMINISTRATOR", "Admins"]])}<button class="iconButton" id="exportUsers">Exportar CSV</button></div>
    ${table(columns, rows)}`;
  bindFilterButtons();
  $("exportUsers").addEventListener("click", () => exportCsv("usuarios-motofix", columns, rows));
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
  const rows = filteredBy(state.cache.motorcycles, (moto, filter) => filter === "WITH_PLATE" ? Boolean(moto.plate) : !moto.plate);
  const columns = [
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
  ];
  $("dataView").innerHTML = `
    ${viewToolbar([`${state.cache.motorcycles.length} motos`, `${state.cache.users.filter(u => u.role === "ROLE_CUSTOMER").length} clientes disponibles`])}
    <div class="toolbar">${filterButtons("plate", [["ALL", "Todas"], ["WITH_PLATE", "Con placa"], ["NO_PLATE", "Sin placa"]])}<button class="iconButton" id="exportMotorcycles">Exportar CSV</button></div>
    ${table(columns, rows)}`;
  bindFilterButtons();
  $("exportMotorcycles").addEventListener("click", () => exportCsv("motocicletas-motofix", columns, rows));
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

function appointments() {
  const rows = filteredBy(state.cache.appointments, (appointment, filter) => appointment.status === filter);
  const upcoming = state.cache.appointments.filter(a => ["SCHEDULED", "CHECKED_IN"].includes(a.status)).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = state.cache.appointments.filter(a => String(a.scheduledAt || "").startsWith(today)).length;
  const columns = [
    ["ID", a => a.id],
    ["Fecha", a => entity(formatDateTime(a.scheduledAt), a.reason || "Servicio de taller")],
    ["Cliente", a => entity(a.customerName, `#${a.customerId}`)],
    ["Moto", a => entity(a.motorcycle, `Moto #${a.motorcycleId}`)],
    ["Estado", a => statusPill(a.status)],
    ["Notas", a => a.notes || ""],
    ["Acciones", a => `<div class="actions">
      <button data-appointment-status="CHECKED_IN" data-id="${a.id}">Recibir</button>
      <button data-appointment-status="COMPLETED" data-id="${a.id}">Completar</button>
      <button class="secondary" data-appointment-status="CANCELLED" data-id="${a.id}">Cancelar</button>
      <button class="danger" data-appointment-delete="${a.id}">Eliminar</button>
    </div>`]
  ];
  $("dataView").innerHTML = `
    ${viewToolbar([`${upcoming} pendientes`, `${todayCount} para hoy`, `${state.cache.appointments.length} citas`])}
    <div class="appointmentBoard">
      ${["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map(status => `<div><strong>${state.cache.appointments.filter(a => a.status === status).length}</strong><span>${status}</span></div>`).join("")}
    </div>
    <div class="toolbar">${filterButtons("appointmentStatus", [["ALL", "Todas"], ["SCHEDULED", "Programadas"], ["CHECKED_IN", "Recibidas"], ["COMPLETED", "Completadas"], ["CANCELLED", "Canceladas"]])}<button class="iconButton" id="exportAppointments">Exportar CSV</button></div>
    ${table(columns, rows)}`;
  bindFilterButtons();
  $("exportAppointments").addEventListener("click", () => exportCsv("agenda-motofix", columns, rows));
  $("actionPanel").innerHTML = `
    <form id="appointmentForm" class="formGrid">
      <h2>Nueva cita</h2>
      ${formSelect("customerId", "Cliente", optionList(state.cache.users.filter(u => u.role === "ROLE_CUSTOMER"), u => `${u.name} - #${u.id}`))}
      ${formSelect("motorcycleId", "Motocicleta", optionList(state.cache.motorcycles, m => `${m.brand} ${m.model} ${m.plate || ""} - #${m.id}`))}
      ${input("scheduledAt", "Fecha y hora", "datetime-local", nextAppointmentSlot(), "required")}
      ${input("reason", "Motivo", "text", "Revision de taller")}
      ${area("notes", "Notas de recepcion")}
      <button type="submit">Agendar cita</button>
    </form>
    <hr>
    <h2>Operacion realista</h2>
    <div class="ruleList">
      <div><b>Antes de la orden</b><span>La cita organiza llegada, cliente y moto.</span></div>
      <div><b>Recepcion</b><span>Al recibir la moto puedes crear una orden desde el modulo Ordenes.</span></div>
      <div><b>Auditoria</b><span>Crear, cambiar estado o eliminar cita queda en logs.</span></div>
    </div>`;
  $("appointmentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = toPayload(event.currentTarget);
    await api("/api/appointments", { method: "POST", body: JSON.stringify(data) });
    await refresh("Cita agendada");
  });
  bindAppointmentActions();
}

function orders() {
  const open = state.cache.orders.filter(o => !["FINISHED", "CANCELLED"].includes(o.status)).length;
  const finished = state.cache.orders.filter(o => o.status === "FINISHED").length;
  const rows = filteredBy(state.cache.orders, (order, filter) => order.status === filter);
  const columns = [
    ["ID", o => o.id],
    ["Cliente", o => entity(o.customerName, `#${o.customerId}`)],
    ["Moto", o => entity(o.motorcycle, `Moto #${o.motorcycleId}`)],
    ["Mecanico", o => o.mechanicName || "Sin asignar"],
    ["Estado", o => statusPill(o.status)],
    ["Total", o => money(o.total)],
    ["Acciones", o => `<div class="actions">
      <button data-action="detail" data-id="${o.id}">Detalle</button>
      <button data-action="total" data-id="${o.id}">Total</button>
      <button data-action="progress" data-id="${o.id}">En progreso</button>
      <button data-action="parts" data-id="${o.id}">Esperando</button>
      <button data-action="finish" data-id="${o.id}">Finalizar</button>
      <button class="secondary" data-action="cancel" data-id="${o.id}">Cancelar</button>
    </div>`]
  ];
  $("dataView").innerHTML = `
    ${viewToolbar([`${open} abiertas`, `${finished} finalizadas`, `${money(state.cache.orders.reduce((s, o) => s + Number(o.total || 0), 0))} en ordenes`])}
    <div class="kanban">${["PENDING", "DIAGNOSIS", "IN_PROGRESS", "WAITING_FOR_PARTS", "FINISHED", "CANCELLED"].map(status => `<div class="kanbanCol"><strong>${state.cache.orders.filter(o => o.status === status).length}</strong><span>${status}</span></div>`).join("")}</div>
    <div class="toolbar">${filterButtons("status", [["ALL", "Todas"], ["PENDING", "Pendientes"], ["DIAGNOSIS", "Diagnostico"], ["IN_PROGRESS", "En progreso"], ["WAITING_FOR_PARTS", "Esperando"], ["FINISHED", "Finalizadas"], ["CANCELLED", "Canceladas"]])}<button class="iconButton" id="exportOrders">Exportar CSV</button></div>
    ${table(columns, rows)}`;
  bindFilterButtons();
  $("exportOrders").addEventListener("click", () => exportCsv("ordenes-motofix", columns, rows));
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
  const rows = filteredBy(state.cache.services, (service, filter) => service.type === filter);
  const columns = [
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
  ];
  $("dataView").innerHTML = `
    ${viewToolbar([`${state.cache.services.length} servicios`, `${money(state.cache.services.reduce((s, item) => s + Number(item.calculatedCost || 0), 0))} costo catalogo`])}
    <div class="toolbar">${filterButtons("type", [["ALL", "Todos"], ["OIL_CHANGE", "Aceite"], ["BRAKE_REPAIR", "Frenos"], ["GENERAL_INSPECTION", "Inspeccion"]])}<button class="iconButton" id="exportServices">Exportar CSV</button></div>
    ${table(columns, rows)}`;
  bindFilterButtons();
  $("exportServices").addEventListener("click", () => exportCsv("servicios-motofix", columns, rows));
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
  const rows = filteredBy(state.cache.parts, (part, filter) => filter === "LOW" ? Number(part.stock || 0) <= 3 : Number(part.stock || 0) > 3);
  const columns = [
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
  ];
  $("dataView").innerHTML = `
    ${viewToolbar([`${state.cache.parts.length} repuestos`, `${low} stock bajo`, `${state.cache.parts.reduce((s, p) => s + Number(p.stock || 0), 0)} unidades`])}
    <div class="toolbar">${filterButtons("stock", [["ALL", "Todos"], ["LOW", "Stock bajo"], ["OK", "Stock OK"]])}<button class="iconButton" id="exportInventory">Exportar CSV</button></div>
    ${table(columns, rows)}`;
  bindFilterButtons();
  $("exportInventory").addEventListener("click", () => exportCsv("inventario-motofix", columns, rows));
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
  const rows = filteredBy(state.cache.payments, (payment, filter) => payment.status === filter);
  const columns = [
    ["ID", p => p.id],
    ["Orden", p => p.orderId],
    ["Monto", p => money(p.amount)],
    ["Tipo", p => p.type],
    ["Estado", p => statusPill(p.status)],
    ["Acciones", p => `<div class="actions"><button data-pay="${p.id}">Confirmar</button></div>`]
  ];
  $("dataView").innerHTML = `
    ${viewToolbar([`${confirmed} confirmados`, `${state.cache.payments.length - confirmed} pendientes`, `${money(state.cache.payments.reduce((s, p) => s + Number(p.amount || 0), 0))} total`])}
    <div class="toolbar">${filterButtons("payment", [["ALL", "Todos"], ["PENDING", "Pendientes"], ["CONFIRMED", "Confirmados"], ["REJECTED", "Rechazados"]])}<button class="iconButton" id="exportPayments">Exportar CSV</button></div>
    ${table(columns, rows)}`;
  bindFilterButtons();
  $("exportPayments").addEventListener("click", () => exportCsv("pagos-motofix", columns, rows));
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

function audit() {
  const rows = [...state.cache.auditLogs];
  const columns = [
    ["ID", log => log.id],
    ["Accion", log => statusPill(log.action)],
    ["Detalle", log => log.detail || ""],
    ["Fecha", log => log.createdAt || ""]
  ];
  const orderEvents = rows.filter(log => String(log.action || "").startsWith("ORDER")).length;
  const paymentEvents = rows.filter(log => String(log.action || "").startsWith("PAYMENT")).length;
  const stockEvents = rows.filter(log => String(log.action || "").includes("STOCK") || String(log.action || "").includes("SPARE_PART")).length;
  $("dataView").innerHTML = `
    ${viewToolbar([`${rows.length} eventos`, `${orderEvents} ordenes`, `${paymentEvents} pagos`, `${stockEvents} inventario`])}
    <div class="toolbar"><div class="toolbarGroup"><span class="chip">Ultimos 100 eventos</span><span class="chip">Fuente: tabla logs</span></div><button class="iconButton" id="exportAudit">Exportar CSV</button></div>
    ${table(columns, rows)}`;
  $("exportAudit").addEventListener("click", () => exportCsv("auditoria-motofix", columns, rows));
  $("actionPanel").innerHTML = `
    <h2>Control de cumplimiento</h2>
    <p>Esta seccion cubre la tabla de logs indicada en los diagramas de despliegue y desarrollo.</p>
    <hr>
    <div class="ruleList">
      <div><b>Ordenes</b><span>Creacion, asignacion, diagnostico, servicios, repuestos y estados.</span></div>
      <div><b>Pagos</b><span>Registro y confirmacion de pagos.</span></div>
      <div><b>Inventario</b><span>Creacion, edicion, eliminacion y movimientos de stock.</span></div>
      <div><b>Notificaciones</b><span>Envio y lectura por canal.</span></div>
    </div>
    <hr>
    <button type="button" id="refreshAudit">Actualizar auditoria</button>`;
  $("refreshAudit").addEventListener("click", async () => {
    state.cache.auditLogs = await api("/api/audit-logs");
    render();
    toast("Auditoria actualizada");
  });
}

async function reports() {
  const reports = await Promise.all([
    api("/api/reports/orders"),
    api("/api/reports/payments"),
    api("/api/reports/inventory"),
    api("/api/reports/services")
  ]);
  const names = ["Ordenes", "Pagos", "Inventario", "Servicios"];
  const allRows = reports.flat();
  $("dataView").innerHTML = `
    <div class="dashboardGrid">
      <div class="dashCard"><strong>${state.cache.orders.length}</strong><span>Ordenes registradas</span></div>
      <div class="dashCard"><strong>${money(state.cache.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0))}</strong><span>Valor en pagos</span></div>
      <div class="dashCard"><strong>${state.cache.parts.reduce((sum, p) => sum + Number(p.stock || 0), 0)}</strong><span>Unidades en inventario</span></div>
    </div>
    <div class="reportGrid">${reports.map((rows, index) => `<section class="reportCard"><h2>${names[index]}</h2>${reportBars(rows)}</section>`).join("")}</div>
    ${reports.map((rows, index) => `<h2>${names[index]}</h2>${table([
    ["Categoria", r => r.label || r.name || r.category || Object.values(r)[0]],
    ["Cantidad", r => r.count || Object.values(r)[1] || 0],
    ["Valor", r => money(r.amount || Object.values(r)[2] || 0)]
  ], rows)}`).join("")}`;
  $("actionPanel").innerHTML = `<h2>Reportes</h2><p>Datos agregados desde los servicios del backend.</p><button class="iconButton" id="exportReports">Exportar todo</button>`;
  $("exportReports").addEventListener("click", () => exportCsv("reportes-motofix", [["Nombre", r => r.name], ["Cantidad", r => r.count], ["Valor", r => r.amount]], allRows));
}

function architecture() {
  const c = state.cache;
  const activeOrders = c.orders.filter(order => !["FINISHED", "CANCELLED"].includes(order.status));
  const closedOrders = c.orders.filter(order => ["FINISHED", "CANCELLED"].includes(order.status));
  const lowStock = c.parts.filter(part => Number(part.stock || 0) <= 3);
  const confirmedPayments = c.payments.filter(payment => payment.status === "CONFIRMED");
  const totalRevenue = confirmedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const lastOrders = [...c.orders].reverse().slice(0, 5);
  const serviceTypes = ["OIL_CHANGE", "BRAKE_REPAIR", "GENERAL_INSPECTION"];
  const paymentTypes = ["CASH", "CARD", "TRANSFER"];
  const notificationTypes = ["EMAIL", "SMS", "PUSH"];
  $("dataView").innerHTML = `
    ${viewToolbar([
      `${c.users.length} usuarios`,
      `${c.motorcycles.length} motos`,
      `${activeOrders.length} ordenes activas`,
      `${lowStock.length} alertas de stock`
    ])}
    <div class="architectureGrid">
      <section class="diagramPanel wide">
        <div class="diagramHeader">
          <h2>Flujo del taller</h2>
          <span>Secuencia principal</span>
        </div>
        <div class="processRail">
          ${["Login JWT", "Usuario", "Moto", "Agenda", "Orden", "Diagnostico", "Servicio", "Repuesto", "Pago", "Notificacion", "Reporte"].map((label, index) =>
            `<div class="processStep"><b>${String(index + 1).padStart(2, "0")}</b><span>${label}</span></div>`
          ).join("")}
        </div>
      </section>
      <section class="diagramPanel">
        <div class="diagramHeader">
          <h2>5 capas del sistema</h2>
          <span>Desarrollo + despliegue</span>
        </div>
        <div class="layerStack">
          ${[
            ["Capa 1", "Presentacion", "HTML, CSS, JavaScript"],
            ["Capa 2", "API REST", "controller, dto, exception, security"],
            ["Capa 3", "Negocio", "service, service.impl, domain, mapper"],
            ["Capa 4", "Datos", "repository, entity, model, util"],
            ["Capa 5", "Infraestructura", "Docker, PostgreSQL, Redis, H2 local"]
          ].map(([level, title, detail]) =>
            `<div><strong>${level} - ${title}</strong><small>${detail}</small></div>`
          ).join("")}
        </div>
      </section>
      <section class="diagramPanel">
        <div class="diagramHeader">
          <h2>Usuarios</h2>
          <span>Herencia</span>
        </div>
        <div class="classTree">
          <div class="classNode root"><strong>User</strong><span>abstract</span></div>
          <div class="classBranches">
            <div class="classNode"><strong>Customer</strong><span>${c.users.filter(u => u.role === "ROLE_CUSTOMER").length} activos</span></div>
            <div class="classNode"><strong>Mechanic</strong><span>${c.users.filter(u => u.role === "ROLE_MECHANIC").length} activos</span></div>
            <div class="classNode"><strong>Administrator</strong><span>${c.users.filter(u => u.role === "ROLE_ADMINISTRATOR").length} activos</span></div>
          </div>
        </div>
      </section>
      <section class="diagramPanel">
        <div class="diagramHeader">
          <h2>Servicios</h2>
          <span>Polimorfismo</span>
        </div>
        <div class="classTree">
          <div class="classNode root"><strong>ServiceMaintenance</strong><span>calculateCost()</span></div>
          <div class="classBranches">
            ${serviceTypes.map(type => `<div class="classNode"><strong>${type}</strong><span>${c.services.filter(s => s.type === type).length} registros</span></div>`).join("")}
          </div>
        </div>
      </section>
      <section class="diagramPanel">
        <div class="diagramHeader">
          <h2>Estrategias</h2>
          <span>Interfaces</span>
        </div>
        <div class="strategyGrid">
          <div class="interfaceNode"><strong>PaymentMethod</strong>${paymentTypes.map(type => `<span>${type}: ${c.payments.filter(p => p.type === type).length}</span>`).join("")}</div>
          <div class="interfaceNode"><strong>NotificationDeliveryChannel</strong>${notificationTypes.map(type => `<span>${type}</span>`).join("")}</div>
        </div>
      </section>
      <section class="diagramPanel">
        <div class="diagramHeader">
          <h2>Reglas activas</h2>
          <span>Validaciones</span>
        </div>
        <div class="ruleList">
          <div><b>Orden cerrada</b><span>No permite agregar servicios, repuestos ni diagnostico.</span></div>
          <div><b>Pago unico</b><span>Evita duplicar pagos para la misma orden.</span></div>
          <div><b>Stock valido</b><span>No acepta movimientos de inventario menores o iguales a cero.</span></div>
          <div><b>Persistencia</b><span>H2 guarda datos en el directorio local data/.</span></div>
        </div>
      </section>
      <section class="diagramPanel wide">
        <div class="diagramHeader">
          <h2>Trazabilidad del negocio</h2>
          <span>Datos actuales</span>
        </div>
        <div class="traceGrid">
          <div><strong>${c.users.filter(u => u.role === "ROLE_CUSTOMER").length}</strong><span>Clientes</span></div>
          <div><strong>${c.motorcycles.length}</strong><span>Motos vinculadas</span></div>
          <div><strong>${c.appointments.length}</strong><span>Citas agenda</span></div>
          <div><strong>${c.orders.length}</strong><span>Ordenes creadas</span></div>
          <div><strong>${c.services.length}</strong><span>Servicios catalogo</span></div>
          <div><strong>${c.parts.length}</strong><span>Repuestos</span></div>
          <div><strong>${money(totalRevenue)}</strong><span>Pagos confirmados</span></div>
        </div>
      </section>
    </div>`;
  $("actionPanel").innerHTML = `
    <h2>Lectura rapida</h2>
    <div class="miniList">
      <div class="miniItem"><strong>Ordenes activas</strong><span>${activeOrders.length}</span></div>
      <div class="miniItem"><strong>Ordenes cerradas</strong><span>${closedOrders.length}</span></div>
      <div class="miniItem"><strong>Stock bajo</strong><span>${lowStock.length}</span></div>
      <div class="miniItem"><strong>Pagos confirmados</strong><span>${confirmedPayments.length}</span></div>
    </div>
    <hr>
    <h2>Ultimas ordenes</h2>
    <div class="miniList">${lastOrders.length ? lastOrders.map(order =>
      `<button type="button" class="traceOrder" data-arch-order="${order.id}"><strong>#${order.id} ${order.customerName || ""}</strong>${statusPill(order.status)}</button>`
    ).join("") : `<div class="empty">Sin ordenes registradas.</div>`}</div>
    <hr>
    <h2>Fidelidad al diseno</h2>
    <p>Esta vista mantiene la idea de los diagramas: separa capas, muestra herencia, aplica interfaces y sigue el flujo cliente-moto-orden-pago-notificacion.</p>`;
  document.querySelectorAll("[data-arch-order]").forEach(button => button.addEventListener("click", () => {
    const order = c.orders.find(item => item.id === Number(button.dataset.archOrder));
    if (order) $("actionPanel").innerHTML = orderDetail(order);
  }));
}

function reportBars(rows) {
  if (!rows.length) return `<div class="empty">Sin datos.</div>`;
  const max = Math.max(...rows.map(row => Number(row.count || 0)), 1);
  return `<div class="barList">${rows.map(row => {
    const count = Number(row.count || 0);
    const width = Math.max(6, Math.round((count / max) * 100));
    return `<div class="barRow"><span>${row.name}</span><div class="barTrack"><div style="width:${width}%"></div></div><strong>${count}</strong></div>`;
  }).join("")}</div>`;
}

function orderDetail(order) {
  return `
    <h2>Orden #${order.id}</h2>
    ${orderTimeline(order.status)}
    <div class="detailCard">
      <span>Cliente</span><strong>${order.customerName || "-"}</strong>
      <span>Moto</span><strong>${order.motorcycle || "-"}</strong>
      <span>Mecanico</span><strong>${order.mechanicName || "Sin asignar"}</strong>
      <span>Estado</span>${statusPill(order.status)}
      <span>Total</span><strong>${money(order.total)}</strong>
    </div>
    <hr>
    <h2>Diagnostico</h2>
    <p>${order.diagnostic || "Sin diagnostico registrado."}</p>
    <hr>
    <h2>Servicios</h2>
    <div class="miniList">${order.services?.length ? order.services.map(item => `<div class="miniItem"><strong>${item.name}</strong><span>${money(item.calculatedCost)}</span></div>`).join("") : `<div class="empty">Sin servicios.</div>`}</div>
    <hr>
    <h2>Repuestos</h2>
    <div class="miniList">${order.spareParts?.length ? order.spareParts.map(item => `<div class="miniItem"><strong>${item.name}</strong><span>${money(item.unitPrice)}</span></div>`).join("") : `<div class="empty">Sin repuestos.</div>`}</div>`;
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
      if (button.dataset.action === "detail") {
        const order = state.cache.orders.find(item => item.id === Number(id)) || await api(`/api/service-orders/${id}`);
        $("actionPanel").innerHTML = orderDetail(order);
        return;
      }
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

function bindAppointmentActions() {
  document.querySelectorAll("[data-appointment-status]").forEach(button => button.addEventListener("click", async () => {
    await api(`/api/appointments/${button.dataset.id}/status?status=${button.dataset.appointmentStatus}`, { method: "PATCH" });
    await refresh("Cita actualizada");
  }));
  document.querySelectorAll("[data-appointment-delete]").forEach(button => button.addEventListener("click", async () => {
    if (!confirm("Eliminar esta cita?")) return;
    await api(`/api/appointments/${button.dataset.appointmentDelete}`, { method: "DELETE" });
    await refresh("Cita eliminada");
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
