# Demo PowerBI

API ASP .Net Core + frontend React (Webpack), siguiendo la plantilla de aplicación .Net Core de Visual Studio.

## Preparación

### Azure

Para que la aplicación funcione es necesario que los usuarios (o bien usuarios *master* o bien usuarios *pro*) concedan permisos. **Para los usuarios master es imprescindible [conceder los permisos](https://docs.microsoft.com/en-us/power-bi/developer/register-app#using-the-azure-ad-portal) desde el portal de Azure**. A los usuarios *pro* se les pregunta automáticamente al hacer login en `AD`.

### PowerBI

Para utilizar los servicios de PowerBI embedded es necesario cuentas pro. También es necesario contratar una capacidad para usar la API de generación de Tokens, ya que de forma gratuita está limitada (el límite es desconocido, pero en el desarrollo de la demo durante 15 días hemos llegado a consumir el 20%). Para poder embeder los usuarios deben ser administradores del workspace.

#### Gateway

Para poder pasar identidades al cubo los usuarios deben ser administradores del gateway.

### Cubo

El usuario que pase identidades debe tener algún rol efectivo en el cubo (Acceso a algun dato). Por tanto debe también ser usuario de dominio.

## Identificación y obtención de Tokens

[authetication](https://docs.microsoft.com/en-us/power-bi/developer/get-azuread-access-token)

Para usuarios externos se debe seguir el sistema de generación de Tokens, ya que es la única forma de indicarle identidades al acceder a la fuente de datos. Las cuentas con las que se identifica la aplicación para generar Tokens las llamamos master. Dichas cuentas deben conceder permisos a la aplicación desde el portal de Azure en caso de ser cuentas cuya contraseña se almacena en la aplicación. En caso de ser cuentas que se identifican por AAD, en la misma pantalla de login se les solicitará conceder permisos a la aplicación.

Para usuarios internos la identificación puede mediante [AAD](https://docs.microsoft.com/en-us/power-bi/developer/get-azuread-access-token#access-token-for-power-bi-users-user-owns-data) o almacenando los credenciales de Azure en la aplicación (como cuenta 'master'). Cuando se usa AAD, el usuario debe identificarse a través de una redirección a Azure (debe introducir usuario y contraseña en una pantalla de login de Azure).

### Obtención de Tokens

Para mostrar los reports es obligatorio un token. Este token se puede obtener con la [API de generacion de tokens](link) o usar el token de AAD. La API de generación de Token permite indicar identidades, pero su uso en producción requiere contratar una capacidad.

En caso de usar identificación por AAD los usuarios deben hacer login, y los permisos con el que acceden a los reportes son los mismos que en PowerBI.

## Mostrar los informes

La configuración que se le pasa al `embed()` en javascript es importante, ya que cualquier parámetro mal indicado da un error de identificación genérico (403).

# Vocabulario

- Usuario *pro*: Usuario con cuenta pro que se espera acceda directamente a la aplicación (user owns data).
- Usuario *master*: Usuario con cuenta pro que la aplicación utiliza para operar con identidades (app owns data).
- Identidades: Usuarios definidos en el cubo que pueden no existir en azure.
