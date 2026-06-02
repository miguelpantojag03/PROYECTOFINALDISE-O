# MotoFix System Backend

Backend REST e interfaz web para un Sistema de Gestion de Taller de Motos desarrollado con Java 17, Spring Boot, Spring Web, Spring Data JPA, Spring Security, JWT, Lombok, Validation, MapStruct y base de datos H2 persistente por defecto. Tambien puede configurarse con PostgreSQL o MySQL.

## Estructura del proyecto

- `controller`: endpoints REST para autenticacion, usuarios, motocicletas, ordenes, servicios, inventario, pagos, notificaciones y reportes.
- `dto`: objetos de entrada y salida de la API. Evitan exponer directamente las entidades JPA.
- `exception`: excepciones propias y manejador global con respuestas uniformes.
- `config`: CORS y datos semilla iniciales.
- `security`: JWT, filtro de autenticacion, `UserDetailsService` y configuracion de Spring Security.
- `service`: interfaces de casos de uso.
- `service.impl`: implementaciones con logica de negocio.
- `domain`: interfaces flexibles y estrategias de pago/notificacion.
- `mapper`: conversion de entidades a DTOs con MapStruct.
- `repository`: interfaces Spring Data JPA.
- `entity`: entidades persistentes y relaciones JPA.
- `model`: enums del sistema.
- `util`: constantes o utilidades compartidas.

## POO y diseno aplicado

- Abstraccion: `User` y `ServiceMaintenance` son clases abstractas.
- Herencia: `Customer`, `Mechanic` y `Administrator` heredan de `User`; `OilChange`, `BrakeRepair` y `GeneralInspection` heredan de `ServiceMaintenance`.
- Polimorfismo: cada servicio implementa `calculateCost()` y `getDescription()` de forma distinta.
- Encapsulamiento: la logica de negocio vive en servicios, no en controladores.
- Interfaces: `PaymentMethod`, `NotificationDeliveryChannel` y todas las interfaces de servicio reducen acoplamiento.
- Capas: controller -> service -> repository -> entity.

## Interfaz web

La aplicacion sirve una interfaz operativa desde Spring Boot:

```http
http://localhost:8080/
```

Credenciales demo:

```text
admin@motofix.com / Admin12345
customer@motofix.com / Customer12345
mechanic@motofix.com / Mechanic12345
```

La interfaz incluye dashboard, usuarios, motocicletas, ordenes, servicios, inventario, pagos, notificaciones y reportes.

## Configuracion

Por defecto usa H2 persistente en el directorio local `data/`:

```properties
DB_URL=jdbc:h2:file:./data/motofix;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE
DB_USERNAME=sa
DB_PASSWORD=
DB_DRIVER=org.h2.Driver
```

Consola H2:

```http
http://localhost:8080/h2-console
```

Para PostgreSQL puedes usar:

```properties
DB_URL=jdbc:postgresql://localhost:5432/motofix
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=ChangeThisSecretKeyForMotoFixSystemWithAtLeast32Characters
```

Para MySQL puedes usar:

```properties
DB_URL=jdbc:mysql://localhost:3306/motofix?createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DRIVER=com.mysql.cj.jdbc.Driver
```

## Datos de prueba

Al iniciar la aplicacion se crean:

- Roles: `ROLE_CUSTOMER`, `ROLE_MECHANIC`, `ROLE_ADMINISTRATOR`
- Admin: `admin@motofix.com` / `Admin12345`
- Cliente: `customer@motofix.com` / `Customer12345`
- Mecanico: `mechanic@motofix.com` / `Mechanic12345`
- Motocicleta demo asociada al cliente
- Servicios demo y un repuesto con inventario

## Flujo basico en Postman

1. Login:

```http
POST /api/auth/login
{
  "email": "admin@motofix.com",
  "password": "Admin12345"
}
```

2. Copia el token y usa el header:

```http
Authorization: Bearer <token>
```

3. Crear usuario mecanico:

```http
POST /api/auth/register
{
  "name": "Luis Mechanic",
  "email": "mechanic@motofix.com",
  "password": "Mechanic12345",
  "role": "ROLE_MECHANIC",
  "specialty": "Engine"
}
```

4. Crear motocicleta:

```http
POST /api/motorcycles
{
  "brand": "Yamaha",
  "model": "FZ 2.0",
  "year": 2022,
  "mileage": 15000,
  "plate": "ABC123",
  "vin": "VIN001",
  "customerId": 2
}
```

5. Crear orden:

```http
POST /api/service-orders
{
  "customerId": 2,
  "motorcycleId": 1,
  "diagnostic": "Noise in front brake"
}
```

6. Agregar servicio y repuesto:

```http
POST /api/service-orders/1/services/1
POST /api/service-orders/1/spare-parts/1
GET /api/service-orders/1/total
```

7. Registrar y confirmar pago:

```http
POST /api/payments
{
  "orderId": 1,
  "type": "CASH"
}

PATCH /api/payments/1/confirm
```

## Endpoints principales

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/validate`, `/api/auth/me`
- Usuarios: `/api/users`
- Motocicletas: `/api/motorcycles`
- Ordenes: `/api/service-orders`
- Servicios: `/api/maintenance-services`
- Repuestos e inventario: `/api/spare-parts`
- Pagos: `/api/payments`
- Notificaciones: `/api/notifications`
- Reportes: `/api/reports/orders`, `/api/reports/payments`, `/api/reports/inventory`, `/api/reports/services`
