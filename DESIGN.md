# Design

## Direction

Editorial corporativa para una empresa de software de inventario. La interfaz se siente como un informe operativo digital: precisa, espaciosa y confiable, con una portada modular que conduce a vistas de detalle.

## Visual System

- Fondo marfil muy claro y superficies blancas.
- Verde tinta para marca, titulos y navegacion.
- Azul electrico para acciones, seleccion y cifras principales.
- Coral, amarillo y celeste solo para categorias y estados.
- Tipografia sans de sistema, jerarquia compacta y cifras tabulares.
- Bordes finos, radios moderados y sombras suaves con desplazamiento.

## Composition

- Encabezado persistente con marca, acceso al inicio y estado de simulacion.
- Portada con una introduccion breve, indicadores globales y cuatro bandas de modulo con composiciones distintas segun su contenido.
- Cada modulo abre en la misma pagina mediante rutas hash y contiene resumen, resultados y documentos.
- Los detalles se muestran en paneles progresivos; los dialogos se reservan para el visor documental.

## Interaction

- Transiciones de estado entre 160 y 220 ms.
- Navegacion compatible con historial del navegador.
- Filtros en vivo, pestanas con ARIA, tablas desplazables y acciones de impresion.
- Sin animaciones decorativas ni secuencias de entrada.

## Responsive Behavior

- Escritorio: portada en composicion editorial de dos columnas y tablas completas.
- Tablet: modulos apilados en dos columnas y controles ajustados.
- Movil: una columna, navegacion compacta, tablas con desplazamiento horizontal y acciones a ancho completo.
