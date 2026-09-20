/speckit.constitution

Este proyecto es un CLI de gestión de tareas construido con TypeScript y SQLite.

Reglas del proyecto:

- Lenguaje y runtime: TypeScript con Node.js (versión LTS) y usar pnpm como gestor de paquetes. Compilar con tsx o similar para ejecución directa.
- Base de datos: SQLite usando prisma ORM. La base de datos se almacena en un archivo local en el directorio del usuario (~/.task-cli/tasks.db).
- Estructura del proyecto: mantener la estructura simple y plana. No usar clean architecture ni capas excesivas para un CLI de este tamaño. Organizar por funcionalidad: commands/, db/, utils/.
- Estilo de código: funcional sobre clases. Usar funciones puras siempre que sea posible. camelCase para variables y funciones. PascalCase solo para tipos e interfaces.
- CLI framework: usar Commander.js para el parseo de argumentos y comandos y inquirer para comandos interactivos.
- Manejo de errores: nunca mostrar stack traces al usuario. Mostrar mensajes claros y accionables. Usar códigos de salida apropiados (0 para éxito, 1 para error).
- Testing: tests unitarios con Vitest. No se requiere cobertura mínima pero toda lógica de negocio debe tener tests.
- Sin dependencias innecesarias: no agregar librerías para cosas que se pueden resolver con pocas líneas de código.
- Output: toda salida al terminal debe ser legible. Usar tablas para listados (con cli-table3 o similar). Colores solo para estados y prioridades.
- El CLI debe ser instalable globalmente con pnpm add -g.
