---
tags:
  - programing
created_at: 2026-09-07
---
# Spec-Driven Development (SDD)

## ¿Qué es SDD?

El _Spec-Driven Development_ (SDD), o desarrollo dirigido por especificaciones, es una forma de desarrollar software con IA en la que se crea una **especificación** antes de escribir código. Esta especificación es un documento estructurado que describe los requisitos que debe cumplir el software.

La especificación se convierte en el principal artefacto de comunicación con la IA, por encima de prompts aislados, porque ofrece una estructura más formal para definir qué hará el software y bajo qué condiciones debe hacerlo.

En este enfoque, la especificación describe el **qué** y el **por qué** de la solución, mientras que el código representa el **cómo**. Su propósito es dejar clara la intención del equipo, las decisiones tomadas y las razones que las sustentan.

### Antecedentes del SDD

La sonda _Mariner 1_ tenía como misión sobrevolar Venus. Fue lanzada el 22 de julio de 1962, pero la misión tuvo que ser abortada después de que un fallo de software contribuyera a que se desviara de su trayectoria. El incidente se relacionó con un error en una fórmula y problemas en los datos de radar. Además, el sistema no contaba con una estrategia adecuada para manejar esa situación anómala.

Este tipo de errores reforzó una idea fundamental en la ingeniería de software: cuando un fallo puede comprometer una misión, es necesario definir con anticipación cómo debe comportarse el sistema, incluidos los casos de error y las situaciones inesperadas.

Margaret Hamilton, quien dirigió el equipo de software de navegación de las misiones Apolo, impulsó una visión más rigurosa del desarrollo de software. En la década de 1960, la programación se consideraba con frecuencia una actividad artesanal y poco formal. Hamilton defendía que crear software debía tratarse con la misma seriedad que construir un puente o un avión, y ayudó a consolidar el término **ingeniería de software**.

El 20 de julio de 1969, pocos minutos antes del alunizaje del Apolo 11, se activaron alarmas en la computadora del módulo lunar debido a una sobrecarga de tareas. El software estaba diseñado para priorizar las operaciones esenciales y descartar las menos importantes, lo que permitió continuar con la misión. Aunque estos hechos no constituyen SDD en el sentido moderno, muestran el valor de definir con precisión el comportamiento esperado del sistema antes de implementarlo.

¿Por qué se habla nuevamente de este enfoque? Durante décadas, escribir código fue una de las partes más costosas del desarrollo. Con la IA, implementar código se ha vuelto más rápido y barato. Por ello, el principal reto ya no es únicamente construir una solución, sino tener claridad sobre qué se debe construir.

El _vibe coding_ es una forma rápida de desarrollar software con IA, en la que se delegan muchas decisiones a la herramienta. Aunque puede resultar útil para experimentar o crear prototipos, puede reducir el control sobre la mantenibilidad, la escalabilidad y la calidad del software si no existe una intención clara detrás de la solución.

Hoy la IA puede generar una gran parte del código, pero el desafío consiste en asegurar que produzca código correcto, seguro y mantenible. Para ello se utilizan mecanismos como el _context engineering_, las _skills_, los MCP y otras herramientas de control. Sin embargo, ninguna de ellas sustituye la necesidad de definir con claridad qué se quiere construir. Sin una especificación adecuada, la IA puede implementar una solución técnicamente correcta para el problema equivocado.

### Qué no es SDD

SDD no consiste en documentar por documentar ni en crear especificaciones sin un propósito claro. Una especificación útil debe ayudar a tomar decisiones, orientar la implementación y facilitar la validación del resultado.

## El flujo de desarrollo clásico

SDD no busca reemplazar el ciclo tradicional de desarrollo de software. En realidad, adapta sus etapas para aprovechar la IA de manera más efectiva.

1. **Planificación**  
    Antes de desarrollar, es necesario definir para qué servirá el software. Preguntas como «¿qué problema resolvemos?», «¿para quién lo resolvemos?» y «¿vale la pena resolverlo?» ayudan a delimitar el problema y evaluar posibles soluciones.
    
2. **Análisis de requisitos**  
    Una vez entendido el problema, se define lo que el sistema debe hacer. En esta etapa se responden preguntas como: «¿qué hace exactamente el sistema?» y «¿qué requisitos debe cumplir?».
    
3. **Diseño**  
    Con el problema y los requisitos claros, se decide cómo se construirá la solución: arquitectura, componentes, datos e interacciones.
    
4. **Implementación**  
    En esta fase se desarrolla el código que materializa el diseño definido.
    
5. **Pruebas**  
    Se verifica que el software cumpla los requisitos establecidos y que se comporte correctamente ante distintos escenarios.
    
6. **Despliegue**  
    La solución se pone en producción o se entrega a sus usuarios.
    
7. **Mantenimiento, mejora y corrección**  
	Se corrigen errores detectados después del despliegue, se realizan mejoras y se incorporan nuevas necesidades de los usuarios.

Este flujo puede repetirse como un ciclo. Cada vez que se agrega una nueva funcionalidad, se recorren nuevamente estas etapas, aunque con un alcance limitado a esa funcionalidad.

SDD no añade etapas completamente nuevas; toma este ciclo tradicional y lo adapta para trabajar de forma efectiva con IA. Por ello, existen equivalencias directas entre ambas formas de desarrollo.

### Equivalencias entre el ciclo de desarrollo y SDD

![[sdd-ciclo.png]]

## Tipos de SDD

SDD no es un estándar único. Así como no existe una sola manera de aplicar el ciclo de desarrollo de software, cada equipo adapta el enfoque según sus prácticas, conocimientos y necesidades.

Una forma de distinguir los enfoques de SDD es responder la siguiente pregunta: **¿qué ocurre con la especificación una vez que el código ha sido implementado?**

### Spec-first

En este enfoque, la especificación inicia el desarrollo, pero puede descartarse después de implementar el código. A partir de ese momento, el código se convierte en la fuente principal de verdad.

El compromiso con la especificación es bajo. Un ejemplo sería pedirle a un agente que cree un plan para una tarea y desecharlo después de completar la implementación.

### Spec-anchored

En este enfoque, la especificación acompaña al código durante todo su ciclo de vida. Si cambia el código, la especificación se actualiza; si cambia la especificación, el código debe ajustarse en consecuencia.

La fuente de verdad está compuesta por el código y la especificación, que deben mantenerse sincronizados. El compromiso con la especificación es intermedio.

### Spec as a source

Este enfoque implica el mayor nivel de compromiso con la especificación. La especificación se convierte en la fuente principal de verdad y el código puede generarse o regenerarse a partir de ella.

Si la especificación no permite generar una solución correcta para el problema, debe revisarse y mejorarse. En este modelo, el código es una consecuencia de la especificación, no el artefacto principal.




