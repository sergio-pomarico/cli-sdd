# cli-sdd

CLI para gestionar tareas personales desde la terminal. Guarda los datos localmente en SQLite y
expone el ejecutable global `task`.

## Estado actual

El MVP incluye la creación y el listado de tareas:

- Crear tareas con título, descripción opcional y prioridad.
- Aplicar automáticamente el estado `todo` y la prioridad `medium`.
- Listar las tareas de más reciente a más antigua.
- Persistir los datos entre ejecuciones y directorios de trabajo.
- Inicializar y actualizar automáticamente la base de datos local.

Los comandos de cambio de estado, actualización, eliminación y los filtros de listado están
planificados, pero todavía no están disponibles en el MVP.

## Requisitos

- Linux o macOS.
- Node.js `>=22.13`; se recomienda Node.js 24 LTS.
- pnpm 11.

## Instalación

Clona el repositorio, instala las dependencias y genera el paquete:

```bash
pnpm install
pnpm build
pnpm pack
```

Instala globalmente el archivo generado:

```bash
pnpm add --global ./cli-sdd-1.0.0.tgz
```

Comprueba la instalación desde cualquier directorio:

```bash
task --version
task --help
```

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `task add <title>` | Crea una tarea. |
| `task list` | Lista todas las tareas en orden descendente de creación. |
| `task --help` | Muestra la ayuda general. |
| `task <command> --help` | Muestra la ayuda de un comando. |
| `task --version` | Muestra la versión instalada. |

## Crear tareas

### Sintaxis

```text
task add <title> [--priority <high|medium|low>] [--description <text>]
```

### Argumentos y opciones

| Parámetro | Obligatorio | Descripción |
|---|---:|---|
| `<title>` | Sí | Título de la tarea. No puede estar vacío ni contener solo espacios. |
| `--priority` | No | Prioridad `high`, `medium` o `low`. El valor por defecto es `medium`. |
| `--description` | No | Texto adicional asociado a la tarea. |

### Ejemplos

Crear una tarea con los valores por defecto:

```bash
task add "Preparar la reunión"
```

Salida esperada:

```text
Created task 1 "Preparar la reunión" (todo, medium).
```

Crear una tarea de prioridad alta:

```bash
task add "Revisar la migración" --priority high
```

Crear una tarea con prioridad y descripción:

```bash
task add "Publicar el MVP" \
  --priority high \
  --description "Ejecutar las pruebas y revisar el paquete"
```

## Listar tareas

### Sintaxis

```text
task list
```

Las tareas aparecen de más reciente a más antigua. Si dos tareas tienen la misma fecha, se muestra
primero la que tenga el ID más alto.

La tabla contiene las columnas `ID`, `Title`, `Status`, `Priority` y `Created`. La fecha se muestra
en hora local con el formato `YYYY-MM-DD HH:mm`.

### Ejemplo

```bash
task list
```

Salida de ejemplo:

```text
┌────────┬──────────────────────────┬───────────────┬────────────┬──────────────────┐
│ ID     │ Title                    │ Status        │ Priority   │ Created          │
├────────┼──────────────────────────┼───────────────┼────────────┼──────────────────┤
│ 2      │ Publicar el MVP          │ todo          │ high       │ 2026-09-20 17:18 │
│ 1      │ Preparar la reunión      │ todo          │ medium     │ 2026-09-20 17:15 │
└────────┴──────────────────────────┴───────────────┴────────────┴──────────────────┘
```

Cuando no existen tareas:

```text
No tasks found.
```

## Comandos planificados

Los siguientes comandos forman parte del contrato del CLI, pero aún no están implementados:

| Comando planificado | Descripción |
|---|---|
| `task list --status <status>` | Filtra por estado. |
| `task list --priority <priority>` | Filtra por prioridad. |
| `task status <id> <status>` | Cambia el estado de una tarea. |
| `task update <id> [options]` | Modifica título, descripción o prioridad. |
| `task delete <id> [--force]` | Elimina una tarea con confirmación. |

Ejemplos previstos para versiones posteriores:

```bash
task list --status todo --priority high
task status 1 in-progress
task status 1 done
task update 2 --title "Publicar versión estable" --priority medium
task update 2 --description ""
task delete 2
task delete 2 --force
```

## Persistencia

La base de datos se crea automáticamente en:

```text
~/.task-cli/tasks.db
```

La ubicación no depende del directorio desde el que se ejecuta `task`. El CLI crea el directorio
cuando es necesario y aplica las migraciones empaquetadas antes de abrir la base de datos.

## Errores y códigos de salida

- Las operaciones correctas escriben en stdout y terminan con código `0`.
- Los argumentos inválidos y los fallos de operación escriben un mensaje accionable en stderr y
  terminan con código `1`.
- Los errores esperados no muestran stack traces.

Ejemplo:

```bash
task add "Tarea inválida" --priority urgent
```

```text
error: Priority "urgent" is invalid. Use high, medium, or low.
```

## Desarrollo

| Comando | Uso |
|---|---|
| `pnpm dev <args>` | Ejecuta el CLI desde TypeScript durante el desarrollo. |
| `pnpm typecheck` | Comprueba los tipos sin generar archivos. |
| `pnpm build` | Genera Prisma Client y compila el ejecutable en `dist/`. |
| `pnpm test` | Compila y ejecuta todas las pruebas. |
| `pnpm test:unit` | Ejecuta pruebas unitarias y de comandos. |
| `pnpm test:smoke` | Compila y ejecuta los smoke tests. |

Ejemplo de ejecución durante el desarrollo:

```bash
pnpm dev add "Probar el CLI" --priority low
pnpm dev list
```
